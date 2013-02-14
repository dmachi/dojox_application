require(["dojo/_base/window","dojox/app/main", "dojox/json/ref", "dojo/text!./config.json", "dojox/app/utils/configUtils", "dojo/sniff"],
function(win, Application, jsonRef, config, configUtils, has){
	originalConfig = jsonRef.fromJson(config);
	var isTablet = false;
	if(window.innerWidth > 600){
			isTablet = true;
	}

	var hasList = {};
	hasList["testTrue"] = true;
	hasList["tablet"] = isTablet;
	hasList["phone"] = !isTablet;
	hasList["notIE"] = !has("ie");
						
	config = configUtils.configProcessHas(originalConfig, hasList);
	
	app = Application(config);
});
