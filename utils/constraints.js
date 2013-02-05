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

			return (view.selectedChildren && view.selectedChildren[constraint.__hash])?
				view.selectedChildren[constraint.__hash]:null;
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
			view.selectedChildren[constraint.__hash] = child;
		},

		register: function(constraint){
			// if the constraint has already been registered we don't care about it...
			if(!constraint.__hash){
				if(typeof(constraint) == "string" || typeof(constraint) == "number"){
					constraints.__index = constraint;
				}else{
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
							match = constraint;
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
					}
				}
				constraints.push(constraint);
			}
		}
	};
})