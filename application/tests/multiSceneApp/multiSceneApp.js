require(["dojo","dojox/application/main", "dojo/text!app/config.json","dojo/json"],function(dojo,Application,config,ref){
	//app = Application(dojox.json.ref.resolveJson(config), dojo.body());
	app = Application(dojo.fromJson(config), dojo.byId("app"));
});
