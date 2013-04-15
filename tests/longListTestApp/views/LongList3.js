define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect","dijit/registry"],
function(dom, domStyle, connect, registry){

		var _connectResults = []; // events connect result
		var	list = null;
		var listId = 'list3';
		var app = null;
	return {
		init: function(){
			app = this.app;
		},


		beforeActivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			// description:
			//		beforeActivate will save the list is app and set the store on the list
			app.list3 = registry.byId(listId);
			list = app.list3;
			if(!list.store){
				list.setStore(app.stores.longlistStore.store);
			}

			if(registry.byId("heading1")){
				registry.byId("heading1").labelDivNode.innerHTML = "Long List Three";
			}
			if(dom.byId("tab1WrapperA")){ 
				domStyle.set(dom.byId("tab1WrapperA"), "visibility", "visible");  // show the nav view if it being used
				domStyle.set(dom.byId("tab1WrapperB"), "visibility", "visible");  // show the nav view if it being used
			}
		},

		destroy: function(){
			var connectResult = _connectResults.pop();
			while(connectResult){
				connect.disconnect(connectResult);
				connectResult = _connectResults.pop();
			}
		}
	};
});
