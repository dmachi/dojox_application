define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect"], function(dom, domStyle, connect){
	var _connectResults = []; // events connect result

	return {
		// view init
		init: function(){
		},
		
		beforeActivate: function(view){
			// summary:
			//		view life cycle beforeActivate()
			//
			this.previousView = view;
			
			// setup code to watch for the navigation pane being visible
			
		},

		beforeDeactivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			//
		},
		
		// view destroy
		destroy: function(){
			var connectResult = _connectResults.pop();
			while(connectResult){
				connect.disconnect(connectResult);
				connectResult = _connectResults.pop();
			}
		}
	};
});
