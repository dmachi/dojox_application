define(["require", "dojo/_base/lang", "dojo/_base/declare", "dojo/on", "dojo/Deferred", "dojo/when", "../Controller"],
	function(require, lang, declare, on, Deferred, when, Controller, View){
	// module:
	//		dojox/app/controllers/Load
	// summary:
	//		Bind "load" event on dojox/app application instance.
	//		Load child view and sub children at one time.

	return declare("dojox.app.controllers.Load", Controller, {

		constructor: function(app, events){
			// summary:
			//		bind "load" event on application instance.
			//
			// app:
			//		dojox/app application instance.
			// events:
			//		{event : handler}
			this.events = {
				"init": this.init,
				"load": this.load
			};
		},

		init: function(event){
			// when the load controller received "init", before the lifecycle really starts we create the root view
			// if any. This used to be done in main.js but must be done in Load to be able to create custom
			// views from the Load controller.
			//create and start child. return Deferred
			when(this.createView(event.parent, null, event.app, {
					templateString: event.templateString,
					definition: event.definition
			}, null, event.type), function(newView){
				when(newView.start(), event.callback);
			});
		},

		load: function(event){
			// summary:
			//		Response to dojox/app "load" event.
			//
			// example:
			//		Use trigger() to trigger "load" event, and this function will response the event. For example:
			//		|	this.trigger("load", {"parent":parent, "viewId":viewId, "callback":function(){...}});
			//
			// event: Object
			//		Load event parameter. It should be like this: {"parent":parent, "viewId":viewId, "callback":function(){...}}
			// returns:
			//		A dojo/Deferred object.
			//		The return value cannot return directly. 
			//		If the caller need to use the return value, pass callback function in event parameter and process return value in callback function.

			var parent = event.parent || this.app;
			var viewId = event.viewId || "";
			var parts = viewId.split(',');
			var childId = parts.shift();
			var subIds = parts.join(",");
			var params = event.params || "";
			
			var def = this.loadChild(parent, childId, subIds, params);
			// call Load event callback
			if(event.callback){
				when(def, event.callback);
			}
			return def;
		},

		createChild: function(parent, childId, subIds, params){
			// summary:
			//		Create a view instance if not already loaded by calling createView. This is typically a
			//		dojox/app/View.
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
			
			// check for possible default params if no params were provided
			if(!params && parent.views[childId].defaultParams){
				params = parent.views[childId].defaultParams;
			}
			var view = parent.children[id];
			if(view){
				// set params to new value before returning
				if(params){
					view.params = params;
				}
				return view;
			}
			var def = new Deferred();
			// create and start child. return Deferred
			when(this.createView(parent, id, childId, null, params, parent.views[childId].type), function(newView){
				parent.children[id] = newView;
				when(newView.start(), function(view){
					def.resolve(view);
				});
			});
			return def;
		},

		createView: function(parent, id, name, mixin, params, type){
			// summary:
			//		Create a dojox/app/View instance. Can be overridden to create different type of views.
			// parent: Object
			//		parent of this view.
			// id: String
			//		view id.
			// name: String
			//		view name.
			// mixin: String
			//		additional property to be mixed into the view (templateString, definition...)
			// params: Object
			//		params of this view.
			// type: String
			//		the MID of the View. If not provided "dojox/app/View".
			// returns:
			//		A dojo/Deferred instance which will be resolved when the view will be instantiated.
			// tags:
			//		protected
			var def = new Deferred();
			require([type?type:"../View"], function(View){
				var newView = new View(lang.mixin({
					"app": this.app,
					"id": id,
					"name": name,
					"parent": parent
				}, { "params": params }, mixin));
				def.resolve(newView);
			});
			return def;
		},

		loadChild: function(parent, childId, subIds, params){
			// summary:
			//		Load child and sub children views recursively.
			//
			// parent: Object
			//		parent of this view.
			// childId: String
			//		view id need to be loaded.
			// subIds: String
			//		sub views' id of this view.
			// params: Object
			//		params of this view.
			// returns:
			//		A dojo/Deferred instance which will be resolved when all views loaded.

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
				createPromise = this.createChild(parent, childId, subIds, params);
			}catch(ex){
				loadChildDeferred.reject("load child '"+childId+"' error.");
				return loadChildDeferred.promise;
			}
			when(createPromise, lang.hitch(this, function(child){
				// if no subIds and current view has default view or visible subViews, load the default view and visible subViews.
				// TODO: should be able to clean this section up some....
				if(!subIds){
					if(child.views){
						for(var item in child.views){  // need this to handle all visible views
							if(child.views[item].visible && child.views[item] !== child.views[child.defaultView]){
								subIds = item;
								var parts = subIds.split(',');
								childId = parts.shift();
								subIds = parts.join(',');
								if(childId){
									this.loadChild(child, childId, subIds, params);
								}
							}
						}
					}
					if(child.defaultView) {
						subIds = child.defaultView;
						var parts = subIds.split(',');
						childId = parts.shift();
						subIds = parts.join(',');
						if(childId){
							var subLoadDeferred = this.loadChild(child, childId, subIds, params);
							when(subLoadDeferred, function(){
								// need to setup selectedChildren for visible ones here.
								for(var item in child.children){  // need this to handle all visible views
									if(child.selectedChildren && child.children[item].visible){
										child.selectedChildren[child.children[item].region] = child.children[item];
									}	
								}								
								loadChildDeferred.resolve();
							},
							function(){
								loadChildDeferred.reject("load child '"+childId+"' error.");
							});
						}else{
							loadChildDeferred.resolve();
						}
					}else{
						loadChildDeferred.resolve();
					}	
				}else{
					var parts = subIds.split(',');
					childId = parts.shift();
					subIds = parts.join(',');
					if(childId){
						var subLoadDeferred = this.loadChild(child, childId, subIds, params);
						when(subLoadDeferred, function(){
							loadChildDeferred.resolve();
						},
						function(){
							loadChildDeferred.reject("load child '"+childId+"' error.");
						});
					}else{
						loadChildDeferred.resolve();
					}
				}
			}),
			function(){
				loadChildDeferred.reject("load child '"+childId+"' error.")
			});
			return loadChildDeferred.promise; // dojo/Deferred.promise
		}
	});
});
