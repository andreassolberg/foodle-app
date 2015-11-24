define(function(require, exports, module) {
	"use strict";

	var
		Pane = require('bower/feideconnectjs/src/controllers/Pane'),
		Dictionary = require('bower/feideconnectjs/src/Dictionary'),
		EventEmitter = require('bower/feideconnectjs/src/EventEmitter'),
		TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine'),
		utils = require('bower/feideconnectjs/src/utils'),

		Foodle = require('../../models/Foodle'),

		$ = require('jquery');

	var
		template = require('text!templates/MainListing.html'),
		templateList = require('text!templates/MainListingFoodles.html');


	/*
	 * This controller controls 
	 */
	var MainListing = Pane.extend({
		"init": function(feideconnect, app, pool) {

			var that = this;
			this.feideconnect = feideconnect;
			this.app = app;

			this.tmp = new TemplateEngine(template, this.app.dict);
			this.tmpL = new TemplateEngine(templateList, this.app.dict);

			this.pool = pool;
			this.pool.on('listChange', function(list) {
				that.updateList(list);
			});


			this._super();

			this.dict = new Dictionary();

			// dust.loadSource(dust.compile(template, "mainlisting"));
			// dust.loadSource(dust.compile(templateC, "mainlistingC"));
			// dust.loadSource(dust.compile(templateA, "mainlistingA"));

			this.elList = $("<div></div>");
			// this.elAPIGKs = $("<div></div>");


			this.ebind('click', '.actNewP', 'actNewP');
			this.ebind('click', '.actNewD', 'actNewD');


			// this.clientcreate = new ClientCreate(this.app);
			// this.clientcreate.on("submit", function(obj) {
			// 	that.emit("clientCreate", obj);
			// });
			// this.clientcreate.initLoad();

			// this.apigkcreate = new APIGKCreate(this.feideconnect, this.app);
			// this.apigkcreate.on("submit", function(obj) {
			// 	that.emit("apigkCreate", obj);
			// });
			// this.apigkcreate.initLoad();

			// this.el.on("click", ".registerNewClient", function() {
			// 	that.clientcreate.activate();
			// });
			// this.el.on("click", ".registerNewAPIGK", function() {
			// 	that.apigkcreate.activate();
			// });


			// this.ebind("click", ".clientEntry", "selectedClient");
			// this.ebind("click", ".apigkEntry", "selectedAPIGK");


		},

		"actNewD": function(e) {
			e.preventDefault();
			e.stopPropagation();

			var that = this;
			var f = Foodle.getNew();
			this.app.editor.edit(f)
				.then(function() {
					that.app.setHash('/create');
				})
				.catch(function(err) {
					that.app.setErrorMessage("Error opening Foodle editor", "danger", err);
				});
		},
		"actNewP": function(e) {
			e.preventDefault();
			e.stopPropagation();

			var that = this;
			var f = Foodle.getNew();
			this.app.editor.edit(f)
				.then(function() {
					that.app.setHash('/create');
				})
				.catch(function(err) {
					that.app.setErrorMessage("Error opening Foodle editor", "danger", err);
				});
		},

		"selectedClient": function(e) {
			e.preventDefault(); // e.stopPropgate();
			var clientid = $(e.currentTarget).data('clientid');
			this.emit('clientSelected', clientid);
		},

		"selectedAPIGK": function(e) {
			e.preventDefault(); // e.stopPropgate();
			var apigkid = $(e.currentTarget).data('apigkid');
			this.emit('apigkSelected', apigkid);
		},

		"updateList": function(foodles) {

			var
				that = this,
				key,
				clientlist = [],
				view;


			var items = this.pool.getView();

			view = {
				"items": items
			};

			// console.error("View", items);
			this.tmpL.render(this.elList.empty(), view)


			// return;
			// for (key in clients) {
			// 	if (clients.hasOwnProperty(key)) {
			// 		clientlist.push(clients[key].getView());
			// 	}
			// }

			// clientlist.sort(function(a, b) {
			// 	if (a.updated < b.updated) {
			// 		return 1;
			// 	}
			// 	if (a.updated > b.updated) {
			// 		return -1;
			// 	}
			// 	return 0;
			// });

			// view = {
			// 	"clients": clientlist,
			// 	"random": utils.guid(),
			// 	"_config": that.feideconnect.getConfig(),
			// 	"_": that.dict.get()
			// };

			// this.tmp.render(that.elClients.empty(), view)
			// 	.then(function() {
			// 		if (!that.elClientsAttached && that.templateLoaded) {
			// 			that.el.find('#listing').append(that.elClients);
			// 			that.elClientsAttached = true;
			// 		}
			// 	});

		},


		"initLoad": function() {

			this.draw(false)
				.then(this.proxy("_initLoaded"));

		},


		"draw": function(act) {
			var that = this;

			var view = {
				"_": that.dict.get(),
				"showHeader": false
			};
			that.el.children().detach();

			return this.tmp.render(that.el, view)
				.then(function() {
					that.el.find('#listing').append(that.elList);

					if (act) {
						that.activate();
					}
				});


		}
	}).extend(EventEmitter);

	return MainListing;

});