define(function(require, exports, module) {
	"use strict";

	var
		Pane = require('bower/feideconnectjs/src/controllers/Pane'),
		Dictionary = require('bower/feideconnectjs/src/Dictionary'),
		EventEmitter = require('bower/feideconnectjs/src/EventEmitter'),
		TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine'),
		utils = require('bower/feideconnectjs/src/utils'),

		Foodle = require('../../models/Foodle'),

		$ = require('jquery');

	var
		template = require('text!templates/MainListing.html'),
		templateList = require('text!templates/MainListingFoodles.html');


	/*
	 * This controller controls 
	 */
	var MainListing = Pane.extend({
		"init": function(feideconnect, app, pool) {

			var that = this;
			this.feideconnect = feideconnect;
			this.app = app;

			this.tmp = new TemplateEngine(template, this.app.dict);
			this.tmpL = new TemplateEngine(templateList, this.app.dict);

			this.pool = pool;
			this.pool.on('listChange', function(list) {
				that.updateList(list);
			});

			this._super();

			this.dict = new Dictionary();

			this.elList = $("<div></div>");

			this.ebind('click', '.actNewP', 'actNewP');
			this.ebind('click', '.actNewD', 'actNewD');


		},

		"updateList": function(foodles) {
			console.error("FOO", this.app.usercontext);
			var _config = this.feideconnect.getConfig();
			var profilephotoBase = _config.apis.core + '/userinfo/v1/user/media/';
			var items = this.pool.getView(this.app.usercontext);
			var view = {
				"items": items,
				"profilephotoBase": profilephotoBase
			};
			console.error("FOO", this.app.usercontext);

			console.error("DRAW", JSON.stringify(view.items, undefined, 2));
			this.tmpL.render(this.elList.empty(), view);
		},

		"actNewD": function(e) {
			e.preventDefault();
			e.stopPropagation();

			var that = this;
			var f = Foodle.getNewDates();
			this.app.editor.edit(f)
				.then(function() {
					that.app.setHash('/create');
				})
				.catch(function(err) {
					that.app.setErrorMessage("Error opening Foodle editor", "danger", err);
				});
		},
		"actNewP": function(e) {
			e.preventDefault();
			e.stopPropagation();

			var that = this;
			var f = Foodle.getNewGeneric();
			this.app.editor.edit(f)
				.then(function() {
					that.app.setHash('/create');
				})
				.catch(function(err) {
					that.app.setErrorMessage("Error opening Foodle editor", "danger", err);
				});
		},

		"initLoad": function() {

			return this.draw(false)
				.then(this.proxy("_initLoaded"));

		},


		"draw": function(act) {
			var that = this;

			var view = {
				"_": that.dict.get(),
				"showHeader": false
			};
			that.el.children().detach();



			return this.tmp.render(that.el, view)
				.then(function() {
					that.el.find('#listing').append(that.elList);

					if (act) {
						that.activate();
					}
				});


		}
	}).extend(EventEmitter);

	return MainListing;

});