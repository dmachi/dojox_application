define(["dojo/_base/lang", "dojo/on", "dijit/registry"], 
function(lang, on, registry){
	var _onResults = []; // events on array

	var opener, updateDate, showDatePicker, onShow, onHide, datePicker2;
	onShow = function(){
			// console.log("Set datePicker to current date: ", date.toISOString());
			datePicker2.set("value", date.toISOString());
		};
	onHide = function(node, v){
			if(v){
				var newDate = datePicker2.get("value");
				// console.log("newDate: ", newDate);
				node.value = newDate;
				// set new Date
				date = new Date(newDate);
			}
	};
		

	return {
		init: function(){
			opener = this.opener;
			onResult = on(this.selDate1, "click", lang.hitch(this, function(e){
				this.datePicker2.set("value", date.toISOString());
				this.opener.show(this.selDate1, ['below-centered','above-centered','after','before']);
			})); 
			_onResults.push(onResult);

			onResult = on(this.save, "click", lang.hitch(this, function(e){
				this.opener.hide(true);
				var newDate = this.datePicker2.get("value");
				this.selDate1.value = newDate;
				date = new Date(newDate);
			})); 
			_onResults.push(onResult);

			onResult = on(this.cancel, "click", lang.hitch(this, function(e){
					this.opener.hide(false);
			})); 
			_onResults.push(onResult);
			
			datePicker2 = registry.byId("datePicker2");
			// initialize the globale Date variable as today
			date = new Date();
			// console.log("Initial date is: ", date.toISOString());
			
		},

		beforeActivate: function(){
			//console.log("date view beforeActivate()");
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
