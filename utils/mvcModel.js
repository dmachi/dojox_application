define(["dojo/_base/lang", "dojo/_base/Deferred", "dojo/_base/config",
		"dojo/store/DataStore"],
function(lang, Deferred, config, dataStore){
	return function(/*Object*/config, /*Object*/params, /*String*/item){
		// summary:
		//		mvcModel is called for each mvc model, to create the mvc model based upon the type and params.
		//		It will also load models and return the either the loadedModels or a promise.
		// description:
		//		Called for each model with a modelLoader of "dojox/app/utils/mvcModel", it will
		//		create the model based upon the type and the params set for the model in the config.
		// config: Object
		//		The models section of the config for this view or for the app.
		// params: Object
		//		The params set into the config for this model.
		// item: String
		//		The String with the name of this model
		// returns: model 
		//		 The model, of the type specified in the config for this model.
		var loadedModels = {};
		var loadMvcModelDeferred = new Deferred();

		var options;
		if(params.store.params.data){
			options = {
				"store": params.store.store,
				"query": params.store.query ? params.store.query: {}
			};
		}else if(params.store.params.url){
			options = {
				"store": new dataStore({
					store: params.store.store
				}),
				"query": params.store.query ? params.store.query: {}
			};
		}
		var modelCtor;
		var ctrl = null;
		var newModel = null;
		var type = config[item].type ? config[item].type : "dojox/mvc/EditStoreRefListController";
		// need to load the class to use for the model
		var def = new Deferred();
		require([type], // require the model type
		function(requirement){
			def.resolve(requirement);
		});

		Deferred.when(def, function(modelCtor){
			newModel = new modelCtor(options);
			var createMvcPromise;
			try{
				createMvcPromise = newModel.queryStore();
			}catch(ex){
				loadMvcModelDeferred.reject("load mvc model error.");
				return loadMvcModelDeferred.promise;
			}
			if(createMvcPromise.then){
				Deferred.when(createMvcPromise, lang.hitch(this, function() {
					// now the loadedModels[item].models is set.
					if(dojox.debugDataBinding){
						console.log("in mvcModel promise path, loadedModels = ", loadedModels);
					}
					loadedModels[item] = newModel;
					loadMvcModelDeferred.resolve(loadedModels);
					return loadedModels;
				}), function(){
					loadModelLoaderDeferred.reject("load model error.")
				});
			}else{ // query did not return a promise, so use newModel
				loadedModels = newModel;
				if(dojox.debugDataBinding){
					console.log("in mvcModel else path, loadedModels = ",loadedModels);
				}
				loadMvcModelDeferred.resolve(loadedModels);
				return loadedModels;
			}
		});
		return loadMvcModelDeferred;
	}
});
