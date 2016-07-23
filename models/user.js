var mongoose 	= require('mongoose');
var Schema 		= mongoose.Schema;
var md5 		= require('md5');

var UserSchema   = new Schema({
	email: { type: String, required: true, index: { unique: true } }, 
	senha: { type: String, required: true}, 
	nome: { type: String, required: true},
	telefones: [ { 
		numero: { type: String, required: true }, 
		ddd: { type: String, required: true} 
	} ],
	data_criacao: { type: Date, required: true },
	data_atualizacao: { type: Date, default: Date.now },
	ultimo_login: { type: Date, required: true }
});

UserSchema.pre('save', function(next) {
    var user = this;
	
	user.senha = md5(user.senha);
	
    next();
});


UserSchema.methods.comparePassword = function(senha) {
	return this.senha === md5(senha);
}
 
module.exports = mongoose.model('User', UserSchema);