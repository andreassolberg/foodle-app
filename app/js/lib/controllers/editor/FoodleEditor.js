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
		ColumnDateEditor = require('./components/columneditors/ColumnDateEditor');


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
			this.ebind("click", "#debugFoodle", "actDebug");

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

			return this.draw();
		},



		"draw": function() {

			var that = this;
			var view = {
				"_": this.app.dict.get(),
				"foodle": this.foodle.getView()
			};

			this.columneditor.setFoodle(this.foodle);
			this.columneditor.draw();

			console.error("About to edit draw, view is..", view);
			this.el.children().detach();

			return this.template.render(this.el, view)
				.then(function() {
					that.activate();
				})
				.then(function() {

					that.dateselector.updateView(that.foodle);
					that.deadlineselector.updateView(that.foodle);
					that.timezoneselector.updateView(that.foodle);
					that.locationinput.updateView(that.foodle);
					that.groupselector.updateView(that.foodle);

					that.el.find('.datetimesection').append(that.dateselector.el);
					that.el.find('.deadlineselector').append(that.deadlineselector.el);
					that.el.find('#timezoneselector').append(that.timezoneselector.el);
					that.el.find('#sectionLocationDetails').append(that.locationinput.el);
					that.el.find('#sectionGroups').append(that.groupselector.el);

					that.el.find('#columneditor').append(that.columneditor.el);

					that.setFocusTitle();
					that.updateDynamicsFromModel();
				})
				.catch(function(err) {
					that.app.setErrorMessage("Error loading client editor", "danger", err);
				});

		},

		"actSubmit": function(e) {

			var that = this;
			e.preventDefault();
			e.stopPropagation();

			this.validate();
			this.updateFromUI();
			return this.foodle.save()
				.then(function() {
					that.app.setErrorMessage("Successfully saved Foodle", "success");
				})
				.catch(function(err) {
					that.app.setErrorMessage("Error saving foodle", "danger", err);
				});
		},


		"actDebug": function(e) {

			e.preventDefault();
			e.stopPropagation();

			this.validate();
			this.updateFromUI();

			$("#debug").empty().append(JSON.stringify(this.foodle, undefined, 2));

			// return this.foodle.save()
			// 	.then(function() {
			// 		this.app.setErrorMessage("Successfully saved Foodle", "success");
			// 	})
			// 	.catch(function(err) {
			// 		this.app.setErrorMessage("Error saving foodle", "danger", err);
			// 	});
		},


		"updateFromUI": function() {
			var that = this;

			try {

				this.foodle.title = $('#inputTitle').val().trim();
				this.foodle.descr = $('#inputDescr').val().trim();


				// foodle.parent, 'publicresponses', '', 'defaults', '', 'admins'
				this.foodle.location = this.locationinput.getData();
				this.foodle.timezone = this.timezoneselector.getData();
				this.foodle.datetime = this.dateselector.getData();
				this.foodle.deadline = this.deadlineselector.getData();
				this.foodle.groups = this.groupselector.getGroups();

				this.columneditor.updateFromUI();

			} catch (err) {
				this.app.setErrorMessage("Error in user input", "danger", err);
				console.error(err);
				return;
			}
			$("#debug").append(JSON.stringify(this.foodle, undefined, 2));
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

		"updateDynamicsFromModel": function() {
			var enableLocation = !!this.location;
			this.el.find('#enableLocation').prop('checked', !!this.foodle.location);
			this.el.find('#enableDeadline').prop('checked', !!this.foodle.deadline);
			this.el.find('#enableGroups').prop('checked', !!this.foodle.groups);
			this.el.find('#enableTime').prop('checked', !!this.foodle.datetime);
			this.updateDynamics();
		},

		"updateDynamics": function(e) {
			if (e) {
				e.stopPropagation();
				e.preventDefault();
			}

			var enableLocation = this.el.find('#enableLocation').prop('checked');
			this.locationinput.setActiveState(enableLocation);
			if (enableLocation) {
				this.locationinput.resize();
			}


			// var enableRestrictions = this.el.find('#enableRestrictions').prop('checked');
			// if (enableRestrictions) {
			// 	this.el.find('#sectionRestrictions').show();
			// } else {
			// 	this.el.find('#sectionRestrictions').hide();
			// }

			var enableDeadline = this.el.find('#enableDeadline').prop('checked');
			this.deadlineselector.setActiveState(enableDeadline);

			var enableGroups = this.el.find('#enableGroups').prop('checked');
			this.groupselector.setActiveState(enableGroups);

			var enableTime = this.el.find('#enableTime').prop('checked');
			this.dateselector.setActiveState(enableTime);

		}

	});

	return FoodleEditor;


});