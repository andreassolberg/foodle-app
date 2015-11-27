define(function(require, exports, module) {
	"use strict";

	var
		$ = require('jquery'),
		googleMapsLoader = require('google-maps'),
		Controller = require('bower/feideconnectjs/src/controllers/Controller'),
		TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine');

	var template = require('text!templates/respond-components/MyResponse.html');


	var MyResponseController = Controller.extend({
		"init": function(app) {
			this.app = app;
			this.template = new TemplateEngine(template);

			var el = $('<tbody></tbody>')
			this._super(el);

			// this.ebind("click", ".responsebox", "click");


			this.initLoad();
		},


		"click": function() {

		},

		"setData": function(foodle) {
			this.foodle = foodle;
			return this.draw();
		},

		"draw": function() {
			var that = this;
			var _config = that.app.feideconnect.getConfig();
			var profilephotoBase = _config.apis.core + '/userinfo/v1/user/media/';

			var view = {
				"_": this.app.dict.get(),
				"user": this.app.usercontext.user,
				"coldef": this.foodle.getViewColDefGeneric(),
				"profilephotoBase": profilephotoBase
			};
			this.el.children().detach();
			return this.template.render(this.el, view);
		}

	});

	return MyResponseController;
});