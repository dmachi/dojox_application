define(["dojo/_base/declare", "dojo/_base/lang", "dojo/Deferred", "dojo/when", "dojo/dom-attr", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "./model", "./bind"],
function(declare, lang, Deferred, when, dattr, TemplatedMixin, WidgetsInTemplateMixin, Model, Bind){
	// module:
	//		dojox/app/View
	// summary:
	//		dojox.app view object, each view can have one parent view and several children views.

	return declare("dojox.app.View", null, {
		constructor: function(params){
			// summary:
			//		init view object. A user can use configuration file or programing type to create a view instance.
			//
			// example:
			//		|	use configuration file
			//		|
			// 		|	// load view definition from views/simple.js by default
			//		|	"simple":{
			//		|		"template": "templates/simple.html",
			//		|		"dependencies":["dojox/mobile/TextBox"]
			//		|	}
			//		|
			//		|	"home":{
			//		|		"template": "templates/home.html",
			//		|		"definition": "none",	// identify no view definition
			//		|		"dependencies":["dojox/mobile/TextBox"]
			//		|	}
			//		|	"main":{
			//		|		"template": "templates/main.html",
			//		|		"definition": "views/main.js", // identify load view definition from views/main.js
			//		|		"dependencies":["dojox/mobile/TextBox"]
			//		|	}
			//
			// example:
			//		|	var viewObj = new View({
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
			//		id: view id
			//		name: view name
			//		template: view template url. If templateString not empty, ignore this parameter.
			//		templateString: view template string
			//		definition: view definition url
			//		parent: parent view
			//		children: children views
			this.id = "";
			this.name = "";
			this.templateString = "";
			this.template = "";
			this.definition = "";
			this.parent = null;
			this.children = {};
			this.selectedChild = null;
			// private
			this._started = false;
			this._definition = null;

			lang.mixin(this, params);
			// mixin views configuration to current view instance.
			if(this.parent.views){
				lang.mixin(this, this.parent.views[this.name]);
			}
		},

		_loadViewDefinition: function(){
			// summary:
			//		Private method. Load view definition by configuration or by default.

			var _definitionDef = new Deferred();
			var path;

			if(this.definition && (this.definition === "none")){
				_definitionDef.resolve(true);
				return _definitionDef;
			}else if(this.definition){
				var index = this.definition.indexOf('.js');
				if(index != -1){
					path = this.definition.substring(0, index);
				}
			}else{
				var path = this.id.split("_");
				path.shift();
				path = path.join("/");
				path = "views/" + path;
			}

			var requireSignal;
			try{
				requireSignal = require.on("error", function(error){
					if ((_definitionDef.fired != -1) || (error.info[0].indexOf(path) < 0)) {
						return;
					}
					_definitionDef.resolve(false);
					requireSignal.remove();
				});

				require(["app/" + path], function(definition){
					_definitionDef.resolve(definition);
					requireSignal.remove();
				});
			}catch(ex){
				_definitionDef.resolve(false);
				requireSignal.remove();
			}
			return _definitionDef;
		},

		_loadViewTemplate: function(){
			// summary:
			//		Private method.
			//		load view HTML template and dependencies.

			if(this.templateString){
				return true;
			}else{
				if(!this.dependencies){
					this.dependencies = [];
				}
				var deps = this.template ? this.dependencies.concat(["dojo/text!app/" + this.template]) : this.dependencies.concat([]);
				var def = new Deferred();
				if(deps.length > 0){
					var requireSignal;
					try{
						requireSignal = require.on("error", lang.hitch(this, function(error){
							if((def.fired != -1) || (error.info[0].indexOf(this.template) < 0)){
								return;
							}
							def.resolve(false);
							requireSignal.remove();
						}));
						require(deps, function(){
							def.resolve.call(def, arguments);
							requireSignal.remove();
						});
					}catch(ex){
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
		start: function(){
			// summary:
			//		start view object.
			//		load view template, view definition implement and startup all widgets in view template.
			if(this._started){
				return this;
			}

			var _definitionDef = this._loadViewDefinition();
			var _templateDef = this._loadViewTemplate();

			this._startDef = new Deferred();
			when(_definitionDef, lang.hitch(this, function(definition){
				this._definition = definition;
				when(_templateDef, lang.hitch(this, function(){
					// call setupModel, after setupModel startup will be called after startup the loadViewDeferred will be resolved
					this._setupModel();
				}));
			}));
			return this._startDef;
		},

		_setupModel: function(){
			//load views model if it is not already loaded then call startup
			if (!this.loadedModels) {
				var loadModelLoaderDeferred = new Deferred();
				var createPromise;
				try{
					createPromise = Model(this.models, this.parent);
				}catch(ex){
					loadModelLoaderDeferred.reject("load model error.");
					return loadModelLoaderDeferred.promise;
				}
				if(createPromise.then){  // model returned a promise, so set loadedModels and call startup after the .when
					when(createPromise, lang.hitch(this, function(newModel){
						if(newModel){
							this.loadedModels = newModel;
						}
						if(dojox.debugDataBinding){
							console.log("in view setupModel, this.loadedModels =",this.loadedModels);
						}
						this._startup();
					}),
					function(){
						loadModelLoaderDeferred.reject("load model error.")
					});
				}else{ // model returned the actual model not a promise, so set loadedModels and call _startup
					this.loadedModels = createPromise;
					if(dojox.debugDataBinding){
						console.log("in view setupModel else, this.loadedModels =",this.loadedModels);
					}
					this._startup();
				}
			}else{ // loadedModels already created so call _startup
				this._startup();				
			}		
		},

		_startup: function(){
			// summary:
			//		private method
			//		startup widgets in view template.

			this._widget = this.render(this.templateString);
			// bind view level data model
			this.domNode = this._widget.domNode;
			this.parent.domNode.appendChild(this.domNode);

			//start widget
			this._widget.startup();

			// set widget attributes
			dattr.set(this.domNode, "id", this.id);
			dattr.set(this.domNode, "region", "center");
			dattr.set(this.domNode, "style", "width:100%; height:100%");
			this._widget.region = "center";

			//mixin view lifecycle implement
			if (this._definition) {
				lang.mixin(this, this._definition);
			}

			// call view assistant's init() method to initialize view
			this.init();
			this._started = true;
			if(this._startDef){
				this._startDef.resolve(this);
			}
		},

		render: function(templateString){
			// summary:
			//		rendering view template HTML
			// templateString:
			//		template string
			var widgetTemplate = new TemplatedMixin();
			var widgetInTemplate = new WidgetsInTemplateMixin();
			// set the loadedModels here to be able to access the model on the parse.
			if(this.loadedModels){
				widgetInTemplate.loadedModels = this.loadedModels;
				if(dojox.debugDataBinding){
					console.log("in view render, this.loadedModels =",this.loadedModels);
				}
			}
			lang.mixin(widgetTemplate, widgetInTemplate);
			widgetTemplate.templateString = templateString;
			widgetTemplate.buildRendering();
			return widgetTemplate;
		},
		
		init: function(){
			// summary:
			//		view life cycle init()
		},

		beforeActivate: function(){
			// summary:
			//		view life cycle beforeActivate()
		},

		afterActivate: function(){
			// summary:
			//		view life cycle afterActivate()
		},

		beforeDeactivate: function(){
			// summary:
			//		view life cycle beforeDeactivate()
		},

		afterDeactivate: function(){
			// summary:
			//		view life cycle afterDeactivate()
		},

		destory: function(){
			// summary:
			//		view life cycle destory()
		}
	});
});
