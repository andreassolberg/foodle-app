define(function(require, exports, module) {
	"use strict";

	var
		$ = require('jquery'),
		moment = require('moment-timezone'),
		utils = require('bower/feideconnectjs/src/utils'),
		Model = require('bower/feideconnectjs/src/models/Model');

	function parseDate(input) {
		var x = input.substring(0, 19) + 'Z';
		// console.log("About to parse date " + input, x);
		return moment(x);
	}



	var Foodle = Model.extend({
		"init": function(props) {
			this._super(props);
			this.coldefDetectTRH();
		},

		"save": function(fc) {
			var obj = this.getProperties(['title', 'descr', 'parent', 'deadline', 'location', 'publicresponses', 'datetime', 'timezone', 'defaults', 'columns', 'admins', 'groups']);


			if (this.identifier) {
				console.error("Updating an existing Foodle")
				return Foodle.api.updateFoodle(this.identifier, obj);
			} else {
				console.error("Createing a new Foodle");
				return Foodle.api.saveFoodle(obj);
			}



		},

		// Detect two row header
		"coldefDetectTRH": function() {
			var i;
			this.tworowheaders = false;
			if (!this.hasOwnProperty("columns")) {
				return;
			}

			for (i = 0; i < this.columns.length; i++) {
				if (this.columns[i].hasOwnProperty("items")) {
					this.tworowheaders = true;
					return;
				}
			}

		},

		"coldefSetTitle": function(colid, title) {
			var item = this.coldefGetById(colid);
			if (item === null) {
				return;
			}
			item.title = title;
		},

		"coldefSetDataType": function(colid, datatype) {
			var item = this.coldefGetById(colid);
			if (item === null) {
				return;
			}
			item.datatype = datatype;
		},

		"coldefSetRestrictionsMaxcheck": function(colid, num) {
			var item = this.coldefGetById(colid);
			console.error("Setting coldefSetRestrictionsMaxcheck on", colid, num, item);
			if (item === null) {
				return;
			}
			if (item.hasOwnProperty("restrictions")) {
				item.restrictions.maxcheck = num;
			}
			console.error("item", item.restrictions);
		},
		"coldefSetRestrictionsMaxnum": function(colid, num) {
			var item = this.coldefGetById(colid);
			if (item === null) {
				return;
			}
			if (item.hasOwnProperty("restrictions")) {
				item.restrictions.maxnum = num;
			}
		},

		"coldefSetRestrictionsEnabled": function(colid, checked) {
			var item = this.coldefGetById(colid);

			// console.error("Seting › coldefSetRestrictionsEnabled", colid, checked);

			if (item === null) {
				return;
			}

			if (!checked) {
				delete item.restrictions;
			} else {
				if (!item.hasOwnProperty("restrictions")) {
					item.restrictions = {};
				}
				item.restrictions.enabled = true;
				if (item.datatype === 'check' ||  item.datatype === 'checkmaybe') {
					item.restrictions.maxcheck = ' ';
					if (item.restrictions.hasOwnProperty('maxnum')) {
						delete item.restrictions.maxnum;
					}
				} else if (item.datatype === 'number') {
					item.restrictions.maxnum = ' ';
					if (item.restrictions.hasOwnProperty('maxnum')) {
						delete item.restrictions.maxcheck;
					}
				}
			}

		},

		"coldefHasTwoLevel": function() {
			return this.tworowheaders;
		},


		"coldefColIncr": function() {
			var ni = Foodle.getEmptyColDefItem();
			if (this.coldefHasTwoLevel()) {
				ni.items = [Foodle.getEmptyColDefItem()];
			}
			this.columns.push(ni);
		},

		"coldefColDecr": function() {
			this.columns.pop();
		},

		"coldefSubIncr": function(colid) {
			var item = this.coldefGetById(colid);
			this.tworowheaders = true;
			if (item !== null) {
				if (!item.hasOwnProperty("items")) {
					item.items = [];
				}
				item.items.push(Foodle.getEmptyColDefItem());
			}
		},

		"coldefSubDecr": function(colid) {
			var item = this.coldefGetById(colid);
			if (item !== null) {
				if (item.hasOwnProperty("items")) {
					item.items.pop();
				}
			}
		},

		"coldefSetTwoHeaderRows": function(include) {
			var i;

			this.tworowheaders = include;
			if (include) {
				for (i = 0; i < this.columns.length; i++) {
					if (!this.columns[i].hasOwnProperty("items") ||  this.columns[i].items.length === 0) {
						this.columns[i].items = [];
						this.columns[i].items.push(Foodle.getEmptyColDefItem());
						this.columns[i].items.push(Foodle.getEmptyColDefItem());
					}
				}
			} else {
				for (i = 0; i < this.columns.length; i++) {
					if (this.columns[i].hasOwnProperty("items")) {
						delete this.columns[i].items;
					}
				}
			}

		},

		"coldefGetById": function(colid) {
			var i, j;
			for (i = 0; i < this.columns.length; i++) {
				if (this.columns[i].idx === colid) {
					return this.columns[i];
				}

				if (this.columns[i].hasOwnProperty("items")) {
					for (j = 0; j < this.columns[i].items.length; j++) {

						if (this.columns[i].items[j].idx === colid) {
							return this.columns[i].items[j];
						}
					}
				}
			}
			return null;
		},


		"getProperties": function(props) {

			var obj = {};
			for (var i = 0; i < props.length; i++) {
				if (this.hasOwnProperty(props[i])) {
					obj[props[i]] = this[props[i]];
				}
			}
			return obj;
		},

		"getView": function() {
			var res = this._super();

			var now = moment();

			if (this.created) {
				res.created = moment(this.created);
				res.createdAgo = res.created.fromNow();
				res.createdH = res.created.format('D. MMM YYYY');
			}

			if (this.updated) {
				res.updated = moment(this.updated);
				res.updatedAgo = res.updated.fromNow();
				res.updatedH = res.updated.format('D. MMM YYYY');
			}

			if (this.deadline) {
				res.deadline = moment(this.deadline);
				res.deadlineAgo = res.deadline.fromNow();
				res.deadlineH = res.deadline.format('ddd Do MMM YYYY HH:mm');
				res.deadlineFuture = res.deadline.isAfter(now);
			}

			res.isStored = !!this.identifier;

			return res;
		},

		"getDateTimeView": function() {


			if (!this.datetime) {
				return null;
			}

			var dt = this.datetime;

			if (!dt.start) {
				return null;
			}
			if (!dt.end) {
				return null;
			}


			var start = moment(dt.start);
			var end = moment(dt.end);

			var display1 = null;
			var display2 = null;

			if (dt.allDay && dt.multipleDays) {
				display1 = start.format('Do MMM') + ' – ' + end.format('Do MMM, YYYY')
			} else if (dt.allDay && !dt.multipleDays) {
				display1 = start.format('ddd Do MMM, YYYY');				
			} else if (!dt.allDay && dt.multipleDays) {
				display1 = start.format('ddd Do MMM, YYYY HH:mm');
				display2 = '- ' + end.format('ddd Do MMM, YYYY HH:mm');
			} else {
				display1 = start.format('ddd Do MMM, YYYY');
				display2 = start.format('HH:mm') + ' - ' + end.format('HH:mm');
			}

			var untilStart = start.fromNow();
			var duration = end.from(start, true);
			var now = moment();
			var future = start.isAfter(now);
			var endfuture = end.isAfter(now);

			return {
				display1: display1,
				display2: display2,
				until: untilStart,
				future: future,
				endfuture: endfuture,
				duration: duration
			};




			// var dt = this.foodle.datetime;
			// var ct = $('#sectTime').empty();
			// var mf, mt;


			// var doTimezone = false;
			// if (this.foodle.timezone && toTimezone) doTimezone = true;


			// // console.log("Set time", dt);

			// // Date range, full days
			// if (dt.datefrom && dt.dateto && !dt.timefrom && !dt.timeto) {
			// 	// console.log("Set time (1)", dt);
			// 	mf = moment(dt.datefrom, 'YYYY-MM-DD');
			// 	mt = moment(dt.dateto,   'YYYY-MM-DD');
			// 	ct.append('<p>' + mf.format('ddd Do MMM') + ' to ' + mt.format('ddd Do MMM, YYYY')  + '</p>');
			// } else if (dt.datefrom && dt.dateto && dt.timefrom && dt.timeto) {
			// 	// console.log("Set time (2)", dt);
				
			// 	if (doTimezone) {
			// 		mf = moment.tz(dt.datefrom + ' ' + dt.timefrom, this.foodle.timezone).tz(toTimezone);
			// 		mt = moment.tz(dt.dateto   + ' ' + dt.timeto,   this.foodle.timezone).tz(toTimezone);
			// 	} else {
			// 		mf = moment(dt.datefrom + ' ' + dt.timefrom, 'YYYY-MM-DD HH:mm');
			// 		mt = moment(dt.dateto   + ' ' + dt.timeto,   'YYYY-MM-DD HH:mm');
			// 	}


			// 	ct.append('<p>' + mf.format('ddd Do MMM, YYYY, HH:mm') + '</p>');
			// 	ct.append('<p>to</p>');
			// 	ct.append('<p>' + mt.format('ddd Do MMM, YYYY, HH:mm') + '</p>');
			// } else if (dt.datefrom && !dt.dateto && dt.timefrom && dt.timeto) {
			// 	// console.log("Set time (3)", dt);

			// 	if (doTimezone) {
			// 		mf = moment.tz(dt.datefrom + ' ' + dt.timefrom, this.foodle.timezone).tz(toTimezone);
			// 		mt = moment.tz(dt.datefrom + ' ' + dt.timeto,   this.foodle.timezone).tz(toTimezone);
			// 	} else {
			// 		mf = moment(dt.datefrom + ' ' + dt.timefrom, 'YYYY-MM-DD HH:mm');
			// 		mt = moment(dt.datefrom + ' ' + dt.timeto,   'YYYY-MM-DD HH:mm');
			// 	}


			// 	ct.append('<p class="s-lg">' + mf.format('ddd Do MMM, YYYY') + '</p>');
			// 	ct.append('<p class="s-lg">' + mf.format('HH:mm') + ' – ' + mt.format('HH:mm') + '</p>');
			// } else if (dt.datefrom && !dt.dateto && !dt.timefrom && !dt.timeto) {
			// 	// console.log("Set time (4)", dt);
			// 	mf = moment(dt.datefrom, 'YYYY-MM-DD');
			// 	ct.append('<p>' + mf.format('ddd Do MMM, YYYY') + '</p>');
			// }

			// if (mf) {
			// 	ct.append('<p class="time-fromnow">Event starts in ' + mf.fromNow() + '</p>');
			// }
			// if (mf && mt) {
			// 	ct.append('<p class="time-duration">Event last for ' + mt.from(mf, true) + '</p>');	
			// }

		},


		"getColDataTypes": function(sel) {
			var candidates = {
				"check": "Yes/No",
				"checkmaybe": "Yes/Maybe/No",
				"radio": "Radio (select one of)",
				"number": "Number",
				"text": "Text"
			};

			if (!candidates.hasOwnProperty(sel)) {
				sel = "check";
			}

			var view = [];
			for (var key in candidates) {
				view.push({
					"id": key,
					"title": candidates[key],
					"selected": (sel === key)
				});
			}
			return view;
		},


		/**
		 * Get a view object for the columndefinition prepared for the Generic Editor.
		 * @return {[type]} [description]
		 */
		"getViewColDefGeneric": function() {

			var view = {};
			view.rows = [
				[],
				[]
			];
			view.cols = [];
			view.rowopts = [];

			view.tworowheaders = this.tworowheaders;

			var i, j, x, x2, x3, y, z;

			for (i = 0; i < this.columns.length; i++) {

				x = $.extend(true, {}, this.columns[i]);
				x2 = $.extend(true, {}, this.columns[i]);
				x3 = {}

				x3.itemcount = 0;
				x3.idx = x.idx;


				if (this.columns[i].hasOwnProperty("items") && this.columns[i].items.length > 0) {
					delete x.items;

					x3.itemcount = this.columns[i].items.length;
					for (j = 0; j < this.columns[i].items.length; j++) {

						y = $.extend(true, {}, this.columns[i].items[j]);
						y.datatypes = this.getColDataTypes(y.datatype);
						view.cols.push(y);

						z = $.extend(true, {}, this.columns[i].items[j]);
						z.colspan = 1;
						z.rowspan = 1;
						view.rows[1].push(z);

					}
					x.colspan = this.columns[i].items.length;
					x.rowspan = 1;


				} else {
					x.colspan = 1;
					x.rowspan = 2;

					x2.datatypes = this.getColDataTypes(x2.datatype);
					view.cols.push(x2);
				}
				x3.colspan = x.colspan;
				x3.itemMayIncrease = true;
				x3.itemMayDecrease = true;
				if (x3.itemcount < 1) {
					x3.itemMayDecrease = false;
				}
				if (x3.itemcount > 8) {
					x3.itemMayIncrease = false;
				}
				view.rowopts.push(x3);

				view.rows[0].push(x);

			}
			return view;
		}

	});


	Foodle.getEmptyColDefItem = function() {
		return {
			"idx": utils.guid(),
			"coltype": "text",
			"datatype": "check"
		};
	}

	Foodle.getNew = function() {
		var nf = new Foodle();
		nf.columns = [

			{
				"title": "Blank",
				"idx": "2373465",
				"items": [{
					"idx": "123",
					"title": "Jeg deltar",
					"coltype": "text",
					"datatype": "checkmaybe",
					"restrictions": {
						"enabled": true,
						"maxcheck": 5
					}
				}],
				"coltype": "text",
				"datatype": "none"
			},

			{
				"title": "Kjører selv",
				"idx": "237fgh65",
				"coltype": "text",
				"datatype": "check"
			},

			{
				"title": "Hvilken type bil",
				"idx": "23734hjk5",
				"coltype": "text",
				"datatype": "none",

				"items": [{
					"title": "Toyota",
					"idx": "18237",
					"coltype": "text",
					"datatype": "check",
				}, {
					"title": "Ford",
					"idx": "144",
					"coltype": "text",
					"datatype": "number",
					"restrictions": {
						"enabled": true,
						"maxnum": 500
					}
				}]
			}

		];
		nf.coldefDetectTRH();
		return nf;
	}

	Foodle.getById = function(id) {
		return Foodle.api.getFoodleById(id);
	}

	return Foodle;

});