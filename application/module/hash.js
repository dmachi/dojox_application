define(["dojo","dijit","dojox","dojo/hash"],function(dojo,dijit,dojox,hash){
	return dojo.declare(null, {
		postCreate: function(params,node){
			this.currentHash=dojo.hash();
			dojo.subscribe("/dojo/hashchange", dojo.hitch(this, "onHashChange"));
			this.inherited(arguments);
		},
		onHashChange: function(newhash){
			console.log('onHashChange: ',newhash);	
			this.transition(newhash);
			this.currentHash=newhash;
		}
	});	
});
