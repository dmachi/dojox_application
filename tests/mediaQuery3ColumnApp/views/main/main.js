define(["dojo/_base/lang", "dojo/dom-class", "dojo/_base/connect"],
function(lang, domClass, connect){
	var _connectResults = []; // events connect result
	var previousView = null;

	return {
		// view init
		init: function(){
			console.log("in init for view with this.name = "+this.name);

			// handle the backButton onclick
			connectResult = connect.connect(this.mainheaderBackButton, "onclick", lang.hitch(this, function(e){
				this.app.emit("MQ3ColApp/BackFromMain", e);
			})); 
			_connectResults.push(connectResult);

			// This code will setup the view to work in the left or center depending upon the view name
			if(this.name == "mainLeft"){
				this.mainOuterContainer["data-app-constraint"] = "left";
				domClass.add(this.mainheaderBackButton, "showOnMedium");
				domClass.add(this.mainOuterContainer, "left");
				domClass.add(this.mainOuterDiv, "navPane hideOnSmall");  // for main on left
			}else{
				this.mainOuterContainer["data-app-constraint"] = "center";				
				domClass.add(this.mainheaderBackButton, "showOnSmall hideOnMedium hideOnLarge");
				domClass.add(this.mainOuterContainer, "center");
			}


		},
		
		beforeActivate: function(previousView, data){
			// summary:
			//		view life cycle beforeActivate()
			//
			this.previousView = previousView;
			
			// Set the selection from the params
			if(this.params["mainSel"]){ 
				this.mainH2.set("label",this.params["mainSel"]+" selected");
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
