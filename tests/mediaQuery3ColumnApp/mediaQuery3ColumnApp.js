require(["dojo/_base/window","dojox/app/main", "dojox/json/ref", "dojo/text!./config.json", "dojo/sniff"],
	function(win, Application, jsonRef, config, has){

	this.small = 560;
	this.medium = 860;
	
	// large > 860 medium <= 860  small <= 560 
	this.isLarge = function(){				
		var width = window.innerWidth || document.documentElement.clientWidth;
		if(width > this.medium){
			return true;
		}
		return false;
	};

	this.isMedium = function(){				
		var width = window.innerWidth || document.documentElement.clientWidth;
		if(width <= this.medium && width > this.small){
			return true;
		}
		return false;		
	};

	this.isSmall = function(){				
		var width = window.innerWidth || document.documentElement.clientWidth;
		if(width <= this.small){
			return true;
		}
		return false;		
	};

	
	var config = jsonRef.fromJson(config);
	has.add("ie9orLess", has("ie") && (has("ie") <= 9));
	has.add("isInitiallySmall", this.isSmall());
	Application(config);
	
});
