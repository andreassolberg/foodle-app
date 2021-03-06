define(function(require, exports, module) {
	"use strict";

	var
		Class = require('bower/feideconnectjs/src/class'),

		Foodle = require('./models/Foodle'),
		FoodleResponse = require('./models/FoodleResponse');



	var API = Class.extend({
		"init": function(feideconnect, config) {
			this.feideconnect = feideconnect;
			this.config = config;
		},

		"getURL": function(endpoint) {
			var baseURL = this.config.baseURL;
			if (!baseURL) {
				throw new Error("BaseURL is not configured.");
			}
			return baseURL + endpoint;
		},

		"saveFoodle": function(obj) {
			return this.feideconnect._customRequestAdv('POST', this.getURL('/api/foodles/'), null, null, obj);
		},

		"updateFoodle": function(id, obj) {
			return this.feideconnect._customRequestAdv('PATCH', this.getURL('/api/foodles/' + id), null, null, obj);
		},

		"deleteFoodle": function(id) {
			return this.feideconnect._customRequestAdv('DELETE', this.getURL('/api/foodles/' + id));	
		},

		"getFoodleById": function(identifier) {
			return this.feideconnect._customRequest(this.getURL('/api/foodles/' + identifier))
				.then(function(foodledata) {
					return new Foodle(foodledata);
				});
		},


		"saveFoodleResponse": function(identifier, obj) {
			return this.feideconnect._customRequestAdv('POST', this.getURL('/api/foodles/' + identifier + '/myresponse'), null, null, obj);
		},

		"removeFoodleResponse": function(identifier) {
			return this.feideconnect._customRequestAdv('DELETE', this.getURL('/api/foodles/' + identifier + '/myresponse'), null, null);
		},

		"getFoodleMyResponse": function(foodle) {
			return this.feideconnect._customRequest(this.getURL('/api/foodles/' + foodle.identifier + '/myresponse'))
				.then(function(data) {
					if (data === null) {
						return null;
					}
					data.isStored = true;
					return new FoodleResponse(data, foodle);
				});
		},
		"getFoodleAllResponses": function(foodle) {
			return this.feideconnect._customRequest(this.getURL('/api/foodles/' + foodle.identifier + '/responses/'))
				.then(function(data) {
					var list = [];
					if (data && data.length) {
						for (var i = 0; i < data.length; i++) {
							list.push(new FoodleResponse(data[i], foodle));
						}
					}
					return list;
				});
		}

	});
	return API;


});