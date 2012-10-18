define([
	"build/buildControl",
	"dojox/json/ref"
], function(bc, json){
	return function(resource){
		var mids = [],
			str = resource.text;

		try{
			var config = json.fromJson(str);
		}catch(e){
		}

		if(!config){
			return;
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