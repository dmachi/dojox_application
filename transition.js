define(["dojo/_base/kernel", "dojo/_base/array","dojo/_base/html","dojo/DeferredList","./animation"],
	function(dojo, darray, dhtml, DeferredList,animation){
	return function(from, to, options){
		var rev = (options && options.reverse) ? -1 : 1;
		if(!options || !options.transition || !animation[options.transition]){
			dojo.style(from,"display","none");
			dojo.style(to, "display", "");
		}else{
			var defs=[];
			var transit=[];
			var duration = 250;
			if(options.transition === "fade"){
			    duration = 600;
			}else if (options.transition === "flip"){
			    duration = 200;
			}
			dojo.style(from, "display", ""); 
			dojo.style(to, "display", "");
			if (from){
				var fromDef = new dojo.Deferred();
				//create animation to transit "from" out
				var fromTransit = animation[options.transition](from, {
				    "in": false,
				    direction: rev,
				    duration: duration,
				    onAfterEnd: function(){
				        fromDef.resolve(from);
				    }
				});
				defs.push(fromDef);
				transit.push(fromTransit);
			}
			
			var toDef = new dojo.Deferred();
			//create animation to transit "to" in	                
			var toTransit = animation[options.transition](to, {
                            direction: rev,
                            duration: duration,
                            onAfterEnd: function(){
                                toDef.resolve(to);
                            }
                        });
			defs.push(toDef);
			transit.push(toTransit);
			
			//TODO If it is flip use the chainedPlay
			//play fromTransit and toTransit together
			if(options.transition === "flip"){
			    animation.chainedPlay(transit);
			}else{
			    animation.groupedPlay(transit);
			}

			return new dojo.DeferredList(defs);
			
		}
	};
});
