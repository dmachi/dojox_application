define(["dojo/_base/lang", "dojo/Deferred", "dojo/when", "dojo/_base/config", "dojo/has"], 
function(lang, Deferred, when, config, has){
	has.add("mvc-bindings-log-api", (config["mvc"] || {}).debugBindings);  // setup has check for mvc debugBindings flag
	return function(/*Object*/ config, /*Object*/ parent){
		// summary:
		//		model is called to create all of the models for the app, and all models for a view, it will
		//		create and call the appropriate model utility based upon the modelLoader set in the model in the config
		// description:
		//		Called for each view or for the app.  For each model in the config, it will  
		//		create the model utility based upon the modelLoader and call it to create and load the model. 
		// config: Object
		//		The models section of the config for this view or for the app.
		// parent: Object
		//		The parent of this view or the app itself, so that models from the parent will be 
		//		available to the view.
		// returns: loadedModels 
		//		 loadedModels is an object holding all of the available loaded models for this view.
		//var config = params.config;
		//var parent = params.parent;

		this.defCount = 0;
		var loadedModels = {};
		var allModelsLoadedDeferred = new Deferred();
		if(parent.loadedModels){
			lang.mixin(loadedModels, parent.loadedModels);
		}
		if(config){
			var loadModelDeferred = loadedModels;
			for(var test in config){
				if(test.charAt(0) !== "_"){
					this.defCount++;
				}
			}
			if(this.defCount == 0){
				return loadedModels;
			}
			for(var item in config){
				if(item.charAt(0) !== "_"){
					setupModel(config, item, parent, allModelsLoadedDeferred, loadedModels);
				}
			}
			return allModelsLoadedDeferred;
		}else{
			return loadedModels;
		}
		return allModelsLoadedDeferred;
	};

	function setupModel(config, item, parent, allModelsLoadedDeferred, loadedModels){
				// Here we need to create the modelLoader and call it passing in the item and the config[item].params
				params = config[item].params ? config[item].params : {};
				var def = new Deferred();
				
				var modelLoader = config[item].modelLoader ? config[item].modelLoader : "dojox/app/utils/simpleModel";
				require([modelLoader], // require the model type
						function( requirement ){
							def.resolve( requirement );
						}
				);
				var loadModelDeferred = new Deferred();
				return when(def, lang.hitch(this, function(modelCtor){
					var createModelPromise;
					try{
						createModelPromise = modelCtor(config, params, item);
					}catch(ex){
						console.warn("load model error in model.", ex);
						loadModelDeferred.reject("load model error in model.", ex);
						return loadModelDeferred.promise;
					}
					if(createModelPromise.then){
						when(createModelPromise, lang.hitch(this, function(newModel){
							loadedModels[item] = newModel;
							if(has("mvc-bindings-log-api")){
								console.log("in model, loadedModels for item="+item);
								console.log(loadedModels);
							}
							this.defCount--;
							if(this.defCount == 0){
								allModelsLoadedDeferred.resolve(loadedModels);
							}
							loadModelDeferred.resolve(loadedModels);
							return loadedModels;
						}),
						function(){
							loadModelDeferred.reject("load model error in models.");
						});
						return loadModelDeferred;
					}else{
						loadedModels[item] = createModelPromise;
						if(has("mvc-bindings-log-api")){
							console.log("in model else path, loadedModels for item="+item);
							console.log(loadedModels);
						}
						this.defCount--;
						if(this.defCount == 0){
							allModelsLoadedDeferred.resolve(loadedModels);
						}
						loadModelDeferred.resolve(loadedModels);
						return loadedModels;
					}
				}));
				return loadModelDeferred;					
	}	
});
