define(["dojo/_base/array"], function(arr){
	var constraints = [];
	return {
		getSelectedChild: function(view, constraint){
			// summary:
			//		get current selected child according to the constraint
			//
			// view: View
			//		the View to get the child from
			// constraint: Object
			//		tbe constraint object
			//
			// returns:
			//		the selected child view for this constraint
			var type = typeof(constraint);
			var hash = (type == "string" || type == "number")?constraint:constraint.__hash;
			return (view && view.selectedChildren && view.selectedChildren[hash])?
				view.selectedChildren[hash]:null;
		},

		setSelectedChild: function(view, constraint, child){
			// summary:
			//		set current selected child according to the constraint
			//
			// view: View
			//		the View to set the selected child to
			// constraint: Object
			//		tbe constraint object
			// child: View
			//		the child to select
			var type = typeof(constraint);
			var hash = (type == "string" || type == "number")?constraint:constraint.__hash;
			view.selectedChildren[hash] = child;
		},

		register: function(constraint){
			// if the constraint has already been registered we don't care about it...
			var type = typeof(constraint);
			if(!constraint.__hash && type != "string" && type != "number"){
				var match = null;
				arr.some(constraints, function(item){
					var ok = true;
					for(var prop in item){
						if(prop.charAt(0) !== "_"){//skip the private properties
							if(item[prop] != constraint[prop]){
								ok = false;
								break;
							}
						}
					}
					if(ok == true){
						match = item;
					}
					return ok;
				});
				if(match){
					constraint.__hash = match.__hash;
				}else{
					// create a new "hash"
					var hash = "";
					for(var prop in constraint){
						if(prop.charAt(0) !== "_"){
							hash += constraint[prop];
						}
					}
					constraint.__hash = hash;
					constraints.push(constraint);
				}
			}
		}
	};
})