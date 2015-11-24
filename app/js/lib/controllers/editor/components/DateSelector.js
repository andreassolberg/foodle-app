define(function(require, exports, module) {
	"use strict";	

	var 
		moment = require('moment-timezone'),		
		$ = require('jquery'),

		ComponentController = require('./ComponentController'),
		Dictionary = require('bower/feideconnectjs/src/Dictionary'),
		TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine')
		;

	require('bootstrap-datepicker');

	var template = require('text!templates/components/DateSelector.html');



	var showOnlyFuture = function(date) {
		var todaysDate = new Date();
		todaysDate.setHours(0, 0, 0, 0);
		// console.log("CHECK DATE OLD", date, todaysDate);
		if (date < todaysDate) {
			return false;
		}
		return true;
	};

	var stdDatepickerConfig = {
		"format": "yyyy-mm-dd",
		"todayBtn": true,
		"todayHighlight": true,
		"weekStart": 1,
		"autoclose": true,
		"beforeShowDay": showOnlyFuture
	};

	var showOnlyAfterStart = function(date) {

		// Default is today.
		var startDate = moment();
		var startDateStr = $("#inputDateStart").val();
		if (startDateStr !== '') {
			startDate = moment(startDateStr);
			startDate.add(1, 'days');
		}

		var toCheckDate = moment(date);

		// console.log("CHECK DATE", toCheckDate, startDate);

		if (toCheckDate < startDate) {
			return false;
		}
		return true;
	}
	var endDatepickerConfig = $.extend({}, stdDatepickerConfig);
	endDatepickerConfig.beforeShowDay = showOnlyAfterStart;
	endDatepickerConfig.todayHighlight = false;


	var DateSelector = ComponentController.extend({
		"init": function(app) {
			var that = this;

			this.template = new TemplateEngine(template);
			this._super(app);

			this.ebind("change", ".updatedtdynamics", "updateDynamics");

			this.initLoad();
		},

		"initLoad": function() {
			var that = this;
			return this.draw()
				.then(this.proxy("setup"))
				.then(this.proxy("_initLoaded"))
				.catch(function(err) {
					that.app.setErrorMessage("Error loading dateselector", "danger", err);
				});
		},

		"setup": function() {
			// console.error("SETU(P");
			var that = this;
			var dptimeStart = this.el.find('#inputDateStart').datepicker(stdDatepickerConfig);
			var dptimeEnd   = this.el.find('#inputDateEnd'  ).datepicker(endDatepickerConfig);

			dptimeStart.on('changeDate', function(e) {
				// console.log("Change date event on START", e);
				dptimeEnd.datepicker('update');
				that.updateDynamics();
			});
			dptimeEnd.on('changeDate', function(e) {
				that.updateDynamics();
			});


			// var dpdeadline = $('#inputDeadlineDate').datepicker(stdDatepickerConfig);
			// dpdeadline.on('changeDate', function(e) {
			// 	// console.log("Change date event", e);
			// 	that.el.find("#inputDeadlineCheck").prop('checked', true);
			// 	that.updateDynamics();
			// });

		},



		"draw": function() {
			var view = {
				"_": this.app.dict.get()
			};
			this.el.children().detach();
			return this.template.render(this.el, view);
		},


		"uiAllDay": function() {
			var inputTimeAllDay = this.el.find('#inputTimeAllDay').prop('checked');
			return inputTimeAllDay;
		},
		"uiMultipleDays": function() {
			var inputTimeMultipleDays = this.el.find('#inputTimeMultipleDays').prop('checked');
			return inputTimeMultipleDays;
		},

		"updateDynamics": function(e) {
			// console.error("Update dynamics datetime seletor");

			// var enableTime = this.el.find('#enableTime').prop('checked');
			// // console.log("enableTime", enableTime);

			// if (enableTime) {
			// 	this.el.find('#sectionTime').show();
			// 	this.el.find('#sectionTimeDetails').show();
				
			// } else {
			// 	this.el.find('#sectionTime').hide();
			// 	this.el.find('#sectionTimeDetails').hide();
			// }

			if (this.uiAllDay()) {
				this.el.find('#sectioninputTimeStart').hide();
				// this.el.find('#sectioninputDateEnd').s();
				this.el.find('#sectioninputTimeEnd').hide();
			} else {
				this.el.find('#sectioninputTimeStart').show();
				// this.el.find('#sectioninputDateEnd').hide();
				this.el.find('#sectioninputTimeEnd').show();
			}

			if (this.uiMultipleDays()) {
				// this.el.find('#sectioninputTimeStart').hide();
				this.el.find('#sectioninputDateEnd').show();
				// this.el.find('#sectioninputTimeEnd').show();
			} else {
				// this.el.find('#sectioninputTimeStart').hide();
				this.el.find('#sectioninputDateEnd').hide();
				// this.el.find('#sectioninputTimeEnd').show();
			}

			if (this.uiAllDay() && !this.uiMultipleDays()) {
				this.el.find('#sectioninputUntil').hide();
			} else {
				this.el.find('#sectioninputUntil').show();
			}

			var start = this.getDateStart();
			var end = this.getDateEnd();

			$("#timeDetails").empty();
			if (start !== null && end !== null) {
				var str = 'Event starts in <i>' + start.fromNow() + '</i>';
				str += ' and last for <i>' + start.from(end, true) + '</i>';
				$("#timeDetails").append(str );
					
			}

			// if (enableDeadline || enableTime || 
			// 	(this.columneditor.getColumntype() === 'dates') || 
			// 	(this.columneditor.getColumntype() === 'dates2')
			// 	) {

			// 	this.el.find('#sectionTimezone').show();
			// } else {
			// 	this.el.find('#sectionTimezone').hide();
			// }



			// console.log('enableDeadline', enableDeadline);
			// console.log(' enableTime',  enableTime);
			// console.log('this.columneditor.getColumntype()', this.columneditor.getColumntype());

			// console.log("start", start);
			// console.log("end", end);


		},


		"getData": function() {

			if (!this.isActive()) {
				return null;
			}

			var start = this.getDateStart();
			var end = this.getDateEnd();

			// console.error("STart", start);
			// console.error("End", end);

			return {
				start: start,
				end: end,
				allDay: this.uiAllDay(),
				multipleDays: this.uiMultipleDays()
			};
		},

		"getDateStart": function() {
			var startDateStr = this.el.find("#inputDateStart").val();
			var startTimeStr = this.el.find("#inputTimeStart").val();

			if (startDateStr === '') {return null;}
			if (this.uiAllDay()) {
				startTimeStr = '00:00';
			} else if (startTimeStr === '') {
				return null;
			}

			if (!startDateStr.match(/\d{4}-\d{2}-\d{2}/)) {
				throw new Error("Invalid date format. Correct format is 2016-04-30");
			}
			if (!startTimeStr.match(/\d{2}:\d{2}/)) {
				throw new Error("Invalid time format. Correct format is 12:00");
			}

			var fullstr = startDateStr + ' ' + startTimeStr;
			return moment(fullstr, "YYYY-MM-DD HH:mm");
		},

		"getDateEnd": function() {
			var startDateStr = this.el.find("#inputDateStart").val();
			var endDateStr = this.el.find("#inputDateEnd").val();
			var endTimeStr = this.el.find("#inputTimeEnd").val();

			if (startDateStr === '') {return null;}
			
			if (this.uiMultipleDays()) {
				if (endDateStr === '') {return null;}
			} else {
				endDateStr = startDateStr;
			}

			if (this.uiAllDay()) {
				endTimeStr = '00:00';

			} else if (endTimeStr === '') {
				return null;
			}

			if (!endDateStr.match(/\d{4}-\d{2}-\d{2}/)) {
				throw new Error("Invalid date format. Correct format is 2016-04-30");
			}
			if (!endTimeStr.match(/\d{2}:\d{2}/)) {
				throw new Error("Invalid time format. Correct format is 12:00");
			}

			var fullstr = endDateStr + ' ' + endTimeStr;

			var x = moment(fullstr, "YYYY-MM-DD HH:mm");
			if (this.uiAllDay()) {
				x.add(1, 'days');
			}
			return x;
		}

	});

	return DateSelector;
});