	define(function(require, exports, module) {
	"use strict";	

	var 
		$ = require('jquery'),

		Controller = require('bower/feideconnectjs/src/Controllers/Controller'),
		Dictionary = require('bower/feideconnectjs/src/Dictionary'),
		TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine'),

		ColumnEditor = require('./ColumnEditor')
		;

	var template = require('text!templates/components/ColumnGenericEditor.html');


	var ColumnGenericEditor = ColumnEditor.extend({
		"init": function(app) {

			this.template = new TemplateEngine(template);
			this._super(app);
			
			this.ebind("click", ".actColIncr", "actColIncr");
			this.ebind("click", ".actColDecr", "actColDecr");
			this.ebind("click", ".actSubIncr", "actSubIncr");
			this.ebind("click", ".actSubDecr", "actSubDecr");
			this.ebind("change", ".checkIncludeOptions", "checkIncludeOptions");
			this.ebind("change", ".inputRestrictionsEnable", "inputRestrictionsEnable");

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

		"checkIncludeOptions": function(e) {
			var checked = $(e.currentTarget).prop("checked");
			this.updateFromUI();
			this.foodle.coldefSetTwoHeaderRows(checked);
			return this.draw();
		},

		"inputRestrictionsEnable": function(e) {
			this.updateFromUI();
			return this.draw();
		},

		"actColIncr": function(e) {
			e.preventDefault(); e.stopPropagation();
			this.foodle.coldefColIncr();
			this.updateFromUI();
			return this.draw();
		},
		"actColDecr": function(e) {
			e.preventDefault(); e.stopPropagation();
			this.foodle.coldefColDecr();
			this.updateFromUI();
			return this.draw();
		},
		"actSubIncr": function(e) {
			e.preventDefault(); e.stopPropagation();
			var colid = $(e.currentTarget).attr('data-colid');
			this.foodle.coldefSubIncr(colid);
			this.updateFromUI();
			return this.draw();
		},
		"actSubDecr": function(e) {
			e.preventDefault(); e.stopPropagation();
			var colid = $(e.currentTarget).attr('data-colid');
			this.foodle.coldefSubDecr(colid);
			this.updateFromUI();
			return this.draw();
		},



		"updateFromUI": function() {
			var that = this;
			this.el.find(".coldefheader").each(function(i, item) {
				var colid = $(item).attr("data-colid");
				var title = $(item).val().trim();
				that.foodle.coldefSetTitle(colid, title);
			});

			this.el.find(".coldefdatatype").each(function(i, item) {
				var colid = $(item).attr("data-colid");
				var datatype = $(item).val();
				that.foodle.coldefSetDataType(colid, datatype);
			});

			this.el.find(".inputRestrictionsEnable").each(function(i, item) {
				var colid = $(item).attr("data-colid");
				var checked = $(item).prop("checked");
				that.foodle.coldefSetRestrictionsEnabled(colid, checked);
			});

			this.el.find(".inputMaxcheck").each(function(i, item) {
				var colid = $(item).attr("data-colid");
				var num = parseInt($(item).val(), 10);
				that.foodle.coldefSetRestrictionsMaxcheck(colid, num);
			});
			this.el.find(".inputMaxnum").each(function(i, item) {
				var colid = $(item).attr("data-colid");
				var num = parseInt($(item).val(), 10);
				that.foodle.coldefSetRestrictionsMaxnum(colid, num);
			});

			

		},

		"validate": function() {
			var x = this.getColDef();
			this.el.find('.colerrors').empty();

			var hasError = false;
			if (x.length === 0) {

				this.el.find('.colerrors').append('<div class="alert alert-danger"><strong>At least a single column header</strong> is required. Please provide one before saving.</div>');
				hasError = true;
			} else {
				$('.coldef-header').removeClass('has-error')
			}

			return !hasError;
		},






	});

	return ColumnGenericEditor;
});