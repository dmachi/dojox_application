define(["dojo/_base/lang",
	"dojo/_base/declare",
	"dojo/_base/Deferred",
	"dojo/on",
	"dojo/ready",
	"dojo/_base/window",
	"dojo/dom-construct",
	"./scene",
	"./controllers/Load",
	"./controllers/Transition",
	"./controllers/Layout"],
	function(dlang, declare, Deferred, on, ready, baseWindow, dom, sceneCtor, LoadController, TransitionController, LayoutController){

        dojo.experimental("dojox.app");
	var Application = declare([sceneCtor], {
		constructor: function(params){
			this.scenes={};
			if(params.stores){
			    //create stores in the configuration.
			    for (var item in params.stores){
			        if(item.charAt(0)!=="_"){//skip the private properties
			            var type = params.stores[item].type? params.stores[item].type : "dojo.store.Memory";
			            var config = {};
			            if(params.stores[item].params){
			                dlang.mixin(config, params.stores[item].params);
			            }
			            var storeCtor = dojo.getObject(type);
			            if(config.data && dlang.isString(config.data)){
			                //get the object specified by string value of data property
			                //cannot assign object literal or reference to data property
			                //because json.ref will generate __parent to point to its parent
			                //and will cause infinitive loop when creating StatefulModel.
			                config.data = dlang.getObject(config.data);
			            }
			            params.stores[item].store = new storeCtor(config);
			        }
			    }
			}
		},

		createControllers: function(controllers){
			// summary:
			//		Create controller instance
			//
			// parent: Array
			//		controller configuration array.
			// returns:
			//		controllerDeferred object

			if (controllers) {
				var requireItems = [];
				for (var i = 0; i < controllers.length; i++) {
					requireItems.push(controllers[i]);
				}

				var def = new Deferred();
				var requireSignal;
				try{
					requireSignal = require.on("error", function(error){
						if(def.fired != -1){
							return;
						}
						def.reject("load controllers error.");
						requireSignal.remove();
					});
					require(requireItems, function(){
						def.resolve.call(def, arguments);
						requireSignal.remove();
					})
				}catch(ex){
					def.reject("load controllers error.");
					requireSignal.remove();
				}

				var controllerDef = new Deferred();
				Deferred.when(def, dlang.hitch(this, function(){
					for (var i = 0; i < arguments[0].length; i++) {
						// Store Application object on each controller.
						this.controllers.push(new arguments[0][i](this));
					}
					controllerDef.resolve(this);
				}),
				function(){
					//require def error, reject loadChildDeferred
					controllerDef.reject("load controllers error.");
				});
				return controllerDef;
			}
		},

		trigger: function(event, params){
			// summary:
			//		trigger an event
			//
			// event: String
			//		event name. The event is binded by controller.bind() method.
			// params: Object
			//		event parameters.
			on.emit(this.domNode, event, params);
		},

		// load default view and startup the default view
        start: function(){
			// create application controller instance
			new LoadController(this);
			new TransitionController(this);
			new LayoutController(this);

			// move set _startView operation from history module to application
			var hash = window.location.hash;
			this._startView= ((hash && hash.charAt(0)=="#") ? hash.substr(1) : hash)||this.defaultView;
			
			// load controllers in configuration file
			var controllers = this.createControllers(this.params.controllers);
			Deferred.when(controllers, dlang.hitch(this, function(){
			// emit load default view event
				this.trigger("load", {
				"callback": dlang.hitch(this, function(){
					this.startup();

					//set application status to STARTED
					this.setStatus(this.lifecycle.STARTED);
				})
			});
			}));
        },
		templateString: "<div></div>",
		selectedChild: null,
		baseClass: "application mblView",
		defaultViewType: sceneCtor,
		buildRendering: function(){
			if (this.srcNodeRef===baseWindow.body()){
				this.srcNodeRef = dom.create("DIV",{},baseWindow.body());
			}
			this.inherited(arguments);
		}
	});
	
	function generateApp(config,node,appSchema,validate){

		//console.log("config.modules: ", config.modules);
		var modules = config.modules.concat(config.dependencies);

		if (config.template){
			//console.log("config.template: ", config.template);
			modules.push("dojo/text!" + "app/" + config.template);
		}
		//console.log("modules: ", modules);	

		require(modules, function(){
			var modules=[Application];
			for(var i=0;i<config.modules.length;i++){
				modules.push(arguments[i]);
			}

			if (config.template){
				var ext = {
					templateString: arguments[arguments.length-1] 
				}	
			}
			App = declare(modules,ext);

			ready(function(){
				app = App(config,node || baseWindow.body());
                app.setStatus(app.lifecycle.STARTING);
                app.start();
			});
		});
	}


	return function(config,node){
		if (!config){
			throw Error("App Config Missing");
		}

		
		if (config.validate){
			require(["dojox/json/schema","dojox/json/ref","dojo/text!dojox/application/schema/application.json"],function(schema,appSchema){
				schema = dojox.json.ref.resolveJson(schema);	
				if (schema.validate(config,appSchema)){
					generateApp(config,node);
				}	
			});
		

		}else{
			generateApp(config,node);
		}
	}
});
