define(["doh", "dojox/app/main", "dojox/json/ref", "dojo/text!./config.json", "dojo/_base/connect"],
	function(doh, Application, json, config, connect){
	doh.register("dojox.app.tests.doh.config", [
		function testConfig(t){
			var dohDeferred = new doh.Deferred();
			Application(json.fromJson(config));
			connect.subscribe("/app/status", dohDeferred.getTestCallback(function(evt){
				if(evt == 2){
					console.log(testAppp);
					t.assertNotNull(testApp);
				}
			}));
			return dohDeferred;
		}
	]);
});
