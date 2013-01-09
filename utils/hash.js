define({
		getParams: function(hash){
			// summary:
			//		get the params from the hash
			//
			// hash: String
			//		the url hash
			//
			// returns:
			//		the params object
			//
			var params = {};
			if(hash && hash.length){
				for(var parts= hash.split("&"), x= 0; x<parts.length; x++){
					var tp = parts[x].split("="), name=tp[0], value = encodeURIComponent(tp[1]||"");
					if(name && value) {
						params[name] = value;
					}
				}
			}
			return params; // Object
		},

		buildWithParams: function(hash, params){
			// summary:
			//		build up the url hash adding the params
			// hash: String
			//		the url hash
			// params: Object
			//		the params object
			//
			// returns:
	 		//		the params object
			//
			if(hash.charAt(0) !== "#"){
				hash = "#"+hash;
			}
			for(var item in params){
				var value = params[item];
				if(item && value != null){
					hash = hash+"&"+item+"="+params[item];
				}
			}
			return hash; // String
		},

		getTarget: function(hash){
			return ((hash && hash.charAt(0) == "#") ? hash.substr(1) : hash).split('&')[0];
		}
	}
)