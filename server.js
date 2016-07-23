var express			= require('express'),
	app				= express(),
	bodyParser		= require('body-parser'),
	morgan			= require('morgan'),
	mongoose		= require('mongoose'),
	jwt				= require('jsonwebtoken'),
	config			= require('./config'),
	validator 		= require('validator'),
	md5 			= require('md5'),
	User			= require('./app/models/user');

var port = process.env.PORT || 3000;

mongoose.connect(config.database);

app.set('superSecret', config.secret);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.get('/', function(req, res) {
	res.send('Ok - http://localhost:' + port);
});

var validateNewUser = function(user){
	var result = {
		success: true
	}
	
	if(!user.email || !validator.isEmail(user.email)){
		result = { success: false, mensagem: "Informe um e-mail válido" }
	} else if(!user.nome || !validator.isAlpha(user.nome)){
		result = { success: false, mensagem: "Informe um nome válido" }
	} else if(user.telefones){	
		for(var i = 0; i < user.telefones.length; i++){
			var telefone = user.telefones[i];
			
			if(!validator.isNumeric(telefone.numero) || !validator.isNumeric(telefone.ddd) || !validator.isLength(telefone.numero, {min: 8, max: 9}) || !validator.isLength(telefone.ddd, {min: 2, max: 2})){
				result = { success: false, mensagem: "Informe telefones válidos" }
				
				break;
			}
		}
	}
	
	return result;
}

app.post('/signup', function(req, res) {
	var result = validateNewUser(req.body);
	
	if(result.success){
		User.findOne({
			email: req.body.email
		}, function(err, user) {
			if (err){
				res.status(500).send({ success: false, mensagem: "Erro ao tentar efetuar cadastro, tente novamente" });
			} else{
				if (user) {
					res.json({ success: false, mensagem: "E-mail já existente" });
				} else {	
					user = new User({ 
						email: req.body.email,
						senha: md5(req.body.senha),
						nome: req.body.nome,
						telefones: req.body.telefones,
						data_criacao: new Date(),
						data_atualizacao: new Date(),
						ultimo_login: new Date()
					});
					
					user.save(function(err) {
						if (err){
							console.log(err);
							
							res.status(500).send({ success: false, mensagem: "Erro ao tentar efetuar cadastro, tente novamente" });
						}else{
							user.senha = null;
						
							var token = jwt.sign(user, app.get('superSecret'));
						
							res.json({
								success: true,
								user: user,
								token: token
							});
						}
					});
				}
			}
		});
	} else{
		res.json(result);
	}
});

var apiRoutes = express.Router();

apiRoutes.post('/singin', function(req, res) {
	if(validator.isEmail(req.body.email)){
		User.findOne({
			email: req.body.email
		}, function(err, user) {
			if (err){
				console.log(err);
				
				res.status(500).send({ success: false, mensagem: "Erro ao tentar efetuar login, tente novamente" });
			} else if (!user) {
					res.json({ success: false, mensagem: "Usuário e/ou senha inválidos" });
			} else if (!user.comparePassword(req.body.senha)) {
					res.status(401).send({ success: false, mensagem: "Senha inválida" });
			} else {				
				user.ultimo_login = new Date();
				
				user.save(function(err) {
					if (err){
						console.log(err);
						
						res.status(500).send({ success: false, mensagem: "Erro ao tentar efetuar login, tente novamente" });
					} else{
						user.senha = null;
								
						var token = jwt.sign(user, app.get('superSecret'), {expiresIn: 1800});
								
						res.json({
							success: true,
							user: user,
							token: token
						});
					}
				});
			}			
		});
	} else{
		res.json({ success: false, mensagem: "Informe um e-mail válido" });
	}
});

apiRoutes.use(function(req, res, next) {
	var bearerToken = req.headers['authorization'].split(' ');
	
	if(bearerToken[0].toLowerCase() == 'bearer') {
		var token = bearerToken[1];
		
		if (token) {
			jwt.verify(token, app.get('superSecret'), function(err, decoded) {			
				if (err) {
					res.status(403).send({ success: false, mensagem: "Não autorizado" });		
				} else {
					req.user = decoded._doc;
					
					next();
				}
			});	
		} else {
			res.status(403).send({ success: false, mensagem: "Não autorizado" });		
		}
	} else {
		res.status(403).send({ success: false, mensagem: "Não autorizado" });	
	}	
});

apiRoutes.get('/removeAll', function(req, res) {
	User.remove(function(err,removed) {		
		res.json({ success: true });
	});
});

apiRoutes.get('/', function(req, res) {
	res.json({ success: true, mensagem: ";)" });
});

apiRoutes.get('/me', function(req, res) {
	res.json({ success: true, user: req.user });
});

apiRoutes.get('/users', function(req, res) {
	User.find({}, function(err, users) {		
		res.json({ success: true, users: users });
	});
});

app.use('/api', apiRoutes);

app.listen(port);

console.log('http://localhost:' + port);