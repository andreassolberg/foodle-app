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
		FoodleResponse = require('../../models/FoodleResponse'),
		Waiter = require('../../Waiter'),
		$ = require('jquery');

	var responseTemplate = require('text!templates/FoodleResponse.html');

	var RespondController = Pane.extend({
		"init": function(feideconnect, app, pool, usercontext) {

			this.feideconnect = feideconnect;
			this.app = app;
			this.pool = pool;
			this.usercontext = usercontext;

			this._super(app, feideconnect);

			this.locationdisplay = new LocationDisplay(app);
			this.myresponsecontroller = new MyResponseController(app, this);
			this.allresponsescontroller = new AllResponsesController(app);
			this.timezoneselector = new TimeZoneSelector(this.app);

			this.template = new TemplateEngine(responseTemplate);


			this.ebind("click", "ul#responsenav > li", "actTab");

			this.initLoad();
		},

		"actTab": function(e) {

			e.preventDefault();
			e.stopPropagation();
			var id = $(e.currentTarget).data('tabtarget');
			this.setTab(id);
		},

		"setTab": function(id) {

			var that = this;
			this.el.find('ul#responsenav > li').each(function(i, item) {
				var x = $(item);
				if (x.data('tabtarget') === id) {
					x.addClass('active');
				} else {
					x.removeClass('active');
				}
			});

			this.el.find('#responseTable > *').hide();
			this.el.find('#responseTable > #' + id).show();

		},


		"initLoad": function() {
			return Promise.resolve()
				.then(this.proxy("_initLoaded"));
		},

		"loadFoodleResponsesMy": function() {
			var that = this;
			return this.foodle.getMyResponse()
				.then(function(data) {
					if (data === null) {
						data = new FoodleResponse({}, that.foodle);
						data.identifier = that.foodle.identifier;
						data.userinfo = that.usercontext.getPublic();
					}
					that.myresponse = data;
				});
		},
		"loadFoodleResponsesAll": function() {
			var that = this;
			return this.foodle.getAllResponses()
				.then(function(data) {
					that.allresponses = data;
				});
		},
		"loadFoodleResponses": function() {
			var that = this;
			return Promise.all([
				this.loadFoodleResponsesMy(), this.loadFoodleResponsesAll()
			]);
		},

		"reloadResponses": function() {
			var that = this;
			return this.onLoaded()
				.then(function() {
					return that.usercontext.onLoaded();
				})
				.then(this.proxy("loadFoodleResponses"))
				.then(this.proxy("updateResponses"));
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
				.then(this.proxy("loadFoodleResponses"))
				.then(function() {
					that.updateResponses();
					return that.draw();
				});
		},

		"updateResponses": function() {
			// console.error("MyResponseController", this.myresponsecontroller);
			this.myresponsecontroller.setData(this.foodle, this.myresponse);
			this.allresponsescontroller.setData(this.foodle, this.allresponses);
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

			// console.error("Responder view", JSON.stringify(view.user, undefined, 4));
			that.el.children().detach();
			return this.template.render(that.el, view)
				.then(function() {
					if (that.foodle.location) {
						that.el.find('.locationdisplay').append(that.locationdisplay.el);
					}
					that.el.find('#timezoneselector').append(that.timezoneselector.el);
					that.el.find('#myresponse').replaceWith(that.myresponsecontroller.el);
					that.el.find('#allresponses').replaceWith(that.allresponsescontroller.el);
					that.setTab('tmyresponse');
					that.activate();
				});
		}


	});

	return RespondController;


});