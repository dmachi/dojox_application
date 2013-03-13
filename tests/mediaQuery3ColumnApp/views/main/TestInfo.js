define(["dojo/_base/lang", "dojo/dom-class", "dojo/_base/connect"],
function(lang, domClass, connect){
	var _connectResults = []; // events connect result
	var previousView = null;

	return {
		// view init
		init: function(){
			console.log("in init for view with this.name = "+this.name);

			// handle the backButton onclick
			connectResult = connect.connect(this.testheaderBackButton, "onclick", lang.hitch(this, function(e){
				this.app.emit("MQ3ColApp/BackFromTest", e);
			}));
			_connectResults.push(connectResult);
			 
			// This code will setup the classes for the backButton
			domClass.add(this.testheaderBackButton, "showOnSmall hideOnMedium hideOnLarge");
		},


		afterDeactivate: function(){
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
	}
});
