
define(function (require, exports, module) {

	"use strict";

	var

		$ = require('jquery'),

		FeideConnect = require('bower/feideconnectjs/src/FeideConnect').FeideConnect,
		AppController = require('bower/feideconnectjs/src/controllers/AppController'),
		BCController = require('bower/feideconnectjs/src/controllers/BCController'), 
		LanguageController = require('bower/feideconnectjs/src/controllers/LanguageController'), 
		PaneController = require('bower/feideconnectjs/src/controllers/PaneController'),
		Dictionary = require('bower/feideconnectjs/src/Dictionary'),
		TemplateEngine = require('bower/feideconnectjs/src/TemplateEngine'),
		utils = require('bower/feideconnectjs/src/utils'),

		Foodle = require('./models/Foodle'),
		Pool = require('./models/Pool'),
		MainListing = require('./controllers/mainpage/MainListing'),
		FoodleEditor = require('./controllers/editor/FoodleEditor'),
		RespondController = require('./controllers/respond/RespondController'),
		API = require('./API'),

		rawconfig = require('text!../../etc/config.js');

	var tmpHeader = require('text!templates/header.html');
	var tmpFooter = require('text!templates/footer.html');

	require("bootstrap");
	require('es6-promise').polyfill();

	/**
	 * Here is what happens when the page loads:
	 *
	 * Check for existing authentication.
	 * When authenticated setup clientpool.
	 * After that, check routing...
	 * Load frontpage
	 * 
	 * 
	 */

	


	 
	var App = AppController.extend({
		
		"init": function() {
			var that = this;

			this.config = JSON.parse(rawconfig);
			
			this.feideconnect = new FeideConnect(this.config);
			this.pool = new Pool(this.feideconnect);
			this.api = new API(this.feideconnect, this.config);

			Foodle.api = this.api;

			this.dict = new Dictionary();

			this.tmpHeader = new TemplateEngine(tmpHeader);
			this.tmpFooter = new TemplateEngine(tmpFooter);

			this.bccontroller = new BCController($("#breadcrumb"));
			this.languageselector = new LanguageController(this);
			

			// Call contructor of the AppController(). Takes no parameters.
			this._super(undefined, false);




			this.pc = new PaneController(this.el.find('#panecontainer'));

			this.mainlisting = new MainListing(this.feideconnect, this, this.pool);
			this.pc.add(this.mainlisting);

			this.response = new RespondController(this.feideconnect, this);
			this.pc.add(this.response);	


			this.editor = new FoodleEditor(this.feideconnect, this);
			this.pc.add(this.editor);


			this.mainlisting.initLoad();

			this.setupRoute(/^\/?$/, "routeMainlisting");
			this.setupRoute(/^\/respond\/([a-zA-Z0-9_\-:.]+)?$/, "routeResponse");
			this.setupRoute(/^\/create$/, "routeCreate");
			this.setupRoute(/^\/edit\/([a-zA-Z0-9_\-:.]+)?$/, "routeEdit");



			$("#header").on("click", ".navbar-brand", function(e) {
				e.preventDefault();

				that.feideconnect.onAuthenticated()
					.then(function() {

					})
					.catch(function(err) {
						console.error("err", err);
						that.setErrorMessage("Error loading front dashboard", "danger", err);
					});

			});

			this.el.on("click", ".login", function() {
				that.feideconnect.authenticate();
			});
			this.el.on("click", "#logout", function(e) {
				e.preventDefault();
				that.feideconnect.logout();

				var c = that.feideconnect.getConfig();
				var url = c.apis.auth + '/logout';
				window.location = url;

			});


			this.feideconnect.on("stateChange", function(authenticated, user) {

				that.onLoaded()
					.then(function() {



						var _config = that.feideconnect.getConfig();
						var profilephoto = _config.apis.core + '/userinfo/v1/user/media/' + user.profilephoto;
						// console.error("Profile url iu s", profilephoto);

						if (authenticated) {

							$("body").addClass("stateLoggedIn");
							$("body").removeClass("stateLoggedOut");

							$("#username").empty().text(user.name);
							$("#profilephoto").html('<img style="margin-top: -28px; max-height: 48px; max-width: 48px; border: 0px solid #b6b6b6; border-radius: 32px; box-shadow: 1px 1px 4px #aaa;" src="' + profilephoto + '" alt="Profile photo" />');

							$(".loader-hideOnLoad").hide();
							$(".loader-showOnLoad").show();


						} else {

							$("body").removeClass("stateLoggedIn");
							$("body").addClass("stateLoggedOut");

							$(".loader-hideOnLoad").show();
							$(".loader-showOnLoad").hide();

						}

					});

			});

			this.initLoad();	

	
		},



		"initLoad": function() {
			var that = this;


			// Draw template..
			return this.draw()

				.then(function() {
					return that.feideconnect.onAuthenticated()
				})

				// Wait for orgRoleSelector to be loaded.
				.then(function() {

					// console.error("Juhu. Ready!");

				})

				// Then activate one of them
				.then(function() {

					that.route(true);
				})
				.then(this.proxy("_initLoaded"));
				
		},



		/**
		 * A draw function that draws the header and footer template.
		 * Supports promises
		 * @return {[type]} [description]
		 */
		"draw": function() {
			var that = this;

			var view = {
				"_": that.dict.get(),
				"_config": that.feideconnect.getConfig()
			};

			return Promise.all([
				that.tmpHeader.render(that.el.find("#header"), view),
				that.tmpFooter.render(that.el.find("#footer"), view)
			]).then(function() {
				// that.el.find("#navcontainer").append(that.languageselector.el);
				// that.el.find('#orgSelector').append(that.elOrgSelector);
			});


		},

		"routeMainlisting": function() {
			this.setHash('/');
			this.bccontroller.hide();
			this.mainlisting.activate();
		},


		"routeResponse": function(item) {
			var that = this;
			console.error("About to respond to ", item);

			// this.setHash('/');
			// this.bccontroller.hide();
			return this.response.edit(item)	
				.catch(function(err) {
					that.setErrorMessage("Error opening reponse display", "danger", err);
				});
		},

		"routeCreate": function() {
			// console.error("route create");
			// this.setHash('/');
			var f = Foodle.getNew();
			this.bccontroller.hide();
			this.editor.edit(f);

		},

		"routeEdit": function(identifier) {
			var that = this;
			var f = Foodle.getNew();
			this.editor.edit(f)
				.catch(function(err) {
					that.setErrorMessage("Error opening Foodle editor", "danger", err);
				});

		},

		"setErrorMessage": function(title, type, msg) {

			var that = this;
			type = (type ? type : "danger");

			var pmsg = '';
			if (typeof msg === 'object' && msg.hasOwnProperty("message")) {
				pmsg = '<p>' + utils.escape(msg.message, false).replace("\n", "<br />") + '</p>';
			} else if (typeof msg === 'string') {
				pmsg = '<p>' + utils.escape(msg, false).replace("\n", "<br />") + '</p>';
			}

			var str = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' +  
				' <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
				(title ? '<strong>' + utils.escape(title, false).replace("\n", "<br />")  + '</strong>' : '') +
				pmsg + 
				'</div>';

			if (this.hasOwnProperty("errorClearCallback")) {
				clearTimeout(this.errorClearCallback);
			}

			this.errorClearCallback = setTimeout(function() {
				$("#errorcontainer").empty();
			}, 10000);

			$("#errorcontainer").empty().append(str);

		}

	});


	return App;
});
