define(["build/buildControlDefault"], function(bc){
	// module:
	//		dojox/app/build/buildControlApp
	// summary:
	//		This module extend default build control module to add dojox/app build support
	bc.transforms["depsAppConfig"] = ["dojox/app/build/depsAppConfig", "read"];
	// add the job at the right place in default control
	bc.transformJobs.splice(bc.transformJobs.length - 2, 0, [
		// json dojo app config files needs to go through depsAppConfig
		function(resource, bc){
			// parse all JSON files (some might not be app config but
			// we will ignore them in the transform
			return /\.json$/.test(resource.src);
			},
			["read", "depsAppConfig", "write"]
		]);
	return bc;
});
