define(function(require, exports, module) {

	"use strict";	

	var 

		Class = require('bower/feideconnectjs/src/class'),
		EventEmitter = require('bower/feideconnectjs/src/EventEmitter'),
		Controller = require('bower/feideconnectjs/src/controllers/Controller'),
		
		Foodle = require('./Foodle')
		;


	var Pool = Controller.extend({
		"init": function(feideconnect, app) {
			var that = this;
			this.feideconnect = feideconnect;
			this.app = app;
			this.foodles = {};

			this._super(undefined, true);
		},

		"initLoad": function() {
			var that = this;
			return this.app.usercontext.onLoaded()
				.then(function() {
					return that.load();
				})
				.then(this.proxy("_initLoaded"));
		},

		"load": function() {
			var that = this;
			that.foodles = {};

			// console.error("About to load groups");

			var obj = {
				"groups": this.app.usercontext.getGroupIdentifiers()
			};
			// console.error("About to load groups", obj);
			return this.feideconnect._customRequestAdv('POST', 'https://foodle.gk.feideconnect.no/api/foodles/listing/', null, null, obj)
				.then(function(foodles) {
					var i;
					for (i = 0; i < foodles.length; i++) {
						that.foodles[foodles[i].identifier] = new Foodle(foodles[i]);
					}
					that.emit('listChange');
				});

			// return that.feideconnect._customRequest('https://foodle.gk.feideconnect.no/api/foodles/listing/')
			// 	.then(function(foodles) {
			// 		var i;
			// 		for (i = 0; i < foodles.length; i++) {
			// 			that.foodles[foodles[i].identifier] = new Foodle(foodles[i]);
			// 		}
			// 		that.emit('listChange');
			// 	});
		},

		"getSeeAlso": function(foodle) {

			var count = 10;
			var items = [];
			var xv;
			var anynew = false;

			for(var key in this.foodles) {
				var x = this.foodles[key];
				x.identifier = key;
				xv = x.getView();
				xv.iscurrent =  (foodle.identifier === x.identifier);
				if (!xv.iscurrent) {
					anynew = true;
				}
				items.push(xv);
				if (count-- <= 0) {
					break;
				}
			}
			if (!anynew) {
				return null;
			}
			return items;

		},

		"getView": function() {

			var items = [];
			for(var key in this.foodles) {
				var x = this.foodles[key];
				x.id = key;
				items.push(x.getView(this.app.usercontext));
			}
			return items.reverse();
		},


		// "setAPIGK": function(apigk) {
		// 	this.apigks[apigk.id] = apigk;
		// 	this.emit("apigkChange", this.apigks);
		// },
		// "getAPIGK": function(id) {
		// 	if (this.apigks.hasOwnProperty(id)) {return this.apigks[id];}
		// 	return null;
		// },
		// "removeAPIGK": function(id) {
		// 	delete this.apigks[id];
		// 	this.emit("apigkChange", this.apigks);
		// }

	}).extend(EventEmitter);


	return Pool;

});

