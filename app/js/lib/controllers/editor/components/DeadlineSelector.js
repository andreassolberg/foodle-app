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

	var template = require('text!templates/components/Deadline.html');

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


	var DeadlineSelector = ComponentController.extend({
		"init": function(app) {
			var that = this;

			this._super(app);
			this.template = new TemplateEngine(template);

			// this.ebind("change", ".updatedtdynamics", "updateDynamics");

			this.initLoad();
		},

		"initLoad": function() {
			var that = this;
			return this.draw()
				.then(this.proxy("setup"))
				.then(this.proxy("_initLoaded"))
				.catch(function(err) {

					that.app.setErrorMessage("Error loading deadlineseletor", "danger", err);
				});
		},

		"setup": function() {

			var that = this;
			return new Promise(function(resolve, reject) {
				var dpdeadline = that.el.find('#inputDeadlineDate').datepicker(stdDatepickerConfig);
				dpdeadline.on('changeDate', function(e) {
					// console.log("Change date event", e);
					that.el.find("#inputDeadlineCheck").prop('checked', true);
					// that.updateDynamics();
				});
			});
		},

		"getData": function() {

			if (!this.isActive()) {
				return null;
			}
			
			var date = this.el.find('#inputDeadlineDate').val();
			var time = this.el.find('#inputDeadlineTime').val();

			if (!(date !== '' && time !== '')) {
				return null;
			}

			if (!date.match(/\d{4}-\d{2}-\d{2}/)) {
				throw new Error("Invalid date format. Correct format is 2016-04-30");
			}
			if (!time.match(/\d{2}:\d{2}/)) {
				throw new Error("Invalid time format. Correct format is 12:00");
			}

			var parsed = moment(date + ' ' + time, "YYYY-MM-DD HH:mm");
			console.error("PArsed", parsed);
			return parsed;
		},


		"draw": function() {
			var view = {
				"_": this.app.dict.get()
			};
			this.el.children().detach();
			return this.template.render(this.el, view);
		}

	});

	return DeadlineSelector;
});