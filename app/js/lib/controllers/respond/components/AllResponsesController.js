define(function(require, exports, module) {
	"use strict";

	var
		$ = require('jquery'),
		googleMapsLoader = require('google-maps'),
		Controller = require('bower/feideconnectjs/src/controllers/Controller'),
		TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine');

	var template = require('text!templates/respond-components/MyResponse.html');


	var AllResponsesController = Controller.extend({
		"init": function(app) {
			this.app = app;
			this.template = new TemplateEngine(template);
			var el = $('<tbody></tbody>')
			this._super(el);
			this.initLoad();
		},

		"setData": function(foodle, responses) {
			this.foodle = foodle;
			this.responses = responses;
			return this.draw();
		},

		"getResponsesView": function() {
			var data = [];
			for(var i = 0; i < this.responses.length; i++) {
				var v = this.responses[i].getView();
				// console.log(JSON.stringify(v, undefined, 2));
				data.push(v);
			}
			return data;
		},

		"draw": function() {
			var that = this;
			var _config = that.app.feideconnect.getConfig();
			var profilephotoBase = _config.apis.core + '/userinfo/v1/user/media/';

			var view = {
				"_": this.app.dict.get(),
				"coldef": this.foodle.getViewColDefGeneric(),
				"profilephotoBase": profilephotoBase,
				"responses": this.getResponsesView()
			};
			this.el.children().detach();
			// console.error("About to render AllResponsesController");
			// console.error(JSON.stringify(view, undefined, 2));
			return this.template.render(this.el, view);
		}

	});

	return AllResponsesController;
});