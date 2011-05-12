define(["dojo","dijit","dojox","dojo/hash","dojo/listen"],function(dojo,dijit,dojox,hash,listen){
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
				this._defaultView=this.currentHash;
			}
			listen(this.domNode, "startTransition", dojo.hitch(this, "onStartTransition"));

			history.replaceState(dojo.mixin(history.state||{},{position: window.history.length}));
			this.inherited(arguments);
		},
		onStartTransition: function(evt){
			if (!evt || !evt.detail || !evt.detailhref){return;}
			evt.preventDefault();
			dojo.hash(evt.detail.href);
			
		},

		onHashChange: function(newhash){
			console.log('onHashChange: ',newhash);
			var state = history.state;
			console.log("state: ", history.state);
			dojo.when(this.transition(newhash, {rev: (history.state)?(history.state.position<history.length):false}), dojo.hitch(this, function(){
				this.currentHash=newhash;
				this.historyLength = history.length;
			}))
	
		}
	});	
});
