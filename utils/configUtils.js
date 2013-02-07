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
		//var target = lang.clone(source);
		for(var name in source){
			var	sval = source[name];
			if(name == "has"){ // process this has check
				console.log("in has check need to handle sval = ",sval);
				for(var hasname in sval){
					var hasval = sval[hasname];
					if(!(hasname.charAt(0) == '_' && hasname.charAt(1) == '_')&& sval && typeof sval === 'object'){
						// test to see if this hasname should be merged, test for true in hasList, "default" hasname or has(hasname)
						if(hasList[hasname] || hasname == "default" || has(hasname)) { // if true this one should be merged
							console.log("in has check need to merge hasname = "+hasname+" with hasval=",hasval);
							var temptest = this.configMerge(source, hasval); // merge this has section into the source config 
							console.log("in has check after merge of hasname ="+hasname+" got temptest = ",temptest);
							delete source["has"];  // after merge remove this has section from the config
						}
					}
				}
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
