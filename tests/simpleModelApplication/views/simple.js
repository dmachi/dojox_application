define(["dojo/_base/lang", "dojo/dom", "dojo/_base/connect", "dijit/registry"], 
	function(lang, dom, connect, registry){
	return {
		init: function(){

			connect.connect(dom.byId('reset1'), "click", lang.hitch(this, function(){
				console.log("reset called. ");
				this.setFromModel();
				console.log("reset done. ");
			}));

			connect.connect(dom.byId('save1'), "click", lang.hitch(this, function(){
				this.saveToModel();
			}));

			connect.connect(dom.byId('shipto'), "click", lang.hitch(this, function(){
				console.log("shipTo called. ");
				dom.byId("billtodiv").style.display = "none";
				dom.byId("shiptodiv").style.display = "";
				//this.saveToModel();
			}));

			connect.connect(dom.byId('billto'), "click", lang.hitch(this, function(){
				console.log("billTo called. ");
				dom.byId("billtodiv").style.display = "";
				dom.byId("shiptodiv").style.display = "none";
				//this.saveToModel();
			}));

			dom.byId("billtodiv").style.display = "none";
			this.setFromModel();
		},

		setFromModel: function(){
			registry.byId("firstInput1").set('value', this.loadedModels.names[0].First);
			registry.byId("lastInput1").set('value', this.loadedModels.names[0].Last);
			registry.byId("emailInput1").set('value', this.loadedModels.names[0].Email);
			registry.byId("shiptostreetInput1").set('value', this.loadedModels.names[0].ShipTo.Street);
			registry.byId("shiptocityInput1").set('value', this.loadedModels.names[0].ShipTo.City);
			registry.byId("shiptostateInput1").set('value', this.loadedModels.names[0].ShipTo.State);
			registry.byId("shiptozipInput1").set('value', this.loadedModels.names[0].ShipTo.Zip);
			registry.byId("billtostreetInput1").set('value', this.loadedModels.names[0].BillTo.Street);
			registry.byId("billtocityInput1").set('value', this.loadedModels.names[0].BillTo.City);
			registry.byId("billtostateInput1").set('value', this.loadedModels.names[0].BillTo.State);
			registry.byId("billtozipInput1").set('value', this.loadedModels.names[0].BillTo.Zip);
		},

		saveToModel: function(){
			this.loadedModels.names[0].First = registry.byId("firstInput1").get('value');
			this.loadedModels.names[0].Last = registry.byId("lastInput1").get('value');
			this.loadedModels.names[0].Email = registry.byId("emailInput1").get('value');
			this.loadedModels.names[0].ShipTo.Street = registry.byId("shiptostreetInput1").get('value');
			this.loadedModels.names[0].ShipTo.City = registry.byId("shiptocityInput1").get('value');
			this.loadedModels.names[0].ShipTo.State = registry.byId("shiptostateInput1").get('value');
			this.loadedModels.names[0].ShipTo.Zip = registry.byId("shiptozipInput1").get('value');
			this.loadedModels.names[0].BillTo.Street = registry.byId("billtostreetInput1").get('value');
			this.loadedModels.names[0].BillTo.City = registry.byId("billtocityInput1").get('value');
			this.loadedModels.names[0].BillTo.State = registry.byId("billtostateInput1").get('value');
			this.loadedModels.names[0].BillTo.Zip = registry.byId("billtozipInput1").get('value');
		}
	}
});
