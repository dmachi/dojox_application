define(["doh", "dojox/app/main", "dojox/json/ref", "dojo/text!./config.json", "dojo/topic"],
	function(doh, Application, json, config, topic){
	doh.register("dojox.app.tests.doh.controllers", [
		{
			timeout: 2000,
			runTest: function(t){
				console.log("start");
				var dohDeferred = new doh.Deferred();
				// stack events that are pushed
				var events = [];
				dohDeferred.addCallback(function(){
					t.assertEqual([1, 2], events);
				});
				this._topic = topic.subscribe("/app/status", function(evt){
					events.push(evt);
					if(evt == 2){
						// testApp needs to be available at this point
						console.log(testApp.controllers.length);
						t.assertEqual(2, testApp.controllers.length);
						dohDeferred.callback(true);
					}
				});
				Application(json.fromJson(config));
				return dohDeferred;
			},
			tearDown: function(){
				this._topic.remove();
			}
		}
	]);
});
