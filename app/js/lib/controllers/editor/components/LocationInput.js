	define(function(require, exports, module) {
		"use strict";

		var
			moment = require('moment-timezone'),
			$ = require('jquery'),
			googleMapsLoader = require('google-maps'),

			ComponentController = require('./ComponentController'),
			Dictionary = require('bower/feideconnectjs/src/Dictionary'),
			TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine');


		var template = require('text!templates/components/Location.html');


		var LocationInput = ComponentController.extend({
			"init": function(app) {
				var that = this;


				this.template = new TemplateEngine(template);

				that.marker = null;

				this._super(app);

				this.ebind("click", "#actLookupMap", "mapLookup");

				this.initLoad();
			},

			"initLoad": function() {
				var that = this;
				return this.draw()
					.then(this.proxy("loadGoogleMaps"))
					.then(this.proxy("setup"))
					.then(this.proxy("_initLoaded"))
					.catch(function(err) {
						that.app.setErrorMessage("Error loading locationinput", "danger", err);
					});
			},

			"getAddress": function() {
				var address = this.el.find('#inputAddress').val();
				return address;
			},

			"getLocal": function() {
				var address = this.el.find('#inputLocationLocal').val();
				return address;
			},

			"getData": function() {

				if (!this.isActive()) {
					return null;
				}

				var address = this.getAddress();
				var local = this.getLocal();

				if (!(address !== '' || local !== '')) {
					return null;
				}
				return {
					address: address,
					local: local
				};
			},

			"mapLookup": function() {


				var that = this;


				return new Promise(function(resolve, reject) {

					var address = that.getAddress();
					that.geocoder.geocode({
						'address': address
					}, function(results, status) {
						if (status === that.google.maps.GeocoderStatus.OK) {
							that.map.setCenter(results[0].geometry.location);

							// console.error("About so set marker", that.marker);

							if (that.marker === null) {
								that.marker = new that.google.maps.Marker({
									map: that.map,
									position: results[0].geometry.location
								});

							} else {
								that.marker.setPosition(results[0].geometry.location);
								that.map.panTo(results[0].geometry.location);
							}
							that.map.setZoom(11);
							resolve();
							// console.log("Successfully got geo location of address", address);
						} else {
							reject('Geocode was not successful for the following reason: ' + status);
						}
					});

				});
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



			"setup": function() {
				var that = this;

				var browserSupportFlag = false;

				this.geocoder = new this.google.maps.Geocoder();
				this.google.maps.visualRefresh = true;
				var mapOptions = {
					center: new this.google.maps.LatLng(63.430515, 10.395053),
					zoom: 8
				};
				var element = this.el.find('#map-canvas');
				this.map = new this.google.maps.Map(element[0], mapOptions);

				// if (true) {


				// 	// Try W3C Geolocation (Preferred)
				if (navigator.geolocation) {

					browserSupportFlag = true;
					navigator.geolocation.getCurrentPosition(function(position) {
						var initialLocation = new that.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
						that.map.setCenter(initialLocation);
					}, function() {
						// handleNoGeolocation(browserSupportFlag);
					});
					// Browser does not support geo location.
				} else {
					browserSupportFlag = false;
					// handleNoGeolocation(browserSupportFlag);
				}
				browserSupportFlag = false;
			},


			"updateView": function(foodle) {
				var that = this;
				return this.onLoaded()
					.then(function() {
						if (!foodle.location) {
							return;
						}

						if (foodle.location.address) {
							that.el.find('#inputAddress').val(foodle.location.address);
							that.mapLookup();
						}
						if (foodle.location.local) {
							that.el.find('#inputLocationLocal').val(foodle.location.local);
						}

					});
			},

			"draw": function() {
				var view = {
					"_": this.app.dict.get()
				};
				this.el.children().detach();
				return this.template.render(this.el, view);
			}

		});

		return LocationInput;
	});