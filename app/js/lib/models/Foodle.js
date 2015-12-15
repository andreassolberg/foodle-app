define(function(require, exports, module) {
	"use strict";

	var
		$ = require('jquery'),
		moment = require('moment-timezone'),
		utils = require('bower/feideconnectjs/src/utils'),

		FoodleResponse = require('./FoodleResponse'),
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

		"delete": function() {
			return Foodle.api.deleteFoodle(this.identifier);
		},

		"getMyResponse": function() {
			return FoodleResponse.getFoodleMyResponse(this);
		},
		"getAllResponses": function() {
			return FoodleResponse.getFoodleAllResponses(this);
		},

		"isAdmin": function(usercontext) {
			return (usercontext.user.userid === this.owner);
		},


		"detectEditor": function() {

			if (this.editor) {
				return this.editor;
			} else if (this.columns && this.columns.length > 0 && this.columns[0].coltype === 'datetime') {
				return "dates";
			}
			return "generic";
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

		"coldefGetTimeStamps": function() {
			var ts = [];
			for (var i = 0; i < this.columns.length; i++) {

				if (this.columns[i].coltype === 'datetime') {
					ts.push(moment.tz(this.columns[i].title, this.timezone));
				}

				if (!this.columns[i].hasOwnProperty("items")) {
					continue;
				}
				for (var j = 0; j < this.columns[i].items.length; j++) {
					if (this.columns[i].items[j].coltype === 'datetime') {
						ts.push(moment.tz(this.columns[i].items[j].title, this.timezone));
					}
				}
			}
			return ts;
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

		"getView": function(tz) {
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

				if (tz) {
					res.deadline.tz(tz);
				}

				res.deadlineAgo = res.deadline.fromNow();
				res.deadlineH = res.deadline.format('ddd Do MMM YYYY HH:mm');
				res.deadlineFuture = res.deadline.isAfter(now);
			}

			res.isStored = !!this.identifier;

			return res;
		},

		"enableTZview": function() {

			if (this.detectEditor() === 'dates') {
				return true;
			}
			if (this.deadline) {
				return true;
			}
			if (this.datetime) {
				return true;
			}
			return false;
		},

		"getDateTimeView": function(timezone) {


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


			var start = moment(dt.start).tz(timezone);
			var end = moment(dt.end).tz(timezone);

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
		},

		"getViewCommonDatatypes": function() {
			var selectedDatatype = 'checkmaybe'

			for (var i = 0; i < this.columns.length; i++) {

				if (this.columns[i].coltype !== 'datetime') {
					continue;
				}

				if (this.columns[i].datatype) {
					selectedDatatype = this.columns[i].datatype;
				}
			}
			return this.getColDataTypes(selectedDatatype);
		},


		/**
		 * Get a view object for the columndefinition prepared for the Generic Editor.
		 * @return {[type]} [description]
		 */
		"getViewColDefDates": function(tz) {

			var view = {};
			view.rows = [
				[],
				[]
			];
			view.cols = [];
			view.rowopts = [];
			view.tworowheaders = true;


			var i, j, x, x2, x3, y, z;
			var dateSorted = {};



			for (i = 0; i < this.columns.length; i++) {

				if (this.columns[i].coltype !== 'datetime') {
					continue;
				}

				var ts = moment(this.columns[i].title);
				if (tz !== null) {
					ts.tz(tz);
				}

				var item = $.extend({}, this.columns[i]);
				item.ts = ts;
				item.title = ts.format('HH:mm');
				item.colspan = 1;
				item.rowspan = 1;

				var dateKey = ts.format('YYYY-MM-DD');

				if (!dateSorted.hasOwnProperty(dateKey)) {
					var dayts = ts.clone().startOf('day');
					dateSorted[dateKey] = {
						header: {
							ts: dayts,
							title: dayts.format('ddd D. MMM, YYYY'),
							idx: 'na'
						},
						items: []
					};
				}
				dateSorted[dateKey].items.push(item);

			}

			var dk;
			for (dk in dateSorted) {
				dateSorted[dk].header.colspan = dateSorted[dk].items.length;
				dateSorted[dk].header.rowspan = 1;
			}

			for (dk in dateSorted) {

				view.rows[0].push(dateSorted[dk].header);

				for (i = 0; i < dateSorted[dk].items.length; i++) {
					view.rows[1].push(dateSorted[dk].items[i]);
				}
			}



			// console.error(" ====== DATESORTED  ======");
			// console.error(JSON.stringify(dateSorted, undefined, 2));
			return view;



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
	Foodle.getNewGeneric = function() {
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

	Foodle.getNewDates = function() {
		var nf = new Foodle();
		nf.editor = 'dates';
		nf.columns = [];
		nf.coldefDetectTRH();
		return nf;
	}

	Foodle.getById = function(id) {
		return Foodle.api.getFoodleById(id);
	}

	return Foodle;

});