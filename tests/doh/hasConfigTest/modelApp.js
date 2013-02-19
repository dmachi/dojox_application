require(["dojo/_base/window","dojox/app/main", "dojox/json/ref", "dojo/text!./config.json", "dojox/app/utils/config", "dojo/sniff"],
function(win, Application, jsonRef, config, configUtil, has){
	originalConfig = jsonRef.fromJson(config);
	var isTablet = false;
	if(window.innerWidth > 600){
			isTablet = true;
	}

	has.add("testTrue", true);
	has.add("tablet", isTablet);
	has.add("phone", !isTablet);
	has.add("notIE", !has("ie"));
						
	// using originalConfig here because main.js will automatically process the has
	app = Application(originalConfig);
});
