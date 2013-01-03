require(["dojox/app/main", "dojox/json/ref", "dojo/text!./config.json"],
function(Application, jsonRef, config){
	var config = jsonRef.fromJson(config);
	Application(config);
});
