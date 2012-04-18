define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc/at", "dojox/mvc/Group"],
	function(dom, connect, registry, at, Group){
	window.at = at;
	dojox.debugDataBinding = false;
	return {
		init: function(){
			var currentModel = this.loadedModels.names;

			function setRef(id, attr){
				require(["dijit/registry", "dojox/mvc/at"], function(registry, at){
					var widget = registry.byId(id);
					widget.set("target", at("rel:", attr));
					console.log("setRef done. " + attr);
				});
			};

			this.shiptoConn = connect.connect(dom.byId('shipto'), "click", function(){
				setRef('addrGroup', 'ShipTo');
			});
			this.billtoConn = connect.connect(dom.byId('billto'), "click", function(){
				setRef('addrGroup', 'BillTo');
			});

			this.resetConn = connect.connect(dom.byId('reset1'), "click", function(){
				currentModel.reset();
				console.log("reset done. ");
			});

			console.log("simple view init ok");
		},

		distory: function(){
			if(this.shiptoConn){
				connect.disconnect(this.shiptoConn);
			}
			if(this.billtoConn){
				connect.disconnect(this.billtoConn);
			}
			if(this.resetConn){
				connect.disconnect(this.resetConn);
			}
		}
	}
});
