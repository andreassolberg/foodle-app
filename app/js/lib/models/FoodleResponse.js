define(function(require, exports, module) {
	"use strict";

	var
		$ = require('jquery'),
		moment = require('moment-timezone'),
		utils = require('bower/feideconnectjs/src/utils'),

		Model = require('bower/feideconnectjs/src/models/Model');


	var FoodleResponse = Model.extend({
		"init": function(props, foodle) {
			this._super(props);
			this.foodle = foodle;

			if (!this.hasOwnProperty("columns")) {
				this.columns = [];
			}
		},

		"save": function(fc) {

			if (!this.foodle || !this.foodle.identifier) {
				throw new Error("cannot save foodleresponse with reference to a specific Foodle");
			}

			var obj = this.getProperties(['columns', 'comment', 'userinfo', 'admin']);
			FoodleResponse.api.saveFoodleResponse(this.foodle.identifier, obj);

			// if (this.identifier) {
			// 	console.error("Updating an existing Foodle")
			// 	return Foodle.api.updateFoodle(this.identifier, obj);
			// } else {
			// 	console.error("Createing a new Foodle");
			// 	return Foodle.api.saveFoodle(obj);
			// }

		},

		"getResponseByIdx": function(idx) {

			for (var i = 0; i < this.columns.length; i++) {
				if (this.columns[i].idx === idx) {
					return this.columns[i];
				}
			}
			return null;
		},


		"getColumnResponseView": function() {

			var responseData = [];

			var x;
			var coldef = this.foodle.getViewColDefGeneric();
			for(var i = 0; i < coldef.cols.length; i++) {

				x = {};
				x.resp = this.getResponseByIdx(coldef.cols[i].idx);
				x.def = coldef.cols[i];

				responseData.push(x);
			}
			return responseData;
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

			res.colresponses = this.getColumnResponseView();


			res.isStored = !!this.identifier;

			return res;
		}
	});


	FoodleResponse.getById = function(id) {
		return FoodleResponse.api.getFoodleById(id);
	};

	FoodleResponse.getFoodleMyResponse = function(foodle) {
		return FoodleResponse.api.getFoodleMyResponse(foodle);
	};

	FoodleResponse.getFoodleAllResponses = function(foodle) {
		return FoodleResponse.api.getFoodleAllResponses(foodle);
	};


	return FoodleResponse;

});