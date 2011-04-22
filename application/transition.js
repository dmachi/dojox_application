define(["dojo","dijit","dojox","dojo/DeferredList"], function(dojo,dijit,dojox,DeferredList){
	return function(from, to, options){
			console.log("Trasition opts: ", options);
			var rev = (options && options.reverse) ? " reverse" : "";
			if(!options || !options.transition){
				dojo.style(from,"display","none");
				dojo.style(to, "display", "");
			}else{
				var defs=[];
				
				if (from){
					var fromDef = new dojo.Deferred();
					var fromHandle = dojo.connect(from, "webkitAnimationEnd", function(){
						//remove the animation classes in the node
						dojo.forEach([options.transition,"in","out","reverse"], function(item){
                            dojo.removeClass(from, item);
                        });
						
						dojo.disconnect(fromHandle);		
						console.log("fromDef ended");
						fromDef.resolve(from);
					}); 
					defs.push(fromDef);
				}
				
				var toDef = new dojo.Deferred();
				var toHandle= dojo.connect(to, "webkitAnimationEnd", function(){
					//remove the animation classes in the node
                    dojo.forEach([options.transition,"in","out","reverse"], function(item){
                        dojo.removeClass(to, item);
                    });
					
					console.log("toDef ended");
					dojo.disconnect(toHandle);		
					toDef.resolve(to);
				}); 
				defs.push(toDef);

				dojo.addClass(from, options.transition + " out" + rev);
				dojo.addClass(to, options.transition + " in" + rev);

                //TODO Since the animation is non-blocking in javascript, we might need to
                //ensure the state consistent, otherwise the application might be broken when
                //we operate continuously and quickly. For example, click back button of the
                //browser very fast for ten times. This is just a concern right now.
				
				return new dojo.DeferredList(defs);
				
			}
	}
});
