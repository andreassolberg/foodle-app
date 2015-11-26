define(function(require, exports, module) {
	"use strict";

	var
		$ = require('jquery'),
		googleMapsLoader = require('google-maps'),
		Controller = require('bower/feideconnectjs/src/controllers/Controller'),
		TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine');

	var template = require('text!templates/respond-components/LocationDisplay.html');


	var LocationDisplay = Controller.extend({
		"init": function(app) {
			this.app = app;
			this.template = new TemplateEngine(template);
			this._super();
			this.initLoad();
		},


		"loadGoogleMaps": function() {
			var that = this;
			return new Promise(function(resolve, reject) {
				googleMapsLoader.load(function(google) {
					that.google = google;
					resolve();
				});
			});
		},

		"resize": function() {
			var that = this;
			this.onLoaded()
				.then(function() {
					that.google.maps.event.trigger(that.map, 'resize');
				});
		},

		"mapLookup": function() {
			var that = this;
			return new Promise(function(resolve, reject) {
				var geocoder = new that.google.maps.Geocoder();
				geocoder.geocode({
					'address': that.foodle.location.address
				}, function(results, status) {
					if (status === that.google.maps.GeocoderStatus.OK) {
						resolve(results[0].geometry.location);
					} else {
						reject('Geocode was not successful for the following reason: ' + status);
					}
				});
			});
		},

		"setupMap": function(location) {
			this.google.maps.visualRefresh = true;
			var mapOptions = {
				center: location,
				zoom: 12
			};

			var element = this.el.find('#location-canvas');
			this.map = new this.google.maps.Map(element[0], mapOptions);
			var marker = new this.google.maps.Marker({
				map: this.map,
				position: location
			});
		},

		"draw": function(foodle) {
			var that = this;
			this.foodle = foodle;
			var view = {
				"_": this.app.dict.get(),
				"foodle": foodle.getView()
			};
			this.el.children().detach();
			return this.template.render(this.el, view)
				.then(function() {
					if (that.foodle.location.address) {
						return that.loadGoogleMaps()
							.then(that.proxy("mapLookup"))
							.then(function(l) {
								return that.setupMap(l);
							})
							.catch(function(err) {
								console.error("Error loading Google maps", err);
								that.el.find('#location-canvas').hide();
							})
					}
				});
		}

	});

	return LocationDisplay;
});