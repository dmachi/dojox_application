require(["dojox/app/main","dojox/app/utils/configUtils",  "dojox/json/ref", "dojo/sniff"],
	function(Application, configUtils, json, has){
	var isTablet = false;
	var configurationFile = "./config.json";
	if(window.innerWidth > 600){
		isTablet = true;
	}
	require(["dojo/text!"+configurationFile], function(configJson){
		var hasList = {};
		hasList["tablet"] = isTablet;
		hasList["phone"] = !isTablet;
		hasList["ie9orLess"] = has("ie") && !has("ie") >= 10;
		hasList["notie9orLess"] = !has("ie") || has("ie") >= 10;
		var config = json.fromJson(configJson);
		config = configUtils.configProcessHas(config,hasList);
		console.log("back from configProcessHas with config = ",config);
		Application(config);
	});

});
