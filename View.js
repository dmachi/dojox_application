define(["require", "dojo/when", "dojo/on", "dojo/_base/declare", "dojo/_base/lang", "dojo/Deferred",
		"dijit/Destroyable", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "./ViewBase"],
	function(require, when, on, declare, lang, Deferred, Destroyable, _TemplatedMixin, _WidgetsInTemplateMixin, ViewBase){

	return declare("dojox.app.View", [_TemplatedMixin, _WidgetsInTemplateMixin, Destroyable, ViewBase], {
		// summary:
		//		View class inheriting from ViewBase adding templating & globalization capabilities.
		constructor: function(params){
			// summary:
			//		Constructs a View instance either from a configuration or programmatically.
			//
			// example:
			//		|	use configuration file
			//		|
			// 		|	// load view definition from views/simple.js by default
			//		|	"simple":{
			//		|		"template": "myapp/templates/simple.html",
			//		|		"nls": "myapp/nls/simple"
			//		|		"dependencies":["dojox/mobile/TextBox"]
			//		|	}
			//		|
			//		|	"home":{
			//		|		"template": "myapp/templates/home.html",
			//		|		"definition": "none",	// identify no view definition
			//		|		"dependencies":["dojox/mobile/TextBox"]
			//		|	}
			//		|	"main":{
			//		|		"template": "myapp/templates/main.html",
			//		|		"definition": "myapp/views/main.js", // identify load view definition from views/main.js
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
			//		- template: view template identifier. If templateString is not empty, this parameter is ignored.
			//		- templateString: view template string
			//		- definition: view definition module identifier
			//		- parent: parent view
			//		- children: children views
			//		- nls: nls definition module identifier
		},

		// _TemplatedMixin requires a connect method if data-dojo-attach-* are used
		connect: function(obj, event, method){
			return this.own(on(obj, event, lang.hitch(this, method)))[0];  // handle
		},

		_loadTemplate: function(){
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

		_loadNls: function(){
			// summary:
			//		load view nls file.
			// tags:
			//		private
			//
			if(this.nls){
				var nlsDef = new Deferred();
				var path = this.nls;
				var requireSignal;
				try{
					var loadFile = path;
					var index = loadFile.indexOf("./");
					if(index >= 0){
						loadFile = path.substring(index+2);
					}
					requireSignal = require.on("error", function(error){
						if (nlsDef.isResolved() || nlsDef.isRejected()) {
							return;
						}
						if(error.info[0] && (error.info[0].indexOf(loadFile)>= 0)){
							nlsDef.resolve(false);
							requireSignal.remove();
						}
					});

					if(path.indexOf("./") == 0){
						path = "app/"+path;
					}

					require(["dojo/i18n!"+path], function(nls){
						nlsDef.resolve(nls);
						requireSignal.remove();
					});
				}catch(e){
					nlsDef.reject(e);
					requireSignal.remove();
				}
				return nlsDef;
			}
			return true;
		},

		// start view
		load: function(){
			var tplDef = new Deferred();
			var defDef = this.inherited(arguments);
			var nlsDef = this._loadNls();
			// when parent loading is done (definition), proceed with template
			// (for data-dojo-* to work we need to wait for definition to be here, this is also
			// useful when the definition is used as a layer for the view)
			when(defDef, lang.hitch(this, function(){
				when(nlsDef, lang.hitch(this, function(nls){
					if(nls){
						// make sure template can access nls doing ${nls.myprop}
						this.nls = {};
						lang.mixin(this.nls, nls);
					}
				}));
				when(this._loadTemplate(), function(value){
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
