define(function(require, exports, module) {
	"use strict";

	var
		moment = require('moment-timezone'),
		// $ = require('jquery'),
		$ = require('jquery'),

		ComponentController = require('./ComponentController');

	require('selectize');

	var TimeZoneSelector = ComponentController.extend({
		"init": function(app) {
			var that = this;
			this._super(app);
			this.initLoad();
		},

		"initLoad": function() {
			var that = this;
			return this.draw()
				.then(this.proxy("_initLoaded"))
				.catch(function(err) {
					that.app.setErrorMessage("Error loading TimeZoneSelector", "danger", err);
				});
		},

		"getData": function() {

			var tz = this.el.find('#timezoneselect').val();
			if (this.timezoneOK(tz)) {
				return tz;
			}
			return null;
		},

		"timezoneOK": function(tz) {
			var zones = moment.tz.names();
			for (var i = 0; i < zones.length; i++) {
				if (tz === zones[i]) {
					return true;
				}
			}
			return false;
		},


		"updateView": function(foodle) {
			var that = this;
			return this.onLoaded()
				.then(function() {
					if (foodle.timezone && that.timezoneOK(foodle.timezone)) {
						that.selector.selectize.setValue(foodle.timezone);
					}
				});
		},


		"draw": function() {

			var that = this;
			return new Promise(function(resolve, reject) {

				var zones = moment.tz.names();
				var s = $('<select id="timezoneselect" ></select').appendTo(that.el);

				for (var i = 0; i < zones.length; i++) {
					s.append('<option value="' + zones[i] + '">' + zones[i] + '</option>');
				}
				var sres = s.selectize();
				that.selector = sres[0];
				resolve();
			});


		}
	});

	return TimeZoneSelector;
});