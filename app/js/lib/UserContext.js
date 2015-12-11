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


			this.timezone = 'Europe/Amsterdam';
			this.groups = {};
			this._super(undefined, true);
		},

		"initLoad": function() {
			var that = this;

			return Promise.all([
					this.loadGeoIP(),
					this.loadGroups()
					.then(function() {
						that.user = that.feideconnect.getUser();
					})
				]) 
				.then(this.proxy("_initLoaded"));
		},

		"getGroupSelection": function(groupselection) {
			if (!groupselection) { return null; }
			var data = [];
			// console.error("groupselection", groupselection);
			var gindex = groupselection.reduce(function(previousValue, currentValue) {
				previousValue[currentValue] = true;
				return previousValue;
			}, {});
			// console.error("INDEX IS", gindex);
			for(var i = 0; i < this.groups.length; i++) {
				if (gindex.hasOwnProperty(this.groups[i].id)) {
					data.push(this.groups[i]);
				}
			}
			return data;
		},

		"loadGeoIP": function() {
			var that = this;
			return new Promise(function(resolve, reject) {
				var url = 'http://freegeoip.net/json/';
				$.ajax({
					dataType: "json",
					url: url,
					success: function(data) {
						if (data && data.time_zone) {
							that.timezone = data.time_zone;
						}
						resolve();
					},
					error: function(err) {
						reject(err);
					}
				})
			});
		},


		"getPublic": function() {

			var obj = {};
			if (this.user.name) {
				obj.name = this.user.name;
			}
			if (this.user.email) {
				obj.email = this.user.email;
			}
			if (this.user.profilephoto) {
				obj.profilephoto = this.user.profilephoto;
			}
			return obj;
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

