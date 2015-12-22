define(function(require, exports, module) {
	"use strict";

	var
		$ = require('jquery'),
		googleMapsLoader = require('google-maps'),
		Controller = require('bower/feideconnectjs/src/controllers/Controller'),
		TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine'),

		FoodleResponse = require('../../../models/FoodleResponse');

	var template = require('text!templates/respond-components/MyResponse.html');
	var partCheck = require('text!templates/respond-components/partCheck.html');
	var partCheckMaybe = require('text!templates/respond-components/partCheckMaybe.html');
	var partCheckEdit = require('text!templates/respond-components/partCheckEdit.html');
	var partCheckMaybeEdit = require('text!templates/respond-components/partCheckMaybeEdit.html');
	var partNumber = require('text!templates/respond-components/partNumber.html');
	var partNumberEdit = require('text!templates/respond-components/partNumberEdit.html');
	var partText = require('text!templates/respond-components/partText.html');
	var partTextEdit = require('text!templates/respond-components/partTextEdit.html');


	var MyResponseController = Controller.extend({
		"init": function(app, responsecontroller) {
			this.app = app;
			this.responsecontroller = responsecontroller;
			this.template = new TemplateEngine(template);
			this.template.loadPartial("partCheck", partCheck);
			this.template.loadPartial("partCheckMaybe", partCheckMaybe);
			this.template.loadPartial("partCheckEdit", partCheckEdit);
			this.template.loadPartial("partCheckMaybeEdit", partCheckMaybeEdit);
			this.template.loadPartial("partNumber", partNumber);
			this.template.loadPartial("partNumberEdit", partNumberEdit);
			this.template.loadPartial("partText", partText);
			this.template.loadPartial("partTextEdit", partTextEdit);

			var el = $('<tbody></tbody>');
			this._super(el);

			this.ebind("click", ".submitResponse", "actSubmit");
			this.ebind("click", ".actDeleteResponse", "actDeleteResponse");
			this.initLoad();
		},


		"actSubmit": function(e) {
			if (e) {
				e.preventDefault();
				e.stopPropagation();
			}
			var that = this;
			var value, idx, colitemdef;

			this.el.find('.updateResponseRow  .responsebox').each(function(i, item) {

				idx = $(item).attr('data-colid');
				colitemdef = that.foodle.coldefGetById(idx);
				if (colitemdef === null) {
					return;
				}

				if (colitemdef.datatype === 'check') {
					value = ($(item).find('.responseoption').eq(0).prop('checked') ? 'yes' : 'no');
				} else if (colitemdef.datatype === 'checkmaybe') {
					value = $(item).find('input[type="radio"]:checked').val()
				} else {
					value = $(item).find('.responseoption').eq(0).val();
				}
				that.response.setValue(idx, value);

			});
			return this.response.save()
				.then(function() {
					return that.responsecontroller.reloadResponses();
				})
				.catch(function(err){
					console.error("Error", JSON.stringify(err, undefined, 2));
					that.app.setErrorMessage(err.name, "danger", err.message);
				});
		},

		"actDeleteResponse": function(e) {
			if (e) {
				e.preventDefault();
				e.stopPropagation();
			}
			var that = this;
			return this.response.remove()
				.then(function() {
					return that.responsecontroller.reloadResponses();
				});
		},


		"setData": function(foodle, response) {
			this.foodle = foodle;
			this.response = response;
			return this.draw();
		},

		"draw": function() {
			var that = this;
			var _config = that.app.feideconnect.getConfig();
			var profilephotoBase = _config.apis.core + '/userinfo/v1/user/media/';

			var view = {
				"_": this.app.dict.get(),
				"user": this.app.usercontext.user,
				"foodle": this.foodle.getView(),
				"coldef": this.foodle.getViewColDefGeneric(),
				"profilephotoBase": profilephotoBase,
				"response": this.response.getView()
			};
			console.error("My response view", JSON.stringify(view.coldef, undefined, 3));
			// console.error(this.el);

			this.el.children().detach();
			return that.template.render(that.el, view);
		}

	});

	return MyResponseController;
});