define(["require", "dojo/when", "dojo/on", "dojo/_base/declare", "dojo/_base/lang", "dojo/Deferred",
		"dijit/Destroyable", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "./ViewBase"],
	function(require, when, on, declare, lang, Deferred, Destroyable, _TemplatedMixin, _WidgetsInTemplateMixin, ViewBase){
	// module:
	//		dojox/app/View
	// summary:
	//		dojox/app view object, each view can have one parent view and several children views.

	return declare("dojox.app.View", [_TemplatedMixin, _WidgetsInTemplateMixin, Destroyable, ViewBase], {
		constructor: function(params){
			// summary:
			//		init view object. A user can use configuration file or programing type to create a view instance.
			//
			// example:
			//		|	use configuration file
			//		|
			// 		|	// load view definition from views/simple.js by default
			//		|	"simple":{
			//		|		"template": "./templates/simple.html",
			//		|		"dependencies":["dojox/mobile/TextBox"]
			//		|	}
			//		|
			//		|	"home":{
			//		|		"template": "./templates/home.html",
			//		|		"definition": "none",	// identify no view definition
			//		|		"dependencies":["dojox/mobile/TextBox"]
			//		|	}
			//		|	"main":{
			//		|		"template": "./templates/main.html",
			//		|		"definition": "./views/main.js", // identify load view definition from views/main.js
			//		|		"dependencies":["dojox/mobile/TextBox"]
			//		|	}
			//
			// example:
			//		|	var viewObj = new View({
			//		|		app: this.app,
			//		|		id: this.id,
			//		|		name: this.name,
			//		|		parent: this,
			//		|		templateString: this.templateString,
			//		|		definition: this.definition
			//		|	});
			//		|	viewObj.start(); // start view
			//
			// params:
			//		view parameters, include:
			//
			//		- app: the app
			//		- id: view id
			//		- name: view name
			//		- template: view template url. If templateString not empty, ignore this parameter.
			//		- templateString: view template string
			//		- definition: view definition url
			//		- parent: parent view
			//		- children: children views
		},

		// _TemplatedMixin requires a connect method if data-dojo-attach-* are used
		connect: function(obj, event, method){
			return this.own(on(obj, event, lang.hitch(this, method)))[0];  // handle
		},

		_loadViewTemplate: function(){
			// summary:
			//		load view HTML template and dependencies.
			// tags:
			//		private
			//

			if(this.templateString){
				return true;
			}else{
				var tpl = this.template;
				var deps = this.dependencies?this.dependencies:[];
				if(tpl){
					if(tpl.indexOf("./") == 0){
						tpl = "app/"+tpl;
					}
					deps = deps.concat(["dojo/text!"+tpl]);
				}
				var def = new Deferred();
				if(deps.length > 0){
					var requireSignal;
					try{
						requireSignal = require.on("error", lang.hitch(this, function(error){
							if(def.isResolved() || def.isRejected()){
								return;
							}
							if(error.info[0] && error.info[0].indexOf(this.template)>=0 ){
								def.resolve(false);
								requireSignal.remove();
							}
						}));
						require(deps, function(){
							def.resolve.call(def, arguments);
							requireSignal.remove();
						});
					}catch(e){
						def.resolve(false);
						requireSignal.remove();
					}
				}else{
					def.resolve(true);
				}
				var loadViewDeferred = new Deferred();
				when(def, lang.hitch(this, function(){
					this.templateString = this.template ? arguments[0][arguments[0].length - 1] : "<div></div>";
					loadViewDeferred.resolve(this);
				}));
				return loadViewDeferred;
			}
		},

		// start view
		load: function(){
			var tplDef = new Deferred();
			var defDef = this.inherited(arguments);
			// when parent loading is done (definition), proceed with template
			// (for data-dojo-* to work we need to wait for definition to be here, this is also
			// useful when the definition is used as a layer for the view)
			when(defDef, lang.hitch(this, function(){
				when(this._loadViewTemplate(), function(value){
					tplDef.resolve(value);
				});
			}));
			return tplDef;
		},

		_startup: function(){
			// summary:
			//		startup widgets in view template.
			// tags:
			//		private
			this.buildRendering();
			this.inherited(arguments);
		}
	});
});
