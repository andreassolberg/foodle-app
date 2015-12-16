	define(function(require, exports, module) {
		"use strict";

		var
			moment = require('moment-timezone'),
			$ = require('jquery'),
			googleMapsLoader = require('google-maps'),

			ComponentController = require('./ComponentController'),
			Dictionary = require('bower/feideconnectjs/src/Dictionary'),
			TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine');


		var template = require('text!templates/SaveDialog.html');


		var SaveDialog = ComponentController.extend({
			"init": function(app) {
				var that = this;

				this.dict = new Dictionary();
				this.template = new TemplateEngine(template);

				this._super(app);
				this.ebind("click", ".actClose", "actClose");
				this.ebind("click", ".actGo", "actGo");
				this.initLoad();
			},

			"initLoad": function() {
				var that = this;
				return this.proxy("_initLoaded");
			},

			"actClose": function(e) {
				e.preventDefault();
				e.stopPropagation();

				$(this.el).find(".modal").modal('hide');

			},


			"actGo": function(e) {
				// e.preventDefault();
				// e.stopPropagation();
				$(this.el).find(".modal").modal('hide');
			},

			"open": function(foodle) {
				this.foodle = foodle;
				// console.error("SET FOODLE", foodle);
				var that = this;
				return this.draw()
					.then(function() {
						that.activate();
					});
			},

			"draw": function() {
				var that = this;
				var view = {
					"_": this.dict.get(),
					"url": this.app.config.appURL + '#!/respond/' + this.foodle.identifier
				};
				this.el.children().detach();

				// console.error("Draw clientcreate", view);
				return this.template.render(this.el, view)
					.then(function() {
						$("div#modalContainer").append(that.el);
					})
			},

			"activate": function() {
				$(this.el).find(".modal").modal('show');
				// $(this.el).find("#newClientName").focus();
			},

		});

		return SaveDialog;
	});