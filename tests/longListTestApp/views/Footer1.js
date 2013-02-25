define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dojo/store/Memory", "dojo/store/Observable"],
function(dom, domStyle, connect, Memory, Observable){
		var app = null;
	return {
		init: function(){
			app = this.app;
		},


		beforeActivate: function(){
			// summary:
			//		view life cycle beforeActivate()
		},

		afterActivate: function(){
			// summary:
			//		view life cycle afterActivate()
		},
				
		destroy: function(){
		}
	}
});
