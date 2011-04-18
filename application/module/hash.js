define(["dojo","dijit","dojox","dojo/hash"],function(dojo,dijit,dojox,hash){
	return dojo.declare(null, {
		postCreate: function(params,node){
			this.currentHash=dojo.hash();
			dojo.subscribe("/dojo/hashchange", dojo.hitch(this, "onHashChange"));
			dojo.connect(history, "onpopstate", function(){
				console.log("popstate", arguments);
			});
			this.inherited(arguments);
		},
		startup: function(){
			if (this.currentHash){
				var parts = this.currentHash.split("@");
				if (parts[1]){this._defaultScene=parts[1]};
			}

			history.replaceState(dojo.mixin(history.state||{},{position: window.history.length}));
			this.inherited(arguments);
		},

		onHashChange: function(newhash){
			console.log('onHashChange: ',newhash);
			var state = history.state;
			console.log("state: ", history.state);
			this.transition(newhash, {rev: (history.state)?(history.state.position<history.length):false});
			this.currentHash=newhash;
			this.historyLength = history.length;
		}
	});	
});
