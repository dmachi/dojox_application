define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect","dijit/registry"],
function(dom, domStyle, connect, registry){
		var _connectResults = []; // events connect result
		var	list = null;
		var listId = 'list';
		var app = null;
	return {
		init: function(){
			app = this.app;
		},


		beforeActivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			app.list1 = registry.byId(listId);

			list = app.list1;
			if(!list.Store){
				list.setStore(app.stores.longlistStore.store);
			}

			if(registry.byId("heading1")){
				registry.byId("heading1").labelDivNode.innerHTML = "Long List One";
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
