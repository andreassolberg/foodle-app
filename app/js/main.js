"use strict";

requirejs.config({
	//By default load any module IDs from js/lib
	baseUrl: 'js',
	//except, if the module ID starts with "app",
	//load it from the js/app directory. paths
	//config is relative to the baseUrl, and
	//never includes a ".js" extension since
	//the paths config could be for a directory.
	paths: {
		"bower"     : '../bower_components',
		"text"      : '../bower_components/text/text',
		"templates" : '../templates/',
		"dust"      : '../bower_components/dustjs-linkedin/dist/dust-full.min',
		"class"     : "./lib/class",
		"jquery"	: "../bower_components/jquery/dist/jquery",
		"dict"		: "../dictionaries/dictionary.en.json",
		"bootstrap" : "../bower_components/bootstrap/dist/js/bootstrap",
		"es6-promise": "../bower_components/es6-promise/promise",
		"moment": "../bower_components/momentjs/min/moment-with-locales",
		"moment-timezone": "../bower_components/moment-timezone/builds/moment-timezone-with-data",
		"bootstrap-datepicker": "../bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker",
		"selectize": "../bower_components/selectize/dist/js/standalone/selectize",
		"google-maps": "../bower_components/google-maps/lib/Google",
		
	},
	shim: {
		// "jquery": ["selectize"],
		"dust": {
			"exports": "dust"
		},
		"moment-timezone": {
			"deps": ["moment"]
		},
		"bootstrap": {
			"deps": ["jquery"]
		},
		"selectize": ["jquery"]
		// "typeahead": ["jquery"]
	}
});

// Configure 
if (!window.console) {
	window.console = {
		"log": function() {},
		"error": function() {},
	}
}

define(function(require, exports, module) {

	var 
		$ = require('jquery'),
		App = require('lib/App');

	$(document).ready(function() {
		var app = new App();
	});



});



