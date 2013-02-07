define(["dojo/sniff",], function(has){

// module:
//		dojox/app/utils/configUtils

var configUtils = {
	// summary:
	//		This module contains the configUtils

	configProcessHas: function(source, hasList){
		// summary:
		//		scan the source for has checks and call configMerge to merge has sections or remove the has sections from the source.
		// description:
		//		configMerge will merge the source config into the target config with a deep copy.
		//		anything starting with __ will be skipped and if the target is an array the source items will be pushed into the target.
		for(var name in source){
			var	sval = source[name];
			if(name == "has"){ // found a "has" section in source
				for(var hasname in sval){ // get the hasnames from the has section
					if(!(hasname.charAt(0) == '_' && hasname.charAt(1) == '_') && sval && typeof sval === 'object'){
						// need to handle multiple has checks separated by a ",".
						var parts = hasname.split(',');
						if(parts.length > 0){
							while(parts.length > 0){ 	
								var haspart = parts.shift();
								if(hasList[haspart] || has(haspart)) { // if true this one should be merged
									var hasval = sval[hasname];
									this.configMerge(source, hasval); // merge this has section into the source config
									break;  // found a match for this multiple has test, so go to the next one
								}
							}
						}
					}
				}
				delete source["has"];  // after merge remove this has section from the config
				//console.log("in has check after all merge and remove of has for hasname ="+hasname+" got source = ",source);
			}else{
				if(!(name.charAt(0) == '_' && name.charAt(1) == '_')&& sval && typeof sval === 'object'){
						this.configProcessHas(sval, hasList);
				}
			}
		}
		return source;
	},

	configMerge: function(target, source){
		// summary:
		//		does a deep copy of the source into the target to merge config from the source into the target
		// description:
		//		configMerge will merge the source config into the target config with a deep copy.
		//		anything starting with __ will be skipped and if the target is an array the source items will be pushed into the target.

		for(var name in source){
			var tval = target[name];
			var	sval = source[name];
			if(tval !== sval && !(name.charAt(0) == '_' && name.charAt(1) == '_')){
				if(tval && typeof tval === 'object' && sval && typeof sval === 'object'){
					this.configMerge(tval, sval);
				}else{
					if(target instanceof Array){
						target.push(sval);
					}else{
						target[name] = sval;
					}
				}
			}
		}
		return target;
	}
};

return configUtils;

});
