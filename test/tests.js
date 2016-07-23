var expect = require('Chai').expect;
var request = require('request');

//var server = require('../server');
//describe('server response', function () {
//  before(function () {
//    server.listen(3000);
//  });
//
//  after(function () {
//    server.close();
//  });
//});

describe('Success - (SingUp - Me - Users)', function () {		
	this.timeout(25000);
	
	var token;
	
	it('SingUp', function (done) {
		
			var options = { method: 'POST',
				url: 'http://localhost:3000/signup',
				headers: 
					{
						'cache-control': 'no-cache',
						'content-type': 'application/json' 
					},
				body: { 
					email: 'teste@teste.com',
					senha: 'teste',
					nome: 'Teste',
					telefones: [ 
						{ numero: '11111111', ddd: '11' },
						{ numero: '222222222', ddd: '11' } 
					]
				},
				json: true 
			}
		
			request(options, function (error, res, body) {				
				expect(res.statusCode).to.equal(200);
				expect(body.success).to.equal(true);
				
				token = body.token;
				
				done();
			});
	});
	
	it('Me', function (done) {
		var options = { method: 'GET',
			url: 'http://localhost:3000/api/me',
			headers: {
				'cache-control': 'no-cache',
				'content-type': 'application/json',
				'Authorization': 'Bearer ' + token 
			},
			json: true 
		}
		
		request(options, function (error, res, body) {			
			expect(res.statusCode).to.equal(200);
			expect(body.success).to.equal(true);			
			
			done();
		});
	});
	
	it('Users', function (done) {
		var options = { method: 'GET',
			url: 'http://localhost:3000/api/users',
			headers: {
				'cache-control': 'no-cache',
				'content-type': 'application/json',
				'Authorization': 'Bearer ' + token 
			},
			json: true 
		}
		
		request(options, function (error, res, body) {
			expect(res.statusCode).to.equal(200);
			expect(body.success).to.equal(true);			
			
			done();
		});
	});
});

describe('Error - (SingUp - Me - Users)', function () {		
	this.timeout(25000);
	
	var token;
	
	it('SingUp - User already exist', function (done) {		
		var options = { method: 'POST',
			url: 'http://localhost:3000/signup',
			headers: 
				{
					'cache-control': 'no-cache',
					'content-type': 'application/json' 
				},
			body: { 
				email: 'teste@teste.com',
				senha: 'teste',
				nome: 'Teste',
				telefones: [ 
					{ numero: '11111111', ddd: '11' },
					{ numero: '222222222', ddd: '11' } 
				]
			},
			json: true 
		}
		
		request(options, function (error, res, body) {				
			expect(res.statusCode).to.equal(200);
			expect(body.success).to.equal(false);
			
			done();
		});
	});
	
	it('SingUp - E-mail invalid', function (done) {		
		var options = { method: 'POST',
			url: 'http://localhost:3000/signup',
			headers: 
				{
					'cache-control': 'no-cache',
					'content-type': 'application/json' 
				},
			body: { 
				email: 'testeteste.com',
				senha: 'teste',
				nome: 'Teste',
				telefones: [ 
					{ numero: '11111111', ddd: '11' },
					{ numero: '222222222', ddd: '11' } 
				]
			},
			json: true 
		}
		
		request(options, function (error, res, body) {				
			expect(res.statusCode).to.equal(200);
			expect(body.success).to.equal(false);
			expect(body.mensagem).to.equal('Informe um e-mail válido');
			
			done();
		});
	});
	
	it('SingUp - Name invalid', function (done) {		
		var options = { method: 'POST',
			url: 'http://localhost:3000/signup',
			headers: 
				{
					'cache-control': 'no-cache',
					'content-type': 'application/json' 
				},
			body: { 
				email: 'teste@teste.com',
				senha: 'teste',
				nome: 'Teste 1',
				telefones: [ 
					{ numero: '11111111', ddd: '11' },
					{ numero: '222222222', ddd: '11' } 
				]
			},
			json: true 
		}
		
		request(options, function (error, res, body) {				
			expect(res.statusCode).to.equal(200);
			expect(body.success).to.equal(false);
			expect(body.mensagem).to.equal('Informe um nome válido');
			
			done();
		});
	});
	
	it('SingUp - Tel. invalid', function (done) {		
		var options = { method: 'POST',
			url: 'http://localhost:3000/signup',
			headers: 
				{
					'cache-control': 'no-cache',
					'content-type': 'application/json' 
				},
			body: { 
				email: 'teste1@teste.com',
				senha: 'teste',
				nome: 'Teste',
				telefones: [ 
					{ numero: 'a1111111', ddd: '11' },
					{ numero: '222222222', ddd: '11' } 
				]
			},
			json: true 
		}
		
		request(options, function (error, res, body) {				
			expect(res.statusCode).to.equal(200);
			expect(body.success).to.equal(false);
			expect(body.mensagem).to.equal('Informe telefones válidos');
			
			done();
		});
	});
	
	it('Me - No Token', function (done) {
		var options = { method: 'GET',
			url: 'http://localhost:3000/api/me',
			headers: {
				'cache-control': 'no-cache',
				'content-type': 'application/json',
				'Authorization': 'Bearer' 
			},
			json: true 
		}
		
		request(options, function (error, res, body) {
			expect(res.statusCode).to.equal(403);
			expect(body.success).to.equal(false);			
			
			done();
		});
	});
	
	it('Users - No Token', function (done) {
		var options = { method: 'GET',
			url: 'http://localhost:3000/api/users',
			headers: {
				'cache-control': 'no-cache',
				'content-type': 'application/json',
				'Authorization': 'Bearer' 
			},
			json: true 
		}
		
		request(options, function (error, res, body) {
			expect(res.statusCode).to.equal(403);
			expect(body.success).to.equal(false);			
			
			done();
		});
	});
});