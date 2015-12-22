define(function(require, exports, module) {
	"use strict";

	var
		FoodleResponse = require('./FoodleResponse');

	var FoodleResponseSet = function(items, foodle) {

		this.items = [];
		
		if (items !== null) {
			for(var i = 0; i < items.length; i++) {
				this.items.push(new FoodleResponse(items[i], foodle));
			}
		}

	};

	return FoodleResponseSet;

});