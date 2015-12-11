	define(function(require, exports, module) {
		"use strict";

		var
			$ = require('jquery'),
			moment = require('moment-timezone'),

			Controller = require('bower/feideconnectjs/src/Controllers/Controller'),
			Dictionary = require('bower/feideconnectjs/src/Dictionary'),
			TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine'),
			ColumnEditor = require('./ColumnEditor'),
			TimeslotsController = require('./TimeslotsController');

		require('bootstrap-datepicker');

		var template = require('text!templates/components/ColumnDateEditor.html');

		var showOnlyFuture = function(date) {
			var todaysDate = new Date();
			todaysDate.setHours(0, 0, 0, 0);
			// console.log("CHECK DATE OLD", date, todaysDate);
			if (date < todaysDate) {
				return false;
			}
			return true;
		};

		var datesDatepickerConfig = {
			"format": "yyyy-mm-dd",
			"todayBtn": true,
			"todayHighlight": true,
			"weekStart": 1,
			"autoclose": false,
			"beforeShowDay": showOnlyFuture,
			"multidate": true
		};


		var msort = function(a, b) {
			if (a.isBefore(b)) {
				return -1;
			}
			if (b.isBefore(a)) {
				return 1;
			}
			return 0;
		}


		var ColumnDateEditor = ColumnEditor.extend({
			"init": function(app) {
				var that = this;

				this.template = new TemplateEngine(template);
				this.timeslotcontroller = new TimeslotsController(app);

				this._super(app);

				this.initalDates = [];


				this.initLoad();
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

			"setup": function() {

				var that = this;
				return new Promise(function(resolve, reject) {
					that.dateselector = that.el.find('.dateSelector').datepicker(datesDatepickerConfig);

					that.dateselector.on('changeDate', function(data) {
						// console.error("Dates", data.dates);
						var dates = [];
						for (var i = 0; i < data.dates.length; i++) {
							// console.error("Processing [", data.dates[i], "]")
							dates.push(moment(data.dates[i]));
						}
						that.updateDates(dates);
					});
					console.error("setUTCDates ----- setUTCDates ", that.initialDates);
					// that.dateselector.datepicker("clearDates");
					that.dateselector.datepicker("setDates", that.initialDates);
				});
			},

			"updateDates": function(dates) {
				var sdates = dates.sort(msort);
				this.timeslotcontroller.setDates(sdates);
			},


			"setFoodle": function(foodle) {
				this.foodle = foodle;

				this.timeslotcontroller.dates = [];
				this.timeslotcontroller.slots = {};


				var timestamps = this.foodle.coldefGetTimeStamps();
				this.timeslotcontroller.setTimestamps(timestamps);

				this.initialDates = this.timeslotcontroller.dates.map(function(item) {
					return item.clone().toDate();
				});



			},

			"updateFromUI": function() {

				this.timeslotcontroller.updateFromUI();
				var timestamps = this.timeslotcontroller.getTimestamps();

				console.error("----- updateFromUI ----- ");
				console.log("Dates", this.timeslotcontroller.dates);
				console.log("slots", this.timeslotcontroller.slots);
				console.error("timestamps", timestamps);

				var datatype = this.el.find('.coldefdatatype').val();

				var columnitems = [];

				for (var i = 0; i < timestamps.length; i++) {
					columnitems.push({
						idx: timestamps[i].utc().format('YYYY-MM-DD HH:mm'),
						coltype: "datetime",
						datatype: datatype,
						title: timestamps[i]
					});
				}

				this.foodle.columns = columnitems;

			},

			"draw": function() {
				var that = this;
				var view = {
					"_": this.app.dict.get(),
					"foodle": this.foodle.getView(),
					"datatypes": this.foodle.getViewCommonDatatypes()
				};
				console.error("column date editor VIEW", JSON.stringify(view, undefined, 3));
				this.el.children().detach();
				return this.template.render(this.el, view)
					.then(function() {

						that.el.find('.timeslotcontroller').append(that.timeslotcontroller.el)
						that.timeslotcontroller.setDates([]);
					})
					.then(this.proxy("setup"))
					.catch(function(err) {
						console.error("Error drawing coumn date editor", err);

					})
			}


		});

		return ColumnDateEditor;
	});