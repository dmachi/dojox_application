define(["dojo/_base/lang", "dojo/_base/declare", "customApp/DtlView", "dojox/app/controllers/Load"],
	function(lang, declare, DtlView, Load){
		return declare("dojox.app.DtlLoad", Load, {
			createView: function(parent, id, name, mixin, params){
				return new DtlView(lang.mixin({
					"app": this.app,
					"id": id,
					"name": name,
					"parent": parent
				}, {"params": params }, mixin));
			}
		});
	}
);