define(function(require) {
	"use strict";

	var

		$ = require('jquery'),
		moment = require('moment-timezone'),

		Pane = require('bower/feideconnectjs/src/controllers/Pane'),
		Waiter = require('bower/feideconnectjs/src/controllers/Waiter'),
		Dictionary = require('bower/feideconnectjs/src/Dictionary'),
		TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine'),
		utils = require('bower/feideconnectjs/src/utils'),

		Foodle = require('../../models/Foodle'),

		DateSelector = require('./components/DateSelector'),
		DeadlineSelector = require('./components/DeadlineSelector'),
		TimeZoneSelector = require('./components/TimeZoneSelector'),
		LocationInput = require('./components/LocationInput'),
		GroupSelector = require('./components/GroupSelector'),

		ColumnGenericEditor = require('./components/columneditors/ColumnGenericEditor'),
		ColumnDateEditor = require('./components/columneditors/ColumnDateEditor')
		;


	var editorTemplate = require('text!templates/FoodleEditor.html');

	var FoodleEditor = Pane.extend({
		"init": function(feideconnect, app) {

			var that = this;
			this.feideconnect = feideconnect;
			this.app = app;

			this.foodle = null;

			this._super();

			this.template = new TemplateEngine(editorTemplate);
			this.ebind("change", ".updatedynamics", "updateDynamics");
			this.ebind("click", "#submitFoodle", "actSubmit");

			this.dateselector = new DateSelector(this.app);
			this.deadlineselector = new DeadlineSelector(this.app);
			this.timezoneselector = new TimeZoneSelector(this.app);
			this.locationinput = new LocationInput(this.app);
			this.groupselector = new GroupSelector(this.app);

			this.columneditors = {
				"dates": new ColumnDateEditor(this.app),
				"generic": new ColumnGenericEditor(this.app)
			};
			this.columneditor = null;

			this.initLoad();
		},

		"initLoad": function() {

			return Promise.resolve()
				.then(this.proxy("_initLoaded"));

		},

		"setTabHashFragment": function(tabid) {
			var orgid = this.app.orgid;
			this.app.app.setHash('/' + orgid + '/clients/' + this.current.id + '/edit/' + tabid);
		},

		"setFocusTitle": function() {
			this.el.find("#inputTitle").focus();
		},

		"detectEditorType": function() {
			this.columneditor = this.columneditors.generic;
		},

		"edit": function(foodle) {
			var that = this;
			console.error("About to edit foodle", foodle);
			this.foodle = foodle;
			this.detectEditorType();
			this.columneditor.setFoodle(this.foodle);
			this.columneditor.draw();
			return this.draw();
		},

		"draw": function() {

			var that = this;
			console.error("About to edit draw");
			console.error(this.foodle.getView());

			var view = {
				"_": this.app.dict.get(),
				"foodle": this.foodle.getView()
			};

			console.error("View..", view);
			this.el.children().detach();

			return this.template.render(this.el, view)
				.then(function() {
					that.activate();
				})
				.then(function() {
					// that.el.find("#inputTitle").css('border', '2px solid red');
					that.el.find('.datetimesection').append(that.dateselector.el);
					that.el.find('.deadlineselector').append(that.deadlineselector.el);
					that.el.find('#timezoneselector').append(that.timezoneselector.el);
					that.el.find('#sectionLocationDetails').append(that.locationinput.el);
					that.el.find('#sectionGroups').append(that.groupselector.el);
					
					that.el.find('#columneditor').append(that.columneditor.el);
					
					that.setFocusTitle();
					that.updateDynamics();
				})
				.catch(function(err) {
					that.app.setErrorMessage("Error loading client editor", "danger", err);
				});

		},

		"actSubmit": function(e) {

			e.preventDefault();
			e.stopPropagation();
			var that = this;

			this.validate();
			that.submitFoodle();
			// return;

			// if (that.foodle.hasOwnProperty('identifier')) {
			// 	// console.log("Update existing foodle " + that.foodle.identifier);
			// 	that.updateFoodle(that.foodle.identifier);
			// } else {
			// 	// console.log("Create new foodle");
			// 	that.submitFoodle();	
			// }
		},



		"validate": function() {

			var title = $('#inputTitle').val();
			if (title === '') {
				$('#form-group-title').addClass('has-error');
				this.setFocusTitle();
				var txt = "Cannot save Foodle: Missing title.";
				this.app.setErrorMessage(txt, "warning");
				throw new Error(txt);
			} else {
				$('#form-group-title').removeClass('has-error');
			}

		},



		// "setupFeedSelector": function() {

		// 	// console.error('This user feeds', this.user);

		// 	if (this.user.feeds && this.user.feeds.length > 0) {

		// 		$('#sectionFeed').show();
		// 		// $('#feedSelector').append('<option value="_">Select which feed to publish</option>')

		// 		for (var i = 0; i < this.user.feeds.length; i++) {
		// 			$('#feedSelector').append('<option value="' +this.user.feeds[i].id  + '">' + 
		// 				this.user.feeds[i].title + '</option>')
					
		// 		}


		// 	} else {
		// 		$('#sectionFeed').hide();
		// 	}


		// },


		"updateColSelector": function() {

			if (!$('#enableRestrictions').prop('checked')) {return;}

			$('#inputRestrictionColSelector').empty();
			var coldef = this.columneditor.getColDef();
			var collist = this.getColList(coldef);

			for(var i = 0; i < collist.length; i++) {
				var x = $('<option value="' + i + '"></option>');
				x.text(collist[i]);
				$('#inputRestrictionColselector').append(x);
			}

		},


		/*
		 * Transform an hierarchical list to a flat list.
		 */
		"getColList": function(coldef) {
			var list = [];

			for(var i = 0; i < coldef.length; i++) {
				if (coldef[i].hasOwnProperty('children')) {
					for(var j = 0; j < coldef[i].children.length; j++) {
						list.push(coldef[i].children[j].title + ' (' + coldef[i].title + ')')
					}
				} else {
					list.push(coldef[i].title);
				}
			}

			return list;

		},


		"updateUI": function() {

			// console.error("update ui with ", this.foodle.columns);

			if (this.foodle.columns) {
				// console.log("Updating UI with columns ", this.foodle.columntype)
				this.columneditor.redraw(this.foodle.columns, this.foodle.columntype);

			}


			if (this.foodle.feed) {
				// console.log("Set feeed selector to", this.foodle.feed);
				$('#feedSelector option[value="' + this.foodle.feed + '"]').attr('selected', 'selected');
				$('#enableFeed').prop('checked', true);
			} else {
				$('#enableFeed').prop('checked', false);
			}

			if (this.foodle.location) {
				this.el.find('#enableLocation').prop('checked', true);

				if (this.foodle.location.local) {
					this.el.find('#inputLocationLocal').val(this.foodle.location.local);
				}
				if (this.foodle.location.address) {
					this.el.find('#inputAddress').val(this.foodle.location.x.address);
					this.codeAddress();
				}

			} else {
				this.el.find('#enableLocation').prop('checked', false);

			}



			// 	var enabledCollimit = this.el.find('#enableRestrictionColLimit').prop('checked');
			// 	if (enabledCollimit) {
			// 		var no = parseInt(this.el.find('#inputRestrictionColLimit').val(), 10);
			// 		var colno = parseInt(this.el.find('#inputRestrictionColselector').val());

			// 		if (no !== null && colno !== null) {
			// 			restr.col = {
			// 				'col': colno,
			// 				'limit': no
			// 			};

			// 		}
			// 	}

	

			if (this.foodle.restrictions) {


				this.el.find('#enableRestrictions').prop('checked', true);
				// this.updateColSelector();

				if (this.foodle.restrictions.rows) {
					this.el.find('#enableRestrictionRowlimit').prop('checked', true);
					this.el.find('#inputRestrictionRowlimit').val(this.foodle.restrictions.rows)

				} else {
					this.el.find('#enableRestrictionRowlimit').prop('checked', false);
				}

				if (this.foodle.restrictions.col) {
					this.el.find('#enableRestrictionColLimit').prop('checked', true);

					if (this.foodle.restrictions.col.limit) {
						this.el.find('#inputRestrictionColLimit').val(this.foodle.restrictions.col.limit);	
					}
					if (this.foodle.restrictions.col.col) {
						this.el.find('#inputRestrictionColselector').val(this.foodle.restrictions.col.col);
					}
					
					

				} else {
					this.el.find('#enableRestrictionColLimit').prop('checked', false);
				}

				if (this.foodle.restrictions.checklimit) {
					this.el.find('#enableRestrictionCheckLimit').prop('checked', true);
					this.el.find('#inputRestrictionCheckLimit').val(this.foodle.restrictions.checklimit)

				} else {
					this.el.find('#enableRestrictionCheckLimit').prop('checked', false);
				}

			} else {

				this.el.find('#enableRestrictions').prop('checked', false);

			}


			if (this.foodle.expire) {
				var em = moment.unix(parseInt(this.foodle.expire, 10));
				// console.log("Expiration ", this.foodle.expire, em);
				this.el.find('#inputDeadlineDate').val(em.format('YYYY-MM-DD'));
				this.el.find('#inputDeadlineTime').val(em.format('HH:mm'));
				this.el.find('#enableDeadline').prop('checked', true);
			} else {
				this.el.find('#enableDeadline').prop('checked', false);
			}



			if (this.foodle.allowanonymous) {
				$('#inputRequireLogin').prop('checked', false);
			} else {
				$('#inputRequireLogin').prop('checked', true);
			}

			if (this.foodle.responsetype && this.foodle.responsetype === 'yesnomaybe') {
				$('#inputResponseTypeMaybe').prop('checked', true);
			} else {
				$('#inputResponseTypeMaybe').prop('checked', false);
			}


			if (this.foodle.columntype && this.foodle.columntype === 'dates' ) {
				// console.error('Not implemented yet');
			}


			if (this.foodle.datetime) {
				this.el.find('#enableTime').prop('checked', true);

				if (this.foodle.datetime.datefrom) 	this.el.find('#inputDateStart').val(this.foodle.datetime.datefrom);
				if (this.foodle.datetime.dateto) 	this.el.find('#inputDateEnd').val(this.foodle.datetime.dateto);
				if (this.foodle.datetime.timefrom) 	this.el.find('#inputTimeStart').val(this.foodle.datetime.timefrom);
				if (this.foodle.datetime.timeto) 	this.el.find('#inputTimeEnd').val(this.foodle.datetime.timeto);

				this.el.find('#inputTimeMultipleDays').prop('checked', this.foodle.datetime.hasOwnProperty('datetto'));
				this.el.find('#inputTimeAllDay').prop('checked', !this.foodle.datetime.hasOwnProperty('timefrom'));

			} else {
				this.el.find('#enableTime').prop('checked', false);
			}


			if (this.foodle.timezone) {
				this.el.find('#timezoneselect').val(this.foodle.timezone);
			}



		},

		// "updateFoodle": function(identifier) {

			
		// 	// console.log(def);
		// 	// $("#debug").empty().append(JSON.stringify(def, undefined, 4) );

		// 	var def = this.getObject();
		// 	var foodle = new Foodle(def);
		// 	foodle.identifier = identifier;

		// 	// console.log("UPDATE FOODLE", def); return;

		// 	this.api.updateFoodle(foodle, function(response) {
		// 		// console.log("Successfully updated foodle", response);
		// 		window.location.href = '/foodle/' + identifier;

		// 	});



		// },

		"submitFoodle": function() {

			var foodle = this.getFoodleFromUI();
			foodle.save();
			
			// this.api.createNewFoodle(foodle, function(response) {
			// 	// console.log("Successfully created new foodle", response);
			// 	var identifier = response.identifier;

			// 	$('#submitFoodle').addClass('disabled');
			// 	$('#modalSuccess').modal({
			// 		'backdrop': true,
			// 		'show': true,
			// 		'keyboard': false
			// 	});
			// 	$('#modalSuccess').on('click', '.actContinue', function() {
			// 		// console.log('REDIRECT TO ');
			// 		window.location.href = '/foodle/' + identifier;
			// 	});


			// 	$('#shareURL').attr('value', 'http://foodl.org/foodle/' + identifier);

			// });

		},


		// "getFoodleFromUI": function() {

		// 	var foodle = new Foodle();

		// 	foodle.title = $('#inputTitle').val();
		// 	foodle.descr = $('#inputDescr').val();

		// 	try {
		// 		// foodle.parent 
		// 		foodle.location = this.locationinput.getData();
		// 		foodle.timezone = this.timezoneselector.getData();
		// 		foodle.datetime = this.dateselector.getData();
		// 		foodle.deadline = this.deadlineselector.getData();

		// 		foodle.groups = this.groupselector.getGroups();

		// 	} catch(err) {
		// 		this.app.setErrorMessage("Error in user input", "danger", err);
		// 	}



		// 	// foodle.coldef = this.columneditor.getColDef();
		// 	// foodle.columntype = this.columneditor.getColumntype();
		// 	// console.log("User feed", this.user);
			



		// 	this.el.find("#debug").empty().append(JSON.stringify(foodle, undefined, 2));

		// 	return foodle;

		// 	// if (this.user.feeds) {

		// 	// 	var fenabled = $('#enableFeed').prop('checked');
		// 	// 	var f = $('#feedSelector').val();

		// 	// 	// console.log("Feed enabled", fenabled, f);

		// 	// 	if (f !== '_' && fenabled) {
		// 	// 		obj.feed = f;
		// 	// 	}
		// 	// } else {
		// 	// 	if (obj.feed) {
		// 	// 		delete obj.feed;
		// 	// 	}
		// 	// }



		// 	// 'text'; // Or 'dates'


		// 	var enableLocation = this.el.find('#enableLocation').prop('checked');
		// 	if (enableLocation) {
		// 		var l = {};
		// 		var loc = this.el.find('#inputLocationLocal').val();
		// 		if (loc !== '') {
		// 			l.local = loc;
		// 		}
		// 		var adr = this.el.find('#inputAddress').val();
		// 		if (adr !== '') {
		// 			l.address = adr;
		// 		}

		// 		if (loc !== '' || adr !== '') {
		// 			obj.location = l;
		// 		}
		// 	} 


		// 	var enableRestrictions = this.el.find('#enableRestrictions').prop('checked');
		// 	// console.log("enableRestrictions", enableRestrictions);

		// 	if (enableRestrictions) {
				
		// 		var restr = {};

		// 		var enabledRowlimit = this.el.find('#enableRestrictionRowlimit').prop('checked');
		// 		if (enabledRowlimit) {
		// 			var no = parseInt(this.el.find('#inputRestrictionRowlimit').val(), 10);
		// 			if (no !== null) {
		// 				restr.rows = no;
		// 			}
					
		// 		}

		// 		var enabledCollimit = this.el.find('#enableRestrictionColLimit').prop('checked');
		// 		if (enabledCollimit) {
		// 			var no = parseInt(this.el.find('#inputRestrictionColLimit').val(), 10);
		// 			var colno = parseInt(this.el.find('#inputRestrictionColselector').val());

		// 			if (no !== null && colno !== null) {
		// 				restr.col = {
		// 					'col': colno,
		// 					'limit': no
		// 				};

		// 			}
		// 		}

		// 		var enabledCheckLimit = this.el.find('#enableRestrictionCheckLimit').prop('checked');
		// 		if (enabledCheckLimit) {
		// 			var no = parseInt(this.el.find('#inputRestrictionCheckLimit').val(), 10);

		// 			if (no !== null) {
		// 				restr.checklimit = no;
		// 			}
					
		// 		}


		// 		obj.restrictions = restr;

		// 	} else {
		// 		this.el.find('#sectionRestrictions').hide();
		// 	}



		// 	var enableDeadline = this.el.find('#enableDeadline').prop('checked');
		// 	if (enableDeadline) {

		// 		var dldate = this.el.find('#inputDeadlineDate').val();
		// 		var dltime = this.el.find('#inputDeadlineTime').val();

		// 		if (dldate !== '' && dltime !== '') {
		// 			var dl = moment(dldate + ' ' + dltime, 'YYYY-MM-DD HH:mm');
		// 			// console.log("deadline date ", dldate + ' ' + dltime, dl);
		// 			obj.expire = dl.unix();
		// 		}


		// 	} 


		// 	var reqlogin = $('#inputRequireLogin').prop('checked');
		// 	obj.allowanonymous = !reqlogin;
			

		// 	var maybe = $('#inputResponseTypeMaybe').prop('checked');
		// 	obj.responsetype = (maybe ? 'yesnomaybe' : 'yesno');

			



		// 	var enableTime = this.el.find('#enableTime').prop('checked');
		// 	// console.log("enableTime", enableTime);

		// 	if (enableTime) {

		// 		var datetime = {};

		// 		var datefrom = this.el.find('#inputDateStart').val();
		// 		var dateto   = this.el.find('#inputDateEnd').val();
		// 		var timefrom = this.el.find('#inputTimeStart').val();
		// 		var timeto   = this.el.find('#inputTimeEnd').val();


		// 		// if (datefrom !== '') datetime.datefrom = datefrom;
		// 		// if (dateto !== '')   datetime.dateto = dateto;
		// 		// if (timefrom !== '') datetime.timefrom = timefrom;
		// 		// if (timeto !== '')   datetime.timeto = timeto;


		// 		var inputTimeAllDay = this.el.find('#inputTimeAllDay').prop('checked');
		// 		var inputTimeMultipleDays = this.el.find('#inputTimeMultipleDays').prop('checked');


		// 		if (inputTimeAllDay && inputTimeMultipleDays) {
					
		// 			if (datefrom !== '') datetime.datefrom = datefrom;
		// 			if (dateto !== '')   datetime.dateto = dateto;


		// 		} else if (inputTimeAllDay && !inputTimeMultipleDays) {

		// 			if (datefrom !== '') datetime.datefrom = datefrom;


		// 		} else if (!inputTimeAllDay && inputTimeMultipleDays) {

		// 			if (datefrom !== '') datetime.datefrom = datefrom;
		// 			if (dateto !== '')   datetime.dateto = dateto;
		// 			if (timefrom !== '') datetime.timefrom = timefrom;
		// 			if (timeto !== '')   datetime.timeto = timeto;


		// 		} else if (!inputTimeAllDay && !inputTimeMultipleDays) {

		// 			if (datefrom !== '') datetime.datefrom = datefrom;
		// 			if (timefrom !== '') datetime.timefrom = timefrom;
		// 			if (timeto !== '')   datetime.timeto = timeto;					

		// 		}

		// 		obj.datetime = datetime;

		// 	}


		// 	if (enableDeadline || enableTime || 
		// 		(this.columneditor.getColumntype() === 'dates') || 
		// 		(this.columneditor.getColumntype() === 'dates2')
		// 		) {


		// 		var tz = this.el.find('#timezoneselect').val();
		// 		if (this.timezoneOK(tz)) {
		// 			obj.timezone = tz;
		// 		}

		// 	}




		// 	return obj;
		// },




		"updateDynamics": function(e) {
			if (e) {
				e.stopPropagation(); e.preventDefault();
			}
			var enableLocation = this.el.find('#enableLocation').prop('checked');
			this.locationinput.setActiveState(enableLocation);
			if (enableLocation) {
				this.locationinput.resize();
			}


			var enableRestrictions = this.el.find('#enableRestrictions').prop('checked');
			if (enableRestrictions) {
				this.el.find('#sectionRestrictions').show();
			} else {
				this.el.find('#sectionRestrictions').hide();
			}



			var enableDeadline = this.el.find('#enableDeadline').prop('checked');
			this.deadlineselector.setActiveState(enableDeadline);



			var enableGroups = this.el.find('#enableGroups').prop('checked');
			this.groupselector.setActiveState(enableGroups);

			var enableTime = this.el.find('#enableTime').prop('checked');
			this.dateselector.setActiveState(enableTime);

		},






		"actSaveChanges": function(e) {
			e.preventDefault();

			var that = this;
			var redirectURIs;
			var obj;

			this.current.setName(this.el.find("#name").val());
			this.current.setDescr(this.el.find("#descr").val());
			this.current.systemdescr = this.el.find("#systemdescr").val();
			if (this.current.systemdescr === '') {
				this.current.systemdescr = null;
			}


			this.current.authoptions = {};


			redirectURIs = [];
			this.el.find("input.redirect_uri").each(function(i, item) {
				var x = $(item).val();
				if (x !== '') {
					redirectURIs.push(x);
				}
			});

			this.current.redirect_uri = redirectURIs;

			obj = this.current.getStorable(["id", "name", "descr", "systemdescr",
				"privacypolicyurl", "homepageurl", "loginurl", "supporturl",
				"redirect_uri"
			]);

			// obj = this.current.getStorable();
			// obj.authproviders = [];
			// console.error("UPDATE", obj);

			// this.feideconnect.clientsUpdate(obj)
			// 	.then(function(savedClient) {
			// 		var x = new Client(savedClient);
			// 		that.edit(x);
			// 		that.emit("saved", x);
			// 	})
			// 	.catch(function(err) {
			// 		that.app.app.setErrorMessage("Error updating client", "danger", err);
			// 	});

		},


	});

	return FoodleEditor;


});