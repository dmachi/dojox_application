define(["dojo/_base/lang", "dojo/_base/declare", "dojo/on", "dojo/_base/Deferred", "../controller", "../bind", "../model"],
function(lang, declare, on, Deferred, Controller, bind, model){
	// module:
	//		dojox/app/controllers/Load
	// summary:
	//		Bind "load" event on dojox.app application's domNode.
	//		Load child view and sub children at one time.

	return declare("dojox.app.controllers.Load", Controller, {

		constructor: function(app, events){
			// summary:
			//		bind "load" event on application's domNode.
			//
			// app:
			//		dojox.app application instance.
			// events:
			//		{event : handler}
			this.events = {
				"load": this.load
			};
			this.inherited(arguments);
		},

		load: function(event){
			// summary:
			//		Response to dojox.app "load" event.
			//
			// example:
			//		Use trigger() to trigger "load" event, and this function will response the event. For example:
			//		|	this.trigger("load", {"parent":parent, "viewId":viewId, "callback":function(){...}});
			//
			// event: Object
			//		Load event parameter. It should be like this: {"parent":parent, "viewId":viewId, "callback":function(){...}}
			// returns:
			//		A dojo.Deferred object.
			//		The return value cannot return directly. 
			//		If the caller need to use the return value, pass callback function in event parameter and process return value in callback function.

			var parent = event.parent || this.app;
			var viewId = event.viewId || "";
			var parts = viewId.split(',');
			var childId = parts.shift();
			var subIds = parts.join(",");

			var def = this.loadChild(parent, childId, subIds);
			// call Load event callback
			if(event.callback){
				Deferred.when(def, event.callback);
			}
			return def;
		},

		createChild: function(parent, childId, subIds){
			// summary:
			//		Create dojox.app.view instance if it is not loaded.
			//
			// parent: Object
			//		parent of the view.
			// childId: String
			//		view id need to be loaded.
			// subIds: String
			//		sub views' id of this view.
			// returns:
			//		If view exist, return the view object.
			//		Otherwise, create the view and return a dojo.Deferred instance.

			var id = parent.id + '_' + childId;
			if(parent.children[id]){
				return parent.children[id];
			}

			if(parent.views && parent.views[childId]){
				//create child and return Deferred
				var loadChildDeferred = new Deferred();

				var conf = parent.views[childId];
				if(!conf.dependencies){
					conf.dependencies = [];
				}
				var deps = conf.template ? conf.dependencies.concat(["dojo/text!app/" + conf.template]) : conf.dependencies.concat([]);

				var def = new Deferred();
				if(deps.length > 0){
					var requireSignal;
					try{
						requireSignal = require.on("error", function(error){
							if(def.fired != -1){
								return;
							}
							console.error("load dependencies error in createChild.", error);
							def.reject("load dependencies error.");
							requireSignal.remove();
						});
						require(deps, function(){
							def.resolve.call(def, arguments);
							requireSignal.remove();
						});
					}catch(ex){
						console.error("load dependencies error in createChild. ", ex)
						def.reject("load dependencies error.");
						requireSignal.remove();
					}
				}else{
					def.resolve(true);
				}

				var self = parent;
				Deferred.when(def, lang.hitch(this, function(){
					var ctor;
					if(conf.type){
						ctor = lang.getObject(conf.type);
					}else if (self.defaultViewType){
						ctor = self.defaultViewType;
					}else{
						throw Error("Unable to find appropriate ctor for the base child class");
					}

					var params = lang.mixin({}, conf, {
						id: self.id + "_" + childId,
						templateString: conf.template ? arguments[0][arguments[0].length - 1] : "<div></div>",
						parent: self,
						app: self.app
					});
					if(subIds){
						params.defaultView = subIds;
					}
					var child = new ctor(params);
					//load child's model if it is not loaded before
					if(!child.loadedModels){
						child.loadedModels = model(conf.models, self.loadedModels)
						//TODO need to find out a better way to get all bindable controls in a view
						bind([child], child.loadedModels);
					}
					var addResult = self.addChild(child);
					loadChildDeferred.resolve(child);
				}),
				function(){
					//require def error, reject loadChildDeferred
					loadChildDeferred.reject("create child error.");
				});
				return loadChildDeferred.promise; //dojo.Deferred promise
			}
			throw Error("No configuration for view '"+childId+"'");
		},

		loadChild: function(parent, childId, subIds){
			// summary:
			//		Load child and sub children views recursively.
			//
			// parent: Object
			//		parent of this view.
			// childId: String
			//		view id need to be loaded.
			// subIds: String
			//		sub views' id of this view.
			// returns:
			//		A dojo.Deferred instance which will be resovled when all views loaded.

			if(!parent){
				throw Error("No parent for Child '" + childId + "'.");
			}

			if(!childId){
				var parts = parent.defaultView ? parent.defaultView.split(",") : "default";
				childId = parts.shift();
				subIds = parts.join(',');
			}

			var loadChildDeferred = new Deferred();
			var createPromise;
			try{
				createPromise = this.createChild(parent, childId, subIds);
			}catch(ex){
				loadChildDeferred.reject("load child '"+childId+"' error.");
				return loadChildDeferred.promise;
			}
			Deferred.when(createPromise, lang.hitch(this, function(child){
				// if no subIds and current view has default view, load the default view.
				if(!subIds && child.defaultView){
					subIds = child.defaultView;
				}

				var parts = subIds.split(',');
				childId = parts.shift();
				subIds = parts.join(',');
				if(childId){
					var subLoadDeferred = this.loadChild(child, childId, subIds);
					Deferred.when(subLoadDeferred, function(){
						loadChildDeferred.resolve();
					},
					function(){
						loadChildDeferred.reject("load child '"+childId+"' error.");
					});
				}else{
					loadChildDeferred.resolve();
				}
			}),
			function(){
				loadChildDeferred.reject("load child '"+childId+"' error.")
			});
			return loadChildDeferred.promise; //dojo.Deferred promise
		}
	});
});
