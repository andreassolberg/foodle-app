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
					that.dpdeadline = that.el.find('.dateSelector').datepicker(datesDatepickerConfig);
					that.dpdeadline.on('changeDate', function(data) {
						// console.error("Dates", data.dates);
						var dates = [];
						for (var i = 0; i < data.dates.length; i++) {
							console.error("Processing [", data.dates[i], "]")
							dates.push(moment(data.dates[i]));
						}
						that.updateDates(dates);
					});
				});
			},

			"updateDates": function(dates) {
				var sdates = dates.sort(msort);
				this.timeslotcontroller.setDates(sdates);
			},


			"setFoodle": function(foodle) {
				this.foodle = foodle;
			},

			"draw": function() {
				var that = this;
				var view = {
					"_": this.app.dict.get(),
					"foodle": this.foodle.getView()
				};
				this.el.children().detach();
				return this.template.render(this.el, view)
					.then(function() {

						that.el.find('.timeslotcontroller').append(that.timeslotcontroller.el)
						that.timeslotcontroller.setDates([]);
					})
					.then(this.proxy("setup"))
			},

			"redraw": function(setColdef, modifyNumberOfColumns) {


				var coldef = setColdef;
				if (setColdef) {
					this.setColDef(setColdef);
					this.includeOptions = this.hasTwoLevels(setColdef);
					// console.log("Perform a check for two levels", setColdef, this.includeOptions);
				}
				if (!setColdef) {
					coldef = this.getColDef();
					console.log("Obtinaing coldef", coldef);
				}

				if (modifyNumberOfColumns) {
					console.log("About to adjust colnumbers...");
					console.log(this.topcolumns, this.subcolumns);
					console.log(modifyNumberOfColumns.topcolumns, modifyNumberOfColumns.subcolumns);
					this.topcolumns = modifyNumberOfColumns.topcolumns;
					this.subcolumns = modifyNumberOfColumns.subcolumns;
				}


				// this.el.empty().append(template({"_": _d}));


				this.el.find('#includeOptions').prop('checked', this.includeOptions);

				this.addTable();


				if (this.topcolumns < 2) {
					$("#removeTopColumn").attr('disabled', 'disabled');
					$("#addTopColumn").removeAttr('disabled');
				} else if (this.topcolumns > 11) {
					$("#removeTopColumn").removeAttr('disabled');
					$("#addTopColumn").attr('disabled', 'disabled');
				}


				var colNo;
				var defTable = $('#columnEditorTable');
				// console.log("Completed redraw, now filling.");
				for (var i = 0; i < coldef.length; i++) {

					defTable.find('.coldef-header').eq(i).attr('value', coldef[i].title);
					// console.log("Fill header ", defTable.find('.coldef-header').eq(i), coldef[i].title);

					if (coldef[i].hasOwnProperty('children')) {

						for (var j = 0; j < coldef[i].children.length; j++) {

							colNo = this.getColNo(i, j);
							console.log("Col no (" + i + "," + j + ")", colNo);

							defTable.find('.coldef-option').eq(colNo).attr('value', coldef[i].children[j].title);

						}

					}

				}
				console.log("Summary", this.topcolumns, this.subcolumns)
				console.log("-----");

			},


			"addTable": function() {
				var containerTable = $('<table id="columnEditorTable" class="row"></table>').appendTo(this.el.find('#columneditorMain'));

				var headerRow = this.getHeaderRow();
				containerTable.append(headerRow);

				if (this.includeOptions) {

					var optionsRow = this.getSuboptionsRow();
					containerTable.append(optionsRow);

					var subc = this.getSuboptionsControllers();
					containerTable.append(subc);

					$("#includeOptions").prop('checked', true);

				} else {

					$("#includeOptions").prop('checked', false);

				}

			},


			"getHeaderRow": function() {
				var row = $('<tr></tr>');

				var t;
				for (var i = 0; i < this.topcolumns; i++) {
					var rowspan = 1;
					if (this.subcolumns[i] === 0) {
						rowspan = 2;
					}
					t = '<td rowspan="' + rowspan + '" colspan="' + this.subcolumns[i] + '"><input style="width: 100%" class="coldef-header form-control" type="text" placeholder="' + _d.header + '" /></td>';
					row.append(t);
				}
				return row;
			},

			"getSuboptionsRow": function() {
				var row = $('<tr></tr>');

				var t;
				for (var i = 0; i < this.topcolumns; i++) {
					for (var j = 0; j < this.subcolumns[i]; j++) {
						t = '<td><input style="width: 100%" class="coldef-option form-control" type="text" placeholder="' + _d.opt + '" /></td>';
						row.append(t);
					}
				}
				return row;
			},

			"getSuboptionsControllers": function() {
				var row = $('<tr></tr>');

				var t;
				for (var i = 0; i < this.topcolumns; i++) {

					t = '<td style="text-align: left" colspan="' + this.subcolumns[i] + '" data-col-l1="' + i + '">' +
						'<button class="removeSubOpt" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-minus"></span></button>' +
						'<button class="addSubOpt" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-plus"></span></button>' +
						'</td>';
					var td = $(t);
					row.append(td);

					if (this.subcolumns[i] < 1) {
						td.find('.removeSubOpt').attr('disabled', 'disabled');
						// td.find('.removeSubOpt').removeAttr('disabled');
					} else if (this.subcolumns[i] > 4) {
						// td.find('.addSubOpt').removeAttr('disabled');
						td.find('.addSubOpt').attr('disabled', 'disabled');
					}
				}

				return row;
			}


		});

		return ColumnDateEditor;
	});