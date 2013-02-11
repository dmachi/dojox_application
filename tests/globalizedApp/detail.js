define(["dojo/dom"], function(dom){
	return {
		beforeActivate: function(view, data){
			dom.byId("label").innerHTML = this.nls[view.name]+(data?("-"+data):"");

		}
	}
})