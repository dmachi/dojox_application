define(["dojo","dojox/json/ref","dojox/json/schema","dojox/application/kernel","text!dojox/application/schema/application.json"],function(dojo,ref,schema, kernel,appSchema){
	return function(config){
		if (!config){
			throw Error("App Config Missing");
		}

		console.log("before resolve: ", appSchema);

		if (appSchema){
			var as = dojox.json.ref.resolveJson(appSchema);
		}

		console.log("as: ", as);	
		//TODO validate schema here
		//if (schema.validate(config,appSchema)){
			console.log("config.modules: ", config.modules);
			var modules = config.modules.concat(config.dependencies||[]);
			return define(modules, function(){
				var modules=[kernel];
				for(var i=0;i<config.modules.length;i++){
					modules.push(arguments[i]);
				}
				//console.log("declare: ",modules);	
				config = dojox.json.ref.resolveJson(config);
				if (config.template){
					var ext = {
						templateString: dojo.cache("",window.location.pathname + config.template)
					}	
				}
				//console.log("ext: ", ext);	
				App = dojo.declare(modules,ext);
				console.log("after");
				dojo.ready(function(){
					app = new App({config: config},dojo.body());
				
				/*	
					dojo.when(app.ready, function(){
						if (config.splash){
							dojo.style(splash,"display","none");
						}
					});
				*/
					app.startup();
				});
			});
		//}else{
		//	console.error("Failed to process application config");
		//}
	}
});
