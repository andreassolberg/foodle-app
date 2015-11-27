define(function(require) {
	"use strict";

	var

		Pane = require('bower/feideconnectjs/src/controllers/Pane'),
		utils = require('bower/feideconnectjs/src/utils'),
		TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine'),

		TimeZoneSelector = require('../editor/components/TimeZoneSelector'),
		LocationDisplay = require('./components/LocationDisplay'),
		MyResponseController = require('./components/MyResponseController'),
		AllResponsesController = require('./components/AllResponsesController'),
		Foodle = require('../../models/Foodle'),
		Waiter = require('../../Waiter'),
		$ = require('jquery');


	var responseTemplate = require('text!templates/FoodleResponse.html');
	// var apilistingTemplate = require('text!templates/partials/APIListing.html');
	// var publicAPIListingTemplate = require('text!templates/partials/APIListingPublic.html');
	// var ownAPIListingTemplate = require('text!templates/partials/APIListingOwn.html');

	var RespondController = Pane.extend({
		"init": function(feideconnect, app, pool, usercontext) {

			this.feideconnect = feideconnect;
			this.app = app;
			this.pool = pool;
			this.usercontext = usercontext;

			this._super(app, feideconnect);

			this.locationdisplay = new LocationDisplay(app);
			this.myresponsecontroller = new MyResponseController(app);
			this.allresponsescontroller = new AllResponsesController(app);
			this.timezoneselector = new TimeZoneSelector(this.app);

			this.template = new TemplateEngine(responseTemplate);

			// this.template.loadPartial("apilisting", apilistingTemplate);
			// this.template.loadPartial("apilistingpublic", publicAPIListingTemplate);
			// this.ebind("click", ".actSaveChanges", "actSaveChanges");

			this.initLoad();
		},


		"initLoad": function() {

			return Promise.resolve()
				.then(this.proxy("_initLoaded"));

		},

		"loadFoodleResponses": function() {

			this.foodle.getMyResponse();
			this.foodle.getAllResponses();

		},

		"open": function(foodle) {

			var that = this;
			var foodletitle = (foodle.title ? foodle.title : '(without name)');
			this.foodle = foodle;

			this.app.bccontroller.draw([
				this.app.getBCItem(), {
					"title": foodletitle,
					"active": true
				}
			]);

			return this.onLoaded()
				.then(function() {
					return that.usercontext.onLoaded();
				})
				.then(function() {
					that.updateResponses();
					return that.draw();
				});
		},

		"updateResponses": function() {
			console.error("MyResponseController", this.myresponsecontroller);
			this.myresponsecontroller.setData(this.foodle);
			this.allresponsescontroller.setData(this.foodle);
		},

		"draw": function(act) {
			var that = this;
			var foodleview = this.foodle.getView();

			var _config = that.feideconnect.getConfig();
			var profilephotoBase = _config.apis.core + '/userinfo/v1/user/media/';


			var view = {
				"_": this.app.dict.get(),
				"user": this.usercontext.user,
				"foodle": this.foodle.getView(),
				"coldef": this.foodle.getViewColDefGeneric(),
				"groups": this.usercontext.getGroupSelection(this.foodle.groups),
				"dtinfo": this.foodle.getDateTimeView(),
				"seealso": this.pool.getSeeAlso(this.foodle),
				"profilephotoBase": profilephotoBase
			};



			if (this.foodle.location) {
				this.locationdisplay.draw(this.foodle);
			}


			that.timezoneselector.updateView(this.foodle);

			console.error("Responder view", JSON.stringify(view.user, undefined, 4));
			that.el.children().detach();
			return this.template.render(that.el, view)
				.then(function() {
					if (that.foodle.location) {
						that.el.find('.locationdisplay').append(that.locationdisplay.el);
						that.el.find('#timezoneselector').append(that.timezoneselector.el);
						that.el.find('#myresponse').replaceWith(that.myresponsecontroller.el);
						that.el.find('#allresponses').replaceWith(that.allresponsescontroller.el);
					}
					that.activate();
				});
		}


	});

	return RespondController;


});