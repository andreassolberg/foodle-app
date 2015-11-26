define(function(require, exports, module) {

	"use strict";	

	var 
		EventEmitter = require('bower/feideconnectjs/src/EventEmitter'),
		Controller = require('bower/feideconnectjs/src/controllers/Controller')
		;


	var UserContext = Controller.extend({
		"init": function(feideconnect) {
			var that = this;
			this.feideconnect = feideconnect;
			this.groups = {};
			this._super(undefined, true);
		},

		"initLoad": function() {
			var that = this;
			return this.loadGroups()
				.then(function() {
					that.user = that.feideconnect.getUser();
				})
				.then(this.proxy("_initLoaded"));
		},

		"getGroupSelection": function(groupselection) {
			if (!groupselection) { return null; }
			var data = [];
			console.error("groupselection", groupselection);
			var gindex = groupselection.reduce(function(previousValue, currentValue) {
				previousValue[currentValue] = true;
				return previousValue;
			}, {});
			console.error("INDEX IS", gindex);
			for(var i = 0; i < this.groups.length; i++) {
				if (gindex.hasOwnProperty(this.groups[i].id)) {
					data.push(this.groups[i]);
				}
			}
			return data;
		},



		"loadGroups": function() {
			var that = this;
			return this.feideconnect.vootGroupsList()
				.then(function(groups) {
					// console.error("Groups data", groups);
					that.groups = groups;
				});
		}

	});


	return UserContext;

});

