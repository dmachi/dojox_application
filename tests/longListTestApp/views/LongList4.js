define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect","dijit/registry"],
function(dom, domStyle, connect, registry){
		var _connectResults = []; // events connect result
		var	list = null;
		var listId = 'list4';
		var backId = 'sc4back1';
		var insert10Id = 'sc4insert10x';
		var app = null;
	return {
		init: function(){
			app = this.app;
			
			var connectResult;
			connectResult = connect.connect(dom.byId(insert10Id), "click", function(){
				//Add 5 items to the end of the model
				loadMore();
			});
		},


		beforeActivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			if(dom.byId(backId) && this.app.isTablet){ 
				domStyle.set(dom.byId(backId), "visibility", "hidden"); // hide the back button in tablet mode
			}
			
			app.list4 = registry.byId(listId);

			list = app.list4;
			if(!list.store){
				list.setStore(app.stores.longlistStore.store);
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
	}
});
