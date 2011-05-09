var path = window.location.pathname;
if (path.charAt(path.length)!="/"){
	path = path.split("/");
	path.pop();
	path=path.join("/");	
}
dojo.registerModulePath("app",path);

require(["dojo","dojox/app/main", "dojo/text!app/config.json","dojo/json"],function(dojo,Application,config,ref){
	//app = Application(dojox.json.ref.resolveJson(config), dojo.body());
	app = Application(dojo.fromJson(config));
});
