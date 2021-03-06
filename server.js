"use strict";

var
	fs = require('fs'),
	express = require('express'),
	cookieParser = require('cookie-parser'),

	LangNeg = require('./lib/LangNeg');

var app = express();
var developer = false;
var env = process.argv[2] || process.env.NODE_ENV || 'production';


var config = JSON.parse(fs.readFileSync('app/etc/config.defaults.js', 'utf8'));

if (process.env.FC_CLIENT_ID) {
	config.client_id = process.env.FC_CLIENT_ID;
}
if (process.env.FC_REDIRECT_URI) {
	config.redirect_uri = process.env.FC_REDIRECT_URI;
}
if (process.env.COOKIEDOMAIN) {
	config.cookiedomain = process.env.COOKIEDOMAIN;
}



var languages = new LangNeg.Lang(config);


app.use(cookieParser());
app.use(function(req, res, next) {
	console.log(req.method + ' ' + req.url);
	next();
});

if (env === 'development') {
	console.log("Running app in development mode");

	app.use('/css/', express.static('css'));
	app.use('/templates/', express.static('templates'));
	app.use('/dictionaries/', express.static('dictionaries'));

	app.use('/', function(req, res, next) {
		if (req.url === '/') {
			req.url = '/index.dev.html';
		}
		next();
	});
}


app.use('/build/', LangNeg.neg(languages), express.static('app/dist', {maxAge: '30 days'}));
app.use('/bower_components/', express.static('bower_components', {maxAge: '30 days'}));
app.use('/', express.static('app', {maxAge: '2 days'}));

app.get('/version', function (req, res) {

	var bowerlist = JSON.parse(fs.readFileSync('app/etc/bower-list.json', 'utf8'));
	var gittag = fs.readFileSync('app/etc/version-git.txt', 'utf8').trim();
	var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

	var data = {
		"app": {
			"git": gittag,
			"pkg": pkg
		},
		"bower": bowerlist
	};

	res.setHeader('Content-Type', 'application/json; charset=utf-8');
	res.send(JSON.stringify(data, undefined, 4));
});


var port = process.env.VCAP_APP_PORT || 3001;
var server = app.listen(port, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Running app at http://%s:%s', host, port);
});



// app.configure('development', function(){
//     app.use(express.static(__dirname + '/public1'));
//     app.use(express.static(__dirname + '/public2'));
// });