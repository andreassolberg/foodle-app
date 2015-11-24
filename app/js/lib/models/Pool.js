define(function(require, exports, module) {

	"use strict";	

	var 

		Class = require('bower/feideconnectjs/src/class'),
		EventEmitter = require('bower/feideconnectjs/src/EventEmitter'),
		Controller = require('bower/feideconnectjs/src/controllers/Controller'),
		
		Foodle = require('./Foodle')
		;


	var Pool = Controller.extend({
		"init": function(feideconnect) {
			var that = this;
			this.feideconnect = feideconnect;
			this.foodles = {};

			this._super(undefined, true);
		},

		"initLoad": function() {
			return this.load()
				.then(this.proxy("_initLoaded"));
		},

		"load": function() {
			var that = this;
			that.apigks = {};
			return that.feideconnect._customRequest('https://foodle.gk.feideconnect.no/api/foodles/')
				.then(function(foodles) {
					// console.error("DATA", foodles);
					var i;
					for (i = 0; i < foodles.length; i++) {
						that.foodles[foodles[i].identifier] = new Foodle(foodles[i]);
					}
					that.emit('listChange', that.apigks);
				});
		},

		"getView": function() {

			var items = [];
			for(var key in this.foodles) {
				var x = this.foodles[key];
				x.id = key;
				items.push(x.getView());
			}
			return items;
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

