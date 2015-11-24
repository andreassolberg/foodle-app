define(function(require, exports, module) {
	"use strict";

	var
		Class = require('bower/feideconnectjs/src/class'),

		Foodle = require('./models/Foodle');



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

		"getFoodleById": function(identifier) {
			return this.feideconnect._customRequest(this.getURL('/api/foodles/' + identifier))
				.then(function(foodledata) {
					return new Foodle(foodledata);
				});
		}
	});
	return API;


});