define(["dojo","dijit","dojox","dojo/html","dojo/DeferredList"], function(dojo,dijit,dojox,html,DeferredList){
	return function(from, to, options){
			console.log("Trasition opts: ", options);
			var rev = (options && options.reverse) ? " reverse" : "";
			if(!options || !options.transition){
				dojo.style(from,"display","none");
			}else{
				var defs=[];
				/*
				if (from){
					var fromDef = new dojo.Deferred();
					var fromHandle = dojo.connect(from, "webkitAnimationEnd", function(){
						dojo.disconnect(fromHandle);		
						console.log("fromDef ended");
						fromDef.resolve(from);
					}); 
					defs.push(fromDef);
				}
				*/
				var toDef = new dojo.Deferred();
				var toHandle= dojo.connect(to, "webkitAnimationEnd", function(){
					console.log("toDef ended");
					dojo.disconnect(toHandle);		
					toDef.resolve(to);
				}); 
				defs.push(toDef);

				dojo.addClass(from, options.transition + " out" + rev);
				dojo.addClass(to, options.transition + " in" + rev);

				return new dojo.DeferredList(defs);
			}
	}
});
