define(function(require, exports, module) {
	"use strict";

	var
		$ = require('jquery'),
		googleMapsLoader = require('google-maps'),
		Controller = require('bower/feideconnectjs/src/controllers/Controller'),
		TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine'),

		FoodleResponse = require('../../../models/FoodleResponse');

	var template = require('text!templates/respond-components/MyResponse.html');


	var MyResponseController = Controller.extend({
		"init": function(app) {
			this.app = app;
			this.template = new TemplateEngine(template);

			var el = $('<tbody></tbody>')
			this._super(el);

			this.ebind("click", ".submitResponse", "actSubmit");

			this.initLoad();
		},


		"actSubmit": function(e) {
			if (e) {
				e.preventDefault();
				e.stopPropagation();
			}

			// var r = new FoodleResponse({}, this.foodle);
			// r.identifier = this.foodle.identifier;
			// r.userinfo = this.app.usercontext.getPublic();
			// r.columns = [
			// 	{
			// 		"idx": "2373465",
			// 		"val": "yes"
			// 	}
			// ];
			// // console.error("FoodleResponse", JSON.stringify(r, undefined, 2));
			// r.save();

		},


		"setData": function(foodle, response) {
			this.foodle = foodle;
			this.response = response;
			this.actSubmit();
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
				"profilephotoBase": profilephotoBase,
				"response": this.response.getView()
			};
			console.error("My response view", JSON.stringify(view, undefined, 3));
			this.el.children().detach();
			return this.template.render(this.el, view);
		}

	});

	return MyResponseController;
});