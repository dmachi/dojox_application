define(["require", "dojo/when", "dojo/on", "dojo/dom-attr", "dojo/_base/declare", "dojo/_base/lang",
	"dojo/Deferred",  "./model"],
	function(require, when, on, domAttr, declare, lang, Deferred, Model){
	return declare("dojox.app.ViewBase", null, {
		// summary:
		//		View base class with model & definition capabilities. Subclass must implement rendering capabilities.
		constructor: function(params){
			// summary:
			//		Constructs a ViewBase instance.
			// params:
			//		view parameters, include:
			//
			//		- app: the app
			//		- id: view id
			//		- name: view name
			//		- parent: parent view
			//		- definition: view definition module identifier
			//		- children: children views
			this.id = "";
			this.name = "";
			this.children = {};
			// private
			this._started = false;
			lang.mixin(this, params);
			// mixin views configuration to current view instance.
			if(this.parent.views){
				lang.mixin(this, this.parent.views[this.name]);
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
			this._startDef = new Deferred();
			when(this.load(), lang.hitch(this, function(){
				// call setupModel, after setupModel startup will be called after startup the loadViewDeferred will be resolved
				this._setupModel();
			}));
			return this._startDef;
		},

		load: function(){
			var defDef = this._loadDefinition();
			when(defDef, lang.hitch(this, function(definition){
				if(definition){
					lang.mixin(this, definition);
				}
			}));
			return defDef;
		},

		_setupModel: function(){
			// summary:
			//		Load views model if it is not already loaded then call _startup.
			// tags:
			//		private
			
			if (!this.loadedModels) {
				var loadModelLoaderDeferred = new Deferred();
				var createPromise;
				try{
					createPromise = Model(this.models, this.parent, this.app);
				}catch(e){
					loadModelLoaderDeferred.reject(e);
					return loadModelLoaderDeferred.promise;
				}
				if(createPromise.then){  // model returned a promise, so set loadedModels and call startup after the .when
					when(createPromise, lang.hitch(this, function(newModel){
						if(newModel){
							this.loadedModels = newModel;
						}
						this._startup();
					}),
					function(err){
						loadModelLoaderDeferred.reject(err);
					});
				}else{ // model returned the actual model not a promise, so set loadedModels and call _startup
					this.loadedModels = createPromise;
					this._startup();
				}
			}else{ // loadedModels already created so call _startup
				this._startup();				
			}		
		},

		_startup: function(){
			// summary:
			//		startup widgets in view template.
			// tags:
			//		private

				// bind view level data model
			this.parent.domNode.appendChild(this.domNode);

			// start widget
			this.startup();



			// set widget attributes
			domAttr.set(this.domNode, "id", this.id);
			domAttr.set(this.domNode, "data-app-region", "center");
			// TODO here we are overriding the entire style of the node, instead of just width & height
			// maybe we could be a bit smarter
			domAttr.set(this.domNode, "style", "width:100%; height:100%");
			this.region = "center";

			// call view assistant's init() method to initialize view
			this.app.log("  > in app/View calling init() name=[",this.name,"], parent.name=[",this.parent.name,"]");
			this.init();
			this._started = true;
			if(this._startDef){
				this._startDef.resolve(this);
			}
		},

		_loadDefinition: function(){
			// summary:
			//		Load view definition by configuration or by default.
			// tags:
			//		private
			//
			var definitionDef = new Deferred();
			var path;

			if(this.definition && (this.definition === "none")){
				definitionDef.resolve(true);
				return definitionDef;
			}else if(this.definition){
				path = this.definition.replace(/(\.js)$/, "");
			}else{
				path = this.id.split("_");
				path.shift();
				path = path.join("/");
				path = "./views/" + path;
			}

			var requireSignal;
			try{
				var loadFile = path;
				var index = loadFile.indexOf("./");
				if(index >= 0){
					loadFile = path.substring(index+2);
				}
				requireSignal = require.on("error", function(error){
					if (definitionDef.isResolved() || definitionDef.isRejected()) {
						return;
					}
					if(error.info[0] && (error.info[0].indexOf(loadFile)>= 0)){
						definitionDef.resolve(false);
						requireSignal.remove();
					}
				});

				if(path.indexOf("./") == 0){
					path = "app/"+path;
				}

				require([path], function(definition){
					definitionDef.resolve(definition);
					requireSignal.remove();
				});
			}catch(e){
				definitionDef.reject(e);
				requireSignal.remove();
			}
			return definitionDef;
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

		destroy: function(){
			// summary:
			//		view life cycle destroy()
		}
	});
});
