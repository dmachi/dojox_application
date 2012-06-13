define(["dojo/dom", "dojo/_base/connect", "dijit/registry", "dojox/mvc/at", "dojox/mvc/getStateful", "dojox/mvc/Output"],
function(dom, connect, registry, at, getStateful, Output){
	var _connectResults = []; // events connect result

	var repeatmodel = null;	//repeat view data model

	// show an item detail
	var setDetailsContext = function(index){
		if(parseInt(index) < repeatmodel.model.length){
			repeatmodel.set("cursorIndex", index);
		}
	};

	// get index from dom node id
	var getIndexFromId = function(nodeId, perfix){
		var len = perfix.length;
		if(nodeId.length <= len){
			throw Error("repeate node id error.");
		}
		var index = nodeId.substring(len, nodeId.length);
		return parseInt(index);
	};

	return {
		// repeate view init
		init: function(){
			repeatmodel = this.loadedModels.repeatmodels;

			// if this.parameters["cursor"] is set use it to set the selected Details Context
			if(this.parameters["cursor"]){
				setDetailsContext(this.parameters["cursor"]);
			}

			var repeatDom = dom.byId('repeatWidget');
			var connectResult;
			connectResult = connect.connect(repeatDom, "button[id^=\"detail\"]:click", function(e){
				var index = getIndexFromId(e.target.id, "detail");
				setDetailsContext(index);
			});
			_connectResults.push(connectResult);
		},
		// repeate view destroy
		destroy: function(){
			var connectResult = _connectResults.pop();
			while(connectResult){
				connect.disconnect(connectResult);
				connectResult = _connectResults.pop();
			}
		}
	}
});
