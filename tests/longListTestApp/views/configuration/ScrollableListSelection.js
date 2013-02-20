define(["dojo/dom", "dojo/_base/lang", "dojo/dom-style", "dijit/registry"],
	function(dom, lang, domStyle, registry){

		var wrapperId = 'cfg1Wrapper';
		var app = null;

	return {
		init: function(){
			app = this.app;
		},
		
		beforeActivate: function(){
			app.stopTransition = false;
		},
		
		afterActivate: function(){
		},
		
		beforeDeactivate: function(){
		},

		afterDeactivate: function(){
		},

		destroy: function(){
		}
	}
});
