define(["dojo/_base/lang", "dojo/dom", "dojo/on", "dijit/registry", "dojox/mobile/TransitionEvent"],
function(lang, dom, on, registry, TransitionEvent){
	var _onResults = []; // events on array

	// show an item detail
	var setDetailsContext = function(index, e, params){
		if(params){
			params.cursor = index;
		}else{
			params = {"cursor":index};
		}
		// transition to itemDetails view with the &cursor=index
		var transOpts = {
			title : "itemDetails",
			target : "listMain,itemDetails",
			url : "#listMain,itemDetails", // this is optional if not set it will be created from target   
		//	params : {"cursor":index}
			params : params
		};
		new TransitionEvent(e.target, transOpts, e).dispatch(); 
		
	};
	return {
	// insert an item
		insertResult: function(index, e){
			if(index<0 || index>this.list.store.data.length){
				throw Error("index out of data model.");
			}
			if((this.list.store.data[index-1].First=="") ||
				(this.list.store.data[index] && (this.list.store.data[index].First == ""))){
				return;
			}
			var data = {id:Math.random(), "label": "", "rightIcon":"mblDomButtonBlueCircleArrow", "First": "", "Last": "", "Location": "CA", "Office": "", "Email": "", "Tel": "", "Fax": ""};
			this.list.store.add(data);
			setDetailsContext(index, e);
		},


		// list view init
		init: function(){
			list = this.list;
			if(!list.Store){
				list.setStore(this.app.stores.listStore.store);
			}
			var onResult;
		//	for(var i = 0; i < this.list.store.data.length; i++){
		//		var item = dom.byId(this.list.store.data[i].id);
		//		onResult = on(item, "click", lang.hitch(this, function(e){
		//			var item = this.list.store.query({"label": e.target.innerHTML})
		//			var index = this.list.store.index[item[0].id];
		//			console.log("index is "+index);
		//			setDetailsContext(index, e, this.params);
		//		})); 
		//		_onResults.push(onResult);
		//	}
			
			onResult = this.list.on("click", lang.hitch(this, function(e){
				console.log("List on click hit ",e);
				var item = this.list.store.query({"label": e.target.innerHTML})
				var index = this.list.store.index[item[0].id];
				console.log("index is "+index);
				setDetailsContext(index, e, this.params);	
			})); 
			_onResults.push(onResult);

			onResult = this.listInsert1.on("click", lang.hitch(this, function(e){
				console.log("listInsert1 on click hit ",e);
				var index = this.list.store.data.length;
				this.insertResult(index, e);
			})); 
			_onResults.push(onResult);
			
		},

		// view destroy
		destroy: function(){
			var onResult = _onResults.pop();
			while(onResult){
				onResult.remove();
				onResult = _onResults.pop();
			}
		}
	}
});
