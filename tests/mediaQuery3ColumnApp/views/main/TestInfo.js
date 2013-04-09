define(["dojo/_base/lang", "dojo/dom-class"],
function(lang, domClass){
	var _onResults = []; // events on array

	return {
		// view init
		init: function(){
			console.log("in init for view with this.name = "+this.name);

			// handle the backButton click
			var onResult = this.testheaderBackButton.on("click", lang.hitch(this, function(e){
				this.app.emit("MQ3ColApp/BackFromTest", e);
			})); 
			_onResults.push(onResult);
			 
			// This code will setup the classes for the backButton
			domClass.add(this.testheaderBackButton.domNode, "showOnSmall hideOnMedium hideOnLarge");
		},


		afterDeactivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			//
		},

		// view destroy
		destroy: function(){
			var onResult = _onResults.pop();
			while(onResult){
				onResult.remove();
				onResult = _onResults.pop();
			}
		}
	}
});
