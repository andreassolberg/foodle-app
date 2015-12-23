({
	baseUrl: "app/js",
	paths: {
		// "bower": '../../bower_components',
		// "text": '../../bower_components/text/text',
		// "templates": '../../templates/',
		// "dust": '../../bower_components/dustjs-linkedin/dist/dust-full.min',
		// "class": "lib/class",
		// "jquery": "../../bower_components/jquery/dist/jquery.min",
		// "dict": "_",
		// "es6-promise": "../../bower_components/es6-promise/promise",
		// "bootstrap": "../../bower_components/bootstrap/dist/js/bootstrap.min"

		"bower"     : '../../bower_components',
		"text"      : '../../bower_components/text/text',
		"templates" : '../../templates/',
		"dust"      : '../../bower_components/dustjs-linkedin/dist/dust-full.min',
		"class"     : "../lib/class",
		"jquery"	: "../../bower_components/jquery/dist/jquery",
		"dict"		: "../../dictionaries/dictionary.en.json",
		"bootstrap" : "../../bower_components/bootstrap/dist/js/bootstrap",
		"es6-promise": "../../bower_components/es6-promise/promise",
		"moment": "../../bower_components/momentjs/min/moment-with-locales",
		"moment-timezone": "../../bower_components/moment-timezone/builds/moment-timezone-with-data",
		"bootstrap-datepicker": "../../bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker",
		"selectize": "../../bower_components/selectize/dist/js/standalone/selectize",
		"google-maps": "../../bower_components/google-maps/lib/Google",
		"markdown": "../../bower_components/markdown/lib/markdown"
	},
	shim: {
		"dust": {
			"exports": "dust"
		},
		"moment-timezone": {
			"deps": ["moment"]
		},
		"bootstrap": {
			"deps": ["jquery"]
		},
		"selectize": ["jquery"],
		"markdown": {
			"exports": "markdown"
		}
	},
	name: "../../bower_components/almond/almond",
	include: "main",
	insertRequire: ["main"],
	out: "app/dist/app.min.js"
})
