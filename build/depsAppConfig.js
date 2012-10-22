define([
	"require",
	"build/buildControl",
	"dojox/json/ref"
], function(require, bc, json){
	var parseViews = function(mids, views){
		for(var key in views){
			// ignore naming starting with _ (jsonref adding is own stuff in there)
			if(key.indexOf("_") == 0){
				continue;
			}
			var view = views[key];
			// TODO deal with "./" shortcut?
			if(view.definition && view.definition != "none"){
				// TODO default view location?
				mids.push(view.definition.replace(/(\.js)$/, ""));
			}
			if(view.template){
				mids.push(view.template);
			}
			if(view.dependencies){
				Array.prototype.splice.apply(mids, [ mids.length, 0 ].concat(view.dependencies));
			}
			if(view.views){
				parseViews(mids, view.views);
			}
		}
	}
	return function(resource){
		var mids = [],
			str = resource.text;

		try{
			var config = json.fromJson(str);
		}catch(e){
			// TODO better error reporting
		}

		if(!config){
			return;
		}

		if(config.loaderConfig){
			console.log("config: "+config.loaderConfig.paths);
			require(config.loaderConfig);
		}

		if(config.dependencies){
			mids = mids.concat(config.dependencies);
		}
		if(config.controllers){
			mids = mids.concat(config.controllers);
		}
		if(config.modules){
			mids = mids.concat(config.modules);
		}

		// TODO top level view / template

		// go into the vieww
		if(config.views){
			parseViews(mids, config.views);
		}

		// depsDeclarative.js
		// Iterate through the layers, identify those that contain this resource.mid, 
		// remove it from the include array and then add this resource's includes
		for(var mid in bc.amdResources){
			if(bc.amdResources[mid].layer){ // This resource is a layer
				var includes = bc.amdResources[mid].layer.include,
					idx = includes.indexOf(resource.mid);
				// Bitwise operator that returns true if the layer contains this resource
				if(~idx){
					// Remove this resources mid from the layer's include array
					includes.splice(idx, 1);
					mids.forEach(function(dep){
						// Uniquely add appropriate mids to the layer's include array
						if(!(/^(require|exports|module)$/.test(dep))){
							if(!~includes.indexOf(dep)){
								includes.push(dep);
							}
						}
					});
				}
			}
		}

	};
});