define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc/at", "dojox/mvc/Repeat", "dojox/mvc/getStateful", "dojox/mvc/Output"],
function(dom, connect, registry, at, Repeat, getStateful, Output){
	window.at = at;
	dojox.debugDataBinding = false;

	selectedIndex = 0;
	repeatmodel = null;

	deleteResult = function(index){
		var nextIndex = repeatmodel.get("cursorIndex");
		if(nextIndex >= index){
			nextIndex = nextIndex-1;
		}
		repeatmodel.model.splice(index, 1);
		repeatmodel.set("cursorIndex", nextIndex);		
	};

	setDetailsContext = function(index){
		repeatmodel.set("cursorIndex", index);
	};

	// used in the Repeat Data binding demo
	insertResult = function(index){
		var data = {id:Math.random(), "First": "", "Last": "", "Location": "CA", "Office": "", "Email": "",
				"Tel": "", "Fax": ""};
		repeatmodel.model.push(new getStateful(data));
		setDetailsContext(repeatmodel.model.length-1);
	};

	return {
		init: function(){
			repeatmodel = this.loadedModels.repeatmodels;
		}
	}
});
