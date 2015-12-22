define(function(require, exports, module) {
	"use strict";

	var
		$ = require('jquery'),
		moment = require('moment-timezone'),
		utils = require('bower/feideconnectjs/src/utils'),

		Model = require('bower/feideconnectjs/src/models/Model');


	var FoodleResponse = Model.extend({
		"init": function(props, foodle) {

			this.isStored = false;

			this._super(props);
			this.foodle = foodle;

			if (!this.hasOwnProperty("columns")) {
				this.columns = [];
			}
		},

		/*
		 * Set a reponse column value.
		 */
		"setValue": function(idx, val) {
			var existingResponse = this.getResponseByIdx(idx);
			if (existingResponse !== null) {
				existingResponse.val = val;
			} else {
				this.columns.push({
					"idx": idx,
					"val": val
				});
			}
		},

		"getResponseByIdx": function(idx) {
			for (var i = 0; i < this.columns.length; i++) {
				if (this.columns[i].idx === idx) {
					return this.columns[i];
				}
			}
			return null;
		},


		"save": function() {
			if (!this.foodle || !this.foodle.identifier) {
				throw new Error("cannot save foodleresponse with reference to a specific Foodle");
			}
			var obj = this.getProperties(['columns', 'comment', 'userinfo', 'admin']);
			return FoodleResponse.api.saveFoodleResponse(this.foodle.identifier, obj);
		},

		"remove": function() {
			if (!this.foodle || !this.foodle.identifier) {
				throw new Error("cannot remove foodleresponse with reference to a specific Foodle");
			}
			var id = this.foodle.identifier;
			return FoodleResponse.api.removeFoodleResponse(this.foodle.identifier);
		},

		"getColumnResponseItemView": function(colitemdef, summary) {

			var view = {};
			var resp = this.getResponseByIdx(colitemdef.idx);
			var type = colitemdef.datatype;

			view.idx = colitemdef.idx;
			view.empty = (resp === null);

			if (summary) {
				for(var i = 0; i < summary.col.length; i++) {
					if (summary.col[i].idx === colitemdef.idx) {
						view.summary = summary.col[i];
					}
				}
			}

			if (view.empty) {
				view[type] = true;
			} else {
				if (type === 'check' || type === 'checkmaybe' || type === 'radio') {
					view[type] = {};
					view[type][resp.val] = true;
				} else {
					view[type] = {
						value: resp.val
					};
				}
			}


			if (view.summary && view.summary.restrictions && view.summary.restrictions.isLocked) {

				if (view.empty) {
					view[type].isLocked = true;
				} else if ((type === 'check' || type === 'checkmaybe' || type === 'radio') && resp.val !== 'yes') {
					view[type].isLocked = true;
				} else if (type === 'number') {
					view[type].isLocked = true;
				}

			}
			if (view.summary && view.summary.restrictions && view.summary.restrictions.hasOwnProperty("remaining")) {
				var withoutMe = view.summary.restrictions.remaining + parseInt(resp.val, 10);
				view[type].remaining = withoutMe;
			}


			return view;
		},


		"getColumnResponseView": function(summary) {

			var responseData = [];

			var x, resp;
			var coldef = this.foodle.getViewColDefGeneric();
			for (var i = 0; i < coldef.cols.length; i++) {

				x = this.getColumnResponseItemView(coldef.cols[i], summary);



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

		"getView": function(summary) {
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

			res.colresponses = this.getColumnResponseView(summary);
			delete res.foodle;

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