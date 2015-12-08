define(function(require, exports, module) {
	"use strict";

	var
		moment = require('moment-timezone'),
		$ = require('jquery'),

		Controller = require('bower/feideconnectjs/src/Controllers/Controller'),
		Dictionary = require('bower/feideconnectjs/src/Dictionary'),
		TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine');


	var template = require('text!templates/components/Timeslots.html');


	var TimeslotsController = Controller.extend({
		"init": function(app) {
			this.app = app;
			this._super();
			this.template = new TemplateEngine(template);

			this.dates = null;
			this.slots = {};

			this.ebind("click", ".actSlotDecr", "actSlotDecr");
			this.ebind("click", ".actSlotIncr", "actSlotIncr");
			this.ebind("click", ".actSlotDuplicate", "actSlotDuplicate");

			this.initLoad();
		},

		"initLoad": function() {
			var that = this;
			return this.proxy("_initLoaded");
		},

		"updateFromUI": function() {
			var that = this;
			$(".dateContainer").each(function(i, item) {
				var datevalue = $(item).data("datevalue");
				that.slots[datevalue] = [];
				$(item).find("input.timeslot").each(function(j, slotitem) {
					var value = $(slotitem).val();
					that.slots[datevalue].push(value);
				});
			});
		},

		"foo": function() {
			console.error("Foo");
		},


		"slotIncr": function(date) {
			this.updateFromUI();
			if (!this.slots.hasOwnProperty(date)) {
				this.slots[date] = [];
			}
			this.slots[date].push({});
			return this.draw();
		},
		"slotDecr": function(date) {
			this.updateFromUI();
			if (!this.slots.hasOwnProperty(date)) {
				this.slots[date] = [];
				return;
			}
			this.slots[date].pop();
			return this.draw();
		},
		"slotDuplicate": function() {
			var datevalue;
			this.updateFromUI();
			// this.updatefromUI();
			if (this.dates.length > 1) {
				datevalue = this.dates[0].format('YYYY-MM-DD');
				var copy = this.slots[datevalue];
				// console.error("Copy is ", copy);
				for (var i = 1; i < this.dates.length; i++) {
					datevalue = this.dates[i].format('YYYY-MM-DD');

					var nslots = copy.slice(0);
					// for (var j = 0; j < copy.length; j++) {
					// 	nslots.push($.extend({}, copy[j]));
					// }

					this.slots[datevalue] = nslots;
					// console.error("Into ", this.dates[i]);
				}
			}

			return this.draw();
		},



		"actSlotDecr": function(e) {
			e.preventDefault();
			e.stopPropagation();
			var x = $(e.currentTarget).closest(".dateContainer").data("datevalue");
			this.slotDecr(x);
		},
		"actSlotIncr": function(e) {
			e.preventDefault();
			e.stopPropagation();
			var x = $(e.currentTarget).closest(".dateContainer").data("datevalue");
			this.slotIncr(x);
		},
		"actSlotDuplicate": function(e) {
			e.preventDefault();
			e.stopPropagation();
			this.slotDuplicate();
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
			// console.error("PArsed", parsed);
			return parsed;
		},

		"getView": function() {

			var view = {
				dates: []
			};
			console.error("Before", this.dates);
			if (!this.dates) {
				return null;
			}
			for (var i = 0; i < this.dates.length; i++) {
				console.error("About to process ", this.dates[i]);
				var datevalue = this.dates[i].format("YYYY-MM-DD");
				var d = {
					"txt": this.dates[i].format("ddd, Do MMMM YYYY"),
					"value": datevalue
				};
				d.canMore = true;
				d.canLess = false;
				if (this.slots.hasOwnProperty(datevalue)) {
					d.timeslots = this.slots[datevalue];
					if (this.slots[datevalue].length <= 1) {
						d.canMore = true;
						d.canLess = false;
					} else if (this.slots[datevalue].length >= 10) {
						d.canMore = false;
						d.canLess = true;
					} 
					else {
						d.canMore = true;
						d.canLess = true;
					}
				}
				if (i === 0 && this.dates.length > 1) {
					d.showCopy = true;
				}
				view.dates.push(d);
			}
			view.anyDates = (this.dates.length > 0);
			return view;
		},

		"setDates": function(dates) {
			this.dates = dates;
			console.error("Dates", dates);
			for (var i = 0; i < this.dates.length; i++) {
				var datevalue = this.dates[i].format('YYYY-MM-DD');
				if (!this.slots.hasOwnProperty(datevalue)) {
					this.slots[datevalue] = ["08:00", "13:00"];
				}
			}
			return this.draw();
		},

		"draw": function() {
			var view = this.getView();
			this.el.children().detach();
			console.error("Timeslots view", JSON.stringify(view, undefined, 2));
			return this.template.render(this.el, view);
		}

	});

	return TimeslotsController;
});