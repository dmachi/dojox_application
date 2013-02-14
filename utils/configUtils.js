define(["dojo/sniff",], function(has){

// module:
//		dojox/app/utils/configUtils

var configUtils = {
	// summary:
	//		This module contains the configUtils

	configProcessHas: function(/*Object*/ source, /*Object?*/ hasList){
		// summary:
		//		scan the source config for has checks and call configMerge to merge has sections, and remove the has sections from the source.
		// description:
		//		configProcessHas will scan the source config for has checks. 
		//		For each has section the items inside the has section will be tested in the haslist and if not set 
		//		it will be tested with a has call using sniff. 
		//		If the has test is true it will call configMerge to merge has sections back into the source config.
		//		It will always remove the has section from the source after processing it.
		//		The names in the has section can be separated by a comma, indicating that any of those being true will satisfy the test.
		// source:
		//		an object representing the config to be processed.
		// hasList:
		//		an object containing a list of has names and values (typically true or false) which indicate whether that has test passes or fails
		// returns:
		//		the updated source object.
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

	configMerge: function(/*Object*/ target, /*Object*/ source){
		// summary:
		//		does a deep copy of the source into the target to merge the config from the source into the target
		// description:
		//		configMerge will merge the source config into the target config with a deep copy.
		//		anything starting with __ will be skipped and if the target is an array the source items will be pushed into the target.
		// target:
		//		an object representing the config which will be updated by merging in the source.
		// source:
		//		an object representing the config to be merged into the target.
		// returns:
		//		the updated target object.

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
