define(function(require, exports, module) {
	"use strict";	

	var 
		$ = require('jquery'),
		// moment = require('moment-timezone'),
        Model = require('bower/feideconnectjs/src/models/Model')
	;


	var ColumnDef = Model.extend({
		"init": function(props) {
			this._super(props);
		},

		"save": function(fc) {
		},

		"getProperties": function(props) {

			var obj = {};
			for(var i = 0; i < props.length; i++) {
				if (this.hasOwnProperty(props[i])) {
					obj[props[i]] = this[props[i]];
				}
			}
			return obj;
		},

		"getView": function() {
			var res = this._super();

			// if (this.created) {
			// 	res.created = parseDate(this.created);
			// 	res.createdAgo = res.created.fromNow();
			// 	res.createdH = res.created.format('D. MMM YYYY');
			// }

			// if  (this.updated) {
			// 	res.updated = parseDate(this.updated);
			// 	res.updatedAgo = res.updated.fromNow();
			// 	res.updatedH = res.updated.format('D. MMM YYYY');
			// }

			return res;			
		}

	});

	return ColumnDef;

});

