define(function(require, exports, module) {
	"use strict";	

	var 
		Controller = require('bower/feideconnectjs/src/controllers/Controller')
		;

	var ComponentController = Controller.extend({
		"init": function(app) {
			this.app = app;
			this.active = null;
			this._super();
		},
		"isActive": function() {
			return this.active;
		},
		"setActiveState": function(state) {
			// console.error("setActiveState", state);
			this.active = state;
			if (state) {
				this.show();
			} else {
				this.hide();
			}
		}
	});

	return ComponentController;
});