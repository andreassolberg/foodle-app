"use strict";
	
var
	Negotiator = require('negotiator');

// var languageAliases = {
// 	'no': 'nb'
// };




var Lang = function(config) {
	this.config = config;
	this.languages = config.languages;
};
Lang.prototype.exists = function(lang) {
	for(var i = 0; i < this.languages.length; i++) {
		if (this.languages[i] === lang) {
			return true;
		}
	}
	return false;
};
Lang.prototype.getLanguages = function() {
	return this.languages;
};




var neg = function(languages) {


	// console.log("Languags", languages);

	return function(req, res, next) {
		var negotiator = new Negotiator(req);
		var selectedlang = negotiator.language(languages.getLanguages()) || 'en';

		console.log("Languages", languages.getLanguages());
		console.log("Selected lang is ", selectedlang);


		if (req.cookies.lang && languages.exists(req.cookies.lang)) {
			selectedlang = req.cookies.lang; 
		}

		req.url = req.url + '.' + selectedlang;

		res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		res.setHeader('Vary', 'Content-Language');
		res.setHeader('Content-Language', selectedlang);

		next();

	};

}




exports.Lang = Lang;
exports.neg = neg;

