define(["dojo/_base/lang", "dojo/dom", "dojo/dom-class", "dojo/_base/connect", "dijit/registry", "dojox/mvc/at", "dojox/mobile/TransitionEvent", 
	"dojo/Stateful", "dojox/mvc/parserExtension", "dojox/mvc/sync"],
function(lang, dom, domClass, connect, registry, at, TransitionEvent, Stateful, parserExtension, sync){
	var _connectResults = []; // events connect result
	var previousView = null;

	return {
		// view init
		init: function(){
			console.log("in init for view with this.name = "+this.name);

			// handle the backButton onclick
			connectResult = connect.connect(this.lastheaderBackButton, "onclick", lang.hitch(this, function(e){
				this.app.emit("MQ3ColApp/BackFromLast", e);
			})); 
			_connectResults.push(connectResult);

			// This code will setup the view to work in the center or the right depending upon the viewName
			if(this.name == "lastCenter"){
				this.lastOuterContainer["data-app-constraint"] = "center";
				domClass.add(this.lastheaderBackButton, "hideOnMedium hideOnLarge showOnSmall");
				domClass.add(this.lastOuterContainer, "center");
			}else{
				this.lastOuterContainer["data-app-constraint"] = "right";				
				domClass.add(this.lastheaderBackButton, "showOnSmall hideOnMedium hideOnLarge");
				domClass.add(this.lastOuterDiv, "navPane hideOnMedium");
				domClass.add(this.lastOuterContainer, "hideOnMedium right");
			}


		},
		
		beforeActivate: function(previousView, data){
			// summary:
			//		view life cycle beforeActivate()
			//
			this.previousView = previousView;

			// Set the selection from the params
			if(this.params["lastSel"]){ 
				this.lastH2.set("label",this.params["lastSel"]+" selected");
			}
		},

		beforeDeactivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			//
		},

		lastOption1Clicked: function(/*Event*/ e){
			this.app.emit("MQ3ColApp/LastOption1", e);
		},

		lastOption2Clicked: function(/*Event*/ e){
			this.app.emit("MQ3ColApp/LastOption2", e);
		},

		lastOption3Clicked: function(/*Event*/ e){
			this.app.emit("MQ3ColApp/LastOption3", e);
		},

		// view destroy
		destroy: function(){
			var connectResult = _connectResults.pop();
			while(connectResult){
				connect.disconnect(connectResult);
				connectResult = _connectResults.pop();
			}
		}
	}
});
