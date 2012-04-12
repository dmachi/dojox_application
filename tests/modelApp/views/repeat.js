define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc/at", "dojox/mvc/Repeat", "dojox/mvc/getStateful", "dojox/mvc/Output"],
function(dom, connect, registry, at, Repeat, getStateful, Output){
	selectedIndex = 0;
	repeatmodel = null;

	deleteResult = function(index){
		repeatmodel.remove(index);
		repeatmodel.commit();
	};

	setDetailsContext = function(index){
		var widget = dijit.byId("detailsGroup");
		widget.set("ref", index);
		selectedIndex = index;
	};

	// used in the Repeat Data binding demo
	insertResult = function(index){
		index = parseInt(index) + 1;
		if(index >= repeatmodel.length || repeatmodel[index].First.value !== ""){
			var insert = dojox.mvc.newStatefulModel({
				"data": {
					"First": "",
					"Last": "",
					"Location": "CA",
					"Office": "",
					"Email": "",
					"Tel": "",
					"Fax": ""
				}
			});
			repeatmodel.add(index, insert);
			repeatmodel.commit();
			setDetailsContext(index);
		}
	};

	return {
		init: function(){
			repeatmodel = this.loadedModels.repeatmodels;
		}
	}
});
