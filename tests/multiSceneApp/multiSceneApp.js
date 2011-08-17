require(["dojo/_base/kernel", "dojo/_base/loader"], function(dojo){
    var path = window.location.pathname;
    if (path.charAt(path.length)!="/"){
    	path = path.split("/");
    	path.pop();
    	path=path.join("/");	
    }

    dojo.registerModulePath("app",path);
    console.log('before require', path);
    require(["dojo/_base/html","dojox/app/main", "dojo/text!app/config.json"],function(dojo,Application,config){
    	//app = Application(dojox.json.ref.resolveJson(config), dojo.body());
    	//app = Application(json.parse(config));
    	app = Application(eval("(" + config + ")"));
    });
});