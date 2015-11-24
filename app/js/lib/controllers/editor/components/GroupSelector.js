define(function(require, exports, module) {
	"use strict";

	var
		$ = require('jquery'),

		ComponentController = require('./ComponentController'),
		Dictionary = require('bower/feideconnectjs/src/Dictionary'),
		TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine');

	var template = require('text!templates/components/Groups.html');


	var GroupSelector = ComponentController.extend({
		"init": function(app) {
			var that = this;


			this.template = new TemplateEngine(template);

			that.marker = null;

			this._super(app);

			// this.ebind("click", "#actLookupMap", "mapLookup");

			this.initLoad();
		},

		"initLoad": function() {
			var that = this;
			return this.loadGroups()
				.then(this.proxy("draw"))
				.then(this.proxy("_initLoaded"))
				.catch(function(err) {
					that.app.setErrorMessage("Error loading group selector", "danger", err);
				});
		},

		"getGroups": function() {

			if (!this.isActive()) {
				return null;
			}

			var groups = [];

			this.el.find('input.groupoption').each(function(i, item) {

				if ($(item).prop("checked")) {
					groups.push($(item).data('groupid'));
				}

			});
			if (groups.length === 0) {
				return null;
			}
			return groups;
		},

		"loadGroups": function() {
			var that = this;
			return this.app.feideconnect.vootGroupsList()
				.then(function(groups) {
					// console.error("Groups data", groups);
					that.groups = groups;
				});
		},

		"updateView": function(foodle) {
			var that = this;
			return this.onLoaded()
				.then(function() {
					if (!foodle.groups) {
						return;
					}
					var gindex = {};
					for (var i = 0; i < foodle.groups.length; i++) {
						gindex[foodle.groups[i]] = true;
					}
					that.el.find('.groupoption').each(function(i, item) {
						// console.error("About to process", $(item).attr('data-groupid'), gindex.hasOwnProperty($(item).attr('data-groupid')));
						$(item).prop("checked", gindex.hasOwnProperty($(item).attr('data-groupid')));
					});
				});
		},

		"draw": function() {
			var view = {
				"_": this.app.dict.get(),
				"groups": this.groups
			};
			// console.error("VIEW", view);
			this.el.children().detach();
			return this.template.render(this.el, view);
		}

	});

	return GroupSelector;
});