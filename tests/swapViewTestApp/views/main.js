define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc/at"],
function(dom, connect, registry, at){
	var _connectResults = []; // events connect results
	var currentModel = null;

	var setRef = function (id, attr){
		var widget = registry.byId(id);
		widget.set("target", at("rel:", attr));
		console.log("setRef done.");
	};
	return {
		// main view init
		init: function(){
		},
		
		beforeActivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			//
			currentModel = this.loadedModels.names;
			var connectResult;

			connectResult = connect.connect(dom.byId('shipto'), "click", function(){
				setRef('addrGroup', 'ShipTo');
			});
			_connectResults.push(connectResult);

			connectResult = connect.connect(dom.byId('billto'), "click", function(){
				setRef('addrGroup', 'BillTo');
			});
			_connectResults.push(connectResult);

			connectResult = connect.connect(dom.byId('reset1'), "click", function(){
				currentModel.reset();
				console.log("reset done. ");
			});
			_connectResults.push(connectResult);
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
		

		// main view destroy
		destroy: function(){
			var connectResult = _connectResults.pop();
			while(connectResult){
				connect.disconnect(connectResult);
				connectResult = _connectResults.pop();
			}
		}
	};
});
