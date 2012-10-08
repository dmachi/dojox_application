define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dojo/_base/lang", "dijit/registry", "dojox/mvc/at", "dojox/mobile/TransitionEvent", "dojox/mvc/Repeat", "dojox/mvc/getStateful", "dojox/mvc/Output"],
function(dom, domStyle, connect, lang, registry, at, TransitionEvent, Repeat, getStateful, Output){
	var _connectResults = []; // events connect result

	var repeatmodel = null;	//repeat view data model

	// delete an item
	deleteResult = function(index){
		var nextIndex = repeatmodel.get("cursorIndex");
		if(nextIndex >= index){
			nextIndex = nextIndex-1;
		}
		repeatmodel.model.splice(index, 1);
		repeatmodel.set("cursorIndex", nextIndex);		
	};
	// show an item detail
	setDetailsContext = function(index){
		repeatmodel.set("cursorId", index);
	};

	// insert an item
	var insertResult = function(index){
		if(index<0 || index>repeatmodel.model.length){
			throw Error("index out of data model.");
		}
		if((repeatmodel.model[index].First=="") ||
			(repeatmodel.model[index+1] && (repeatmodel.model[index+1].First == ""))){
			return;
		}
		var data = {id:Math.random(), "First": "", "Last": "", "Location": "CA", "Office": "", "Email": "", "Tel": "", "Fax": ""};
		repeatmodel.model.splice(index+1, 0, new getStateful(data));
		setDetailsContext(index+1);
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
		//	var repeatDom = dom.byId('repeatWidget');
			var connectResult;

			connectResult = connect.connect(dom.byId('insert3x'), "click", function(){
				insertResult(repeatmodel.model.length-1);
			});
			_connectResults.push(connectResult);

			connectResult = connect.connect(dom.byId('insert10x3'), "click", function(){
				//Add 10 items to the end of the model
				app.showProgressIndicator(true);
				setTimeout(lang.hitch(this,function(){
					maxentries = repeatmodel.model.length+10;
					for(i = repeatmodel.model.length; i < maxentries; i++){
						var data = {id:Math.random(), "First": "First"+repeatmodel.model.length, "Last": "Last"+repeatmodel.model.length, "Location": "CA", "Office": "", "Email": "", "Tel": "", "Fax": ""};
						repeatmodel.model.splice(repeatmodel.model.length, 0, new getStateful(data));					
					}
					app.showProgressIndicator(false);
				}), 100);				
				
			});
			_connectResults.push(connectResult);

			connectResult = connect.connect(dom.byId('remove10x3'), "click", function(){
				//remove 10 items to the end of the model
				app.showProgressIndicator(true);
				setTimeout(lang.hitch(this,function(){				
					maxentries = repeatmodel.model.length-10;
					for(i = repeatmodel.model.length; i > maxentries; i--){
						repeatmodel.model.splice(i, 1);
					}
					repeatmodel.set("cursorIndex", 0);		
					app.showProgressIndicator(false);
				}), 100);				
			});
			_connectResults.push(connectResult);

			if(dom.byId("back3") && this.app.isTablet){ 
				domStyle.set(dom.byId("back3"), "display", "none"); // hide the back button in tablet mode
			}
		
		},


		beforeActivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			// description:
			//		beforeActivate will call refreshData to create the
			//		model/controller and show the list.
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
