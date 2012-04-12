define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc"], function(dom, connect, registry, mvc){
	genmodel = null;
	updateView = function(){
		try{
			var modeldata = dojo.fromJson(dom.byId("modelArea").value);
			genmodel = mvc.newStatefulModel({
				data: modeldata
			});
			registry.byId("view").set("ref", genmodel);
			dom.byId("outerModelArea").style.display = "none";
			dom.byId("viewArea").style.display = "";
		}catch(err){
			console.error("Error parsing json from model: " + err);
		}
	};

	// used in the Generate View demo
	updateModel = function(){
		dom.byId("modelArea").focus(); // hack: do this to force focus off of the textbox, bug on mobile?
		dom.byId("viewArea").style.display = "none";
		dom.byId("outerModelArea").style.display = "";
		registry.byId("modelArea").set("value", (dojo.toJson(genmodel.toPlainObject(), true)));
	};

	return {
		init: function(){
			console.log("generate view init ok");
		},

		beforeActivate: function(){
			console.log("generate view beforeActivate()");
		}
	}
});
