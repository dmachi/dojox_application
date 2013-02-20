define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dijit/registry", "dojox/mvc/at", "dojox/mobile/TransitionEvent", 
	"dojo/Stateful", "dojox/mvc/parserExtension", "dojox/mvc/sync"],
function(dom, domStyle, connect, registry, at, TransitionEvent, Stateful, parserExtension, sync){
	var _connectResults = []; // events connect result
	var previousView = null;

	navShowingStateful = new Stateful({value: false});

	return {
		// view init
		init: function(){
		},
		
		beforeActivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			//
			currentModel = this.loadedModels.names;
			var connectResult;
		/*	
			var backButtomDom = dom.byId('headerBackButton');
			connectResult = connect.connect(backButtomDom, "onclick", function(e){
				// transition to repeatDetails view with the &cursor=index
				
				var transOpts = {
					title:'main+TestInfo+simple+repeatList+navigation+header',
					target:'main+TestInfo+simple+repeatList+navigation+header',
					url:'#main+TestInfo+simple+repeatList+navigation+header'					
				};
				new TransitionEvent(e.target, transOpts, e).dispatch(); 

			});
		*/	
			
		},


		afterDeactivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			//
			var connectResult = _connectResults.pop();
			while(connectResult){
				connect.disconnect(connectResult);
				connectResult = _connectResults.pop();
			}
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
