define([
	"dojo/_base/declare",
	"dojo/Deferred",
	"dojo/when",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"./model"
], function(
	declare,
	Deferred,
	when,
	lang,
	dattr,
	Model
) {

	return declare('dojox.app._WidgetViewMixin', null, {
		// start view
		start: function(){
			// summary:
			//		start view object.
			//		load view template, view definition implement and startup all widgets in view template.
			if(this._started){
				return this;
			}

			this._startDef = new Deferred();
			this._setupModel();
			return this._startDef;
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
				if(createPromise.then){	// model returned a promise, so set loadedModels and call startup after the .when
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

			//start widget
			this.startup();
			this.parent.domNode.appendChild(this.domNode);

			// set widget attributes
			dattr.set(this.domNode, "id", this.id);
			dattr.set(this.domNode, "data-app-region", "center");
			// TODO here we are overriding the entire style of the node, instead of just width & height
			// maybe we could be a bit smarter
			//dattr.set(this.domNode, "style", "width:100%; height:100%");
			this.region = "center";

			//mixin view lifecycle implement
			if (this._definition) {
				lang.mixin(this, this._definition);
			}

			// call view assistant's init() method to initialize view
			this.app.log("  > in app/_WidgetView calling init() name=[",this.name,"], parent.name=[",this.parent.name,"]");
			this.init();
			this._started = true;
			if(this._startDef){
				this._startDef.resolve(this);
			}
		},

		render: function(templateString){
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