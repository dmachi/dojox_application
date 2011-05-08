var path = window.location.pathname;
if (path.charAt(path.length)!="/"){
	path = path.split("/");
	path.pop();
	path=path.join("/");	
}
dojo.registerModulePath("app",path);

dojo.provide("modelApp");
modelApp.names = [{
        "Serial" : "360324",
        "First"  : "John",
        "Last"   : "Doe",
        "Email"  : "jdoe@us.ibm.com",
        "ShipTo" : {
            "Street" : "123 Valley Rd",
            "City"   : "Katonah",
            "State"  : "NY",
            "Zip"    : "10536"
        },
        "BillTo" : {
            "Street" : "17 Skyline Dr",
            "City"   : "Hawthorne",
            "State"  : "NY",
            "Zip"    : "10532"
        }
    }];

require(["dojo","dojox/application/main", "dojo/text!app/config.json","dojox/json/ref"],function(dojo,Application,config,ref){
	//app = Application(dojox.json.ref.resolveJson(config), dojo.body());
	app = Application(dojox.json.ref.fromJson(config));
});
