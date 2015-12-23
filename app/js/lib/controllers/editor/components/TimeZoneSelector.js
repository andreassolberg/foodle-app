define(function(require, exports, module) {
	"use strict";

	var
		moment = require('moment-timezone'),
		// $ = require('jquery'),
		$ = require('jquery'),

		EventEmitter = require('bower/feideconnectjs/src/EventEmitter'),
		ComponentController = require('./ComponentController');

	require('selectize');

	var TimeZoneSelector = ComponentController.extend({
		"init": function(app) {
			var that = this;
			this._super(app);
			this.initLoad();

			this.active = false;

			// this.ebind('change', "#timezoneselect", "actSetTZ");
		},

		"initLoad": function() {
			var that = this;
			return this.draw()
				.then(this.proxy("_initLoaded"))
				.catch(function(err) {
					that.app.setErrorMessage("Error loading TimeZoneSelector", "danger", err);
				});
		},

		"actSetTZ": function(value) {
			// e.preventDefault();
			// e.stopPropagation();
			// var value = $(e.currentTarget).val();
			if (this.active) {
				this.emit('tz', value);
				console.error("SET TZ", value);
			}
			// console.error("SET TZ", value);
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


		"setTZ": function(tz) {
			var that = this;
			return this.onLoaded()
				.then(function() {
					if (tz && that.timezoneOK(tz)) {
						that.active = false;
						that.selector.selectize.setValue(tz);
						that.active = true;
					}
				});
		},


		"draw": function() {

			var that = this;
			return new Promise(function(resolve, reject) {

				var zones = moment.tz.names();
				var s = $('<select id="timezoneselect" ></select>').appendTo(that.el);

				for (var i = 0; i < zones.length; i++) {
					s.append('<option value="' + zones[i] + '">' + zones[i] + '</option>');
				}
				var sres = s.selectize({
					onChange: function(value) {
						that.actSetTZ(value);
					}
				});
				that.selector = sres[0];

				that.active = true;
				resolve();
			});


		}
	}).extend(EventEmitter);

	return TimeZoneSelector;
});