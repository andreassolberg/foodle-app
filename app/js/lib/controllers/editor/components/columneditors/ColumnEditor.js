	define(function(require, exports, module) {
	"use strict";	

	var 
		$ = require('jquery'),

		Controller = require('bower/feideconnectjs/src/Controllers/Controller')
		;

	var ColumnEditor = Controller.extend({
		"init": function(app) {
			this.app = app;
			this._super();
		},

		"initLoad": function() {
			var that = this;
			return Promise.resolve()
				// .then(this.proxy("setup"))
				.then(this.proxy("_initLoaded"))
				.catch(function(err) {
					that.app.setErrorMessage("Error loading column editor", "danger", err);
				});
		},

		"setFoodle": function(foodle) {
			this.foodle = foodle;
		},

		"draw": function() {
			var view = {
				"_": this.app.dict.get(),
				"foodle": this.foodle.getView(),
				"coldef": this.foodle.getViewColDefGeneric()
			};
			// console.error("About to draw columneditor", view);
			$("#debug").empty().append(JSON.stringify(view.coldef,undefined, 4));
			this.el.children().detach();
			return this.template.render(this.el, view);
		}


	});

	return ColumnEditor;
});