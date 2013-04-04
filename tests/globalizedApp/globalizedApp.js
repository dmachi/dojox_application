require(["dojox/app/main", "dojox/json/ref", "dojo/text!./config.json"],
function(Application, jsonRef, config){
	var cfg = jsonRef.fromJson(config);
	Application(cfg);
});
