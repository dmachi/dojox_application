define(["dojo","dijit","dojox", "dojo/cache","dojo/fx","dojox/json/ref","dojo/parser","./scene","./transition"],function(dojo,dijit,dijox,cache,fx,jsonRef,parser,sceneCtor,transition){
	var Application = dojo.declare([sceneCtor], {
		constructor: function(params){
			this.scenes={};
			if(params.stores){
			    //TODO create stores in the congfiguration.
			}

		},
		templateString: "<div></div>",
		selectedChild: null,
		baseClass: "application mblView",
		defaultViewType: sceneCtor,
		buildRendering: function(){
			if (this.srcNodeRef===dojo.body()){
				this.srcNodeRef = dojo.create("DIV",{},dojo.body());
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
			App = dojo.declare(modules,ext);

			dojo.ready(function(){
				app = App(config,node || dojo.body());
				app.startup();
			});
		});
	}


	return function(config,node){
		if (!config){
			throw Error("App Config Missing");
		}

		
		if (config.validate){
			require(["dojox/json/schema","dojo/text!dojox/application/schema/application.json"],function(schema,appSchema){
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
