define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc/at", "dojox/mvc/getStateful", "dojox/mvc/Output"],
function(dom, connect, registry, at, getStateful, Output){
	var _connectResults = []; // events connect result

	var repeatStore = null;	//repeat view data model
	var currentItem = null;

	return {
	// show an item detail
	setDetailsContext: function(index){
		// only set the cursor if it is different and valid
		if(parseInt(index) < repeatStore.data.length){
			currentItem = repeatStore.data[index];
			//repeatmodel.set("cursorIndex", parseInt(index));
			this.First.set("value",currentItem.First);
			this.Last.set("value",currentItem.Last);
			this.Email.set("value",currentItem.Email);
			this.Tel.set("value",currentItem.Tel);
		}
	},

	// get index from dom node id
	getIndexFromId: function(nodeId, perfix){
		var len = perfix.length;
		if(nodeId.length <= len){
			throw Error("repeate node id error.");
		}
		var index = nodeId.substring(len, nodeId.length);
		return parseInt(index);
	},


		// repeat view init
		init: function(){
			repeatStore = this.app.stores.repeatStore.store;
		},

		beforeActivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			//
			// if this.params["cursor"] is set use it to set the selected Details Context
			if(this.params["cursor"]){
				this.setDetailsContext(this.params["cursor"]);
			}
		},

		beforeDeactivate: function(){
			// summary:
			//		view life cycle beforeDeactivate()
			//
			// put any updates back to the store
			currentItem.label = this.First.get("value")+ " "+this.Last.get("value");;
			currentItem.First = this.First.get("value");
			currentItem.Last = this.Last.get("value");
			currentItem.Email = this.Email.get("value");
			currentItem.Tel = this.Tel.get("value");
			repeatStore.put(currentItem);
		}
	}
});
