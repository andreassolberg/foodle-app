define(function(require, exports, module) {
	"use strict";

    var
        Class = require('bower/feideconnectjs/src/class');



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
            var that = this;
            console.log("About to post foodle", obj);
            return this.feideconnect._customRequestAdv('POST', this.getURL('/api/foodles/'), null, null, obj)
                .then(function(foodle) {
                    // that.emit('listChange', that.apigks);
                });
        }
    });
    return API;


});