define(function(require, exports, module) {
	"use strict";

	var
		$ = require('jquery'),
		googleMapsLoader = require('google-maps'),
		Controller = require('bower/feideconnectjs/src/controllers/Controller'),
		TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine');

	var template = require('text!templates/respond-components/AllResponses.html');
	var partCheck = require('text!templates/respond-components/partCheck.html');
	var partCheckMaybe = require('text!templates/respond-components/partCheckMaybe.html');
	var partNumber = require('text!templates/respond-components/partNumber.html');
	var partText = require('text!templates/respond-components/partText.html');



	var cmp = function(a, b) {

		// console.error("COmparing", a, b);
		if (a > b) {return -1;}
		if (a < b) {return +1;}
		return 0;
	}
	var sortByIdx = function(idx) {

		return function(a, b) {

			var x = a.getValue(idx);
			var y = b.getValue(idx);

			return cmp(x, y);

		};	
	}


	var AllResponsesController = Controller.extend({
		"init": function(app) {
			this.app = app;
			this.template = new TemplateEngine(template);
			this.template.loadPartial("partCheck", partCheck);
			this.template.loadPartial("partCheckMaybe", partCheckMaybe);
			this.template.loadPartial("partNumber", partNumber);
			this.template.loadPartial("partText", partText);
			
			var el = $('<tbody></tbody>')
			this._super(el);



			this.initLoad();
		},


		"sort": function(idx) {
			this.responses.items.sort(sortByIdx(idx));

			// console.error("this.responses.items", this.responses.items);
			return this.draw();
		},

		"setData": function(foodle, responses, summary) {
			this.foodle = foodle;
			this.responses = responses;
			this.summary = summary;

			if (responses === null) {
				return;
			}

			return this.draw();
		},

		"getResponsesView": function() {
			var data = [];
			for(var i = 0; i < this.responses.items.length; i++) {
				var v = this.responses.items[i].getView();
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
				"responses": this.getResponsesView(),
				"summary": this.summary
			};
			this.el.children().detach();
			// console.error("About to render AllResponsesController");
			// console.error(JSON.stringify(view.responses, undefined, 2));
			return this.template.render(this.el, view);
		}

	});

	return AllResponsesController;
});