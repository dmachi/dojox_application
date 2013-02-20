define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mvc/at", "dojox/mobile/TransitionEvent", 
	"dojo/Stateful", "dojox/mvc/parserExtension", "dojox/mvc/sync"],
function(dom, domStyle, connect, registry, at, TransitionEvent, Stateful, parserExtension, sync){
	var _connectResults = []; // events connect result
	var previousView = null;

	navShowingStateful = new Stateful({value: false});

	return {
		// view init
		init: function(){
/*				var navDisplayConverter = {
					format: function(value){
						if(value){
							console.log(value);
						}
						return value;
					}
				};
				
				var navWid = registry.byId("NavWidId");
				if(navWid){
					sync(navWid, "display", navShowingStateful, "value",  {
						bindDirection: sync.from,
						converter: navDisplayConverter
					});			
				}
*/				
		},
		
		beforeActivate: function(view, data){
			// summary:
			//		view life cycle beforeActivate()
			//
			this.previousView = view;
			var backButtomDom = dom.byId('headerBackButton');
			domStyle.set(backButtomDom, "display", "none");
			
			// setup code to watch for the navigation pane being visible
			
		},

		beforeDeactivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			//
			var backButtomDom = dom.byId('headerBackButton');
			domStyle.set(backButtomDom, "display", "block");
		},
		
		// repeat view destroy
		destroy: function(){
			var connectResult = _connectResults.pop();
			while(connectResult){
				connect.disconnect(connectResult);
				connectResult = _connectResults.pop();
			}
		}
	}
});
