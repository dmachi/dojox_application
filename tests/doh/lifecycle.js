define(["doh", "dojox/app/main", "dojox/json/ref", "dojo/text!./config.json", "dojo/topic"],
	function(doh, Application, json, config, topic){
	doh.register("dojox.app.tests.doh.lifecycle", [
		{
			timeout: 2000,
			name: "lifecyle",
			runTest: function(t){
				var dohDeferred = new doh.Deferred();
				// stack events that are pushed
				var events = [];
				dohDeferred.addCallback(function(){
					t.assertEqual([1, 2], events);
				});
				topic.subscribe("/app/status", function(evt){
					events.push(evt);
					if(evt == 2){
						// testApp needs to be available at this point
						t.assertNotEqual(null, testApp);
						dohDeferred.callback(true);
					}
				});
				Application(json.fromJson(config));
				return dohDeferred;
			}
		}
	]);
});
