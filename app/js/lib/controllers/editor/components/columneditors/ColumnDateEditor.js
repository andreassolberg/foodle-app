	define(function(require, exports, module) {
		"use strict";

		var
			$ = require('jquery'),
			moment = require('moment-timezone'),

			Controller = require('bower/feideconnectjs/src/controllers/Controller'),
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



		/*
		 * Handling of dates.
		 *
		 * The this.initialDates array is a list of Date objects 00:00 at UTC.
		 *
		 * When we load the editor with an existing foodle, the controllers is
		 *  loaded, then setFoodle(foodle)
		 *  setFoodle updates this.initialDates to UTC dates.
		 *  timeslotcontroller is updated with timestamps from Foodle.
		 *  
		 * 
		 */

		var ColumnDateEditor = ColumnEditor.extend({
			"init": function(app) {
				var that = this;

				this.template = new TemplateEngine(template);
				this.timeslotcontroller = new TimeslotsController(app);

				this._super(app);

				this.initalDates = [];

				this.restrictions = null;

				this.ebind("change", ".inputRestrictionsEnable", "updateDynamics");

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


			"updateDynamics": function() {
				var resenabled = this.el.find(".inputRestrictionsEnable").eq(0).prop("checked");
				console.error("UPDATE DYNAMICS", resenabled);
				if (resenabled) {
					this.el.find('#restr-dates-enable-maxnum-container').show();
				} else {
					this.el.find('#restr-dates-enable-maxnum-container').hide();
				}
				
			},

			"setup": function() {

				var that = this;
				return new Promise(function(resolve, reject) {
					that.dateselector = that.el.find('.dateSelector').datepicker(datesDatepickerConfig);

					that.dateselector.on('changeDate', function(data) {
						that.updateDateValuesBasedUponTimezone();
					});
					// console.error("---- NOW", moment().utc().startOf('day').toDate().UTC() );
					// console.error("setUTCDates ----- setUTCDates ", that.initialDates);
					// that.dateselector.datepicker("clearDates");
					that.dateselector.datepicker("setUTCDates", that.initialDates);
				});
			},



			"setFoodle": function(foodle) {
				this.foodle = foodle;

				this.timeslotcontroller.dates = [];
				this.timeslotcontroller.slots = {};

				var timestamps = this.foodle.coldefGetTimeStamps();
				this.timeslotcontroller.setTimestamps(timestamps);

				this.initialDates = this.timeslotcontroller.dates.map(function(item) {
					return new Date(Date.UTC(item.format('YYYY'), item.format('MM')-1, item.format('DD') ));
					// return item.clone().utc().hours(0).minutes(0).seconds(0).milliseconds(0).toDate();
				});

				this.restrictions = this.foodle.getCommonRestrictions();



			},

			"updateDateValuesBasedUponTimezone": function() {
				var utcdates = this.dateselector.datepicker("getUTCDates");
				var dates = [];
				for (var i = 0; i < utcdates.length; i++) {
					// console.error("Processing [", data.dates[i], "]")
					// console.error("Process date ", utcdates[i], "in timezone", that.foodle.timezone);
					dates.push(moment.tz(moment(utcdates[i]).format('YYYY-MM-DD'), this.foodle.timezone));
				}
				dates.sort(msort);
				this.timeslotcontroller.setDates(dates, this.foodle.timezone);
			},

			"updateFromUI": function() {

				var that = this;

				this.timeslotcontroller.updateFromUI();
				this.updateDateValuesBasedUponTimezone();
				var timestamps = this.timeslotcontroller.getTimestamps();

				// console.error("----- updateFromUI ----- ");
				// console.log("Dates", this.timeslotcontroller.dates);
				// console.log("slots", this.timeslotcontroller.slots);
				// console.error("timestamps", timestamps);


				var resenabled = this.el.find(".inputRestrictionsEnable").eq(0).prop("checked");
				var num = this.el.find(".inputMaxcheck").val();
				var xnum = parseInt(num, 10);
				if (isNaN(xnum)) {
					xnum = 1;
				}
				this.restrictions = null;
				if (resenabled) {
					this.restrictions = {
						"enabled": true,
						"maxcheck": xnum
					};
				}

	
				var datatype = this.el.find('.coldefdatatype').val();

				var columnitems = [], colitem;

				for (var i = 0; i < timestamps.length; i++) {
					colitem = {
						idx: timestamps[i].utc().format('YYYY-MM-DD HH:mm'),
						coltype: "datetime",
						datatype: datatype,
						title: timestamps[i]
					};
					if (resenabled) {
						colitem.restrictions = $.extend(true, {}, this.restrictions);
					}

					columnitems.push(colitem);
				}

				this.foodle.columns = columnitems;

			},

			"draw": function() {
				var that = this;
				var view = {
					"_": this.app.dict.get(),
					"foodle": this.foodle.getView(),
					"datatypes": this.foodle.getViewCommonDatatypes(),
					"restrictions": this.restrictions
				};
				console.error("DRAW", this.restrictions);
				// console.error("column date editor VIEW", JSON.stringify(view, undefined, 3));
				this.el.children().detach();
				return this.template.render(this.el, view)
					.then(function() {

						that.el.find('.timeslotcontroller').append(that.timeslotcontroller.el)
						that.timeslotcontroller.setDates([], that.foodle.timezone);
						that.updateDynamics();
					})
					.then(this.proxy("setup"))
					.catch(function(err) {
						console.error("Error drawing coumn date editor", err);

					})
			}


		});

		return ColumnDateEditor;
	});