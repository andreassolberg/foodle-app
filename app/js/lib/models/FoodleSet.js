define(function(require, exports, module) {
	"use strict";

	var
		Foodle = require('./Foodle');

	var FoodleSet = function(items) {

		this.items = [];

		if (items !== null) {
			for(var i = 0; i < items.length; i++) {
				this.items.push(new Foodle(items[i]));
			}
		}

	};

	return FoodleSet;

});