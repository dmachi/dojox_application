define(["dojo/_base/lang", "dojo/_base/declare", "dojo/on", "dojo/_base/Deferred", "../controller", "../bind", "../model"],
function(lang, declare, on, Deferred, Controller, bind, model){
	// module:
	//		dojox/app/controllers/load
	// summary:
	//		Bind "load" event on dojox.app application's dojo.Evented instance.
	//		Load child view and sub children at one time.

	return declare("dojox.app.controllers.load", Controller, {

		constructor: function(app, events){
			// summary:
			//		bind "load" event on application dojo.Evented instance.
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
			//		Use dojo.on.emit to trigger "load" event, and this function will response the event. For example:
			//		|	on.emit(this.app.evented, "load", {"parent":parent, "target":target});
			//
			// event: Object
			//		Load event parameter. It should be like this: {"parent":parent, "target":target}
			// returns:
			//		A dojo.Deferred object.
			//		The return value will keep in application dojo/Evented instance, other controllers can get this Deferred object from application.

			var parent = event.parent || this.app;
			var target = event.target || "";
			var parts = target.split(',');
			var childId = parts.shift();
			var subIds = parts.join(",");

			var def = this.loadChild(parent, childId, subIds);
			this.app.evented.promise = def; //store loadChild Deferred in application dojo/Evented instance
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
			//create child and return Deferred
			var loadChildDeferred = new Deferred();
			if(parent.views && parent.views[childId]){
				var conf = parent.views[childId];
				if(!conf.dependencies){
					conf.dependencies = [];
				}
				var deps = conf.template ? conf.dependencies.concat(["dojo/text!app/" + conf.template]) : conf.dependencies.concat([]);

				var def = new Deferred();
				if(deps.length > 0){
					require(deps, function(){
						def.resolve.call(def, arguments);
					});
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
				}));
			}
			return loadChildDeferred; //dojo.Deferred
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
			Deferred.when(this.createChild(parent, childId, subIds), lang.hitch(this, function(child){
				var parts = subIds.split(',');
				childId = parts.shift();
				subIds = parts.join(',');
				if(childId){
					var subLoadDeferred = this.loadChild(child, childId, subIds);
					Deferred.when(subLoadDeferred, function(){
						loadChildDeferred.resolve();
					});
				}else{
					loadChildDeferred.resolve();
				}
			}));
			return loadChildDeferred; //dojo.Deferred
		}
	});
});
