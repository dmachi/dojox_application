define(["dojo","dijit","dojox","dojo/html"], function(dojo,dijit,dojox,html){
	return function(from, to, options){
			console.log("transition() from: ", from, " to: ", to);
			var rev = (options && options.reverse) ? " reverse" : "";
			if(!options || !options.transition){
				dojo.style(from,"display","none");
			}else{
				console.log("dojo.style from: ", dojo.style(from, "display"));
				dojo.addClass(from, options.transition + " out" + rev);
				dojo.addClass(to, options.transition + " in" + rev);
			}
	}
});
