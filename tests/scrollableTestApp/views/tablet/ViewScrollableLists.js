define(["dojo/_base/lang", "dijit/registry", "dojox/mobile/TransitionEvent"],
function(lang, registry, TransitionEvent){
	this.app.stopTransition = false;

	selectItems = function(node, index){
		//if(this.app.selected_configuration_item == index){
		//	return;
		//}
		this.app.selected_configuration_item = index;

	};
	return {
		init: function(){
			console.log("navigation view init ok");
		}
	};
});
