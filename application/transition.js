define(["dojo","dijit","dojox","dojo/html"], function(dojo,dijit,dojox,html){
	return function(from, to, options){
			console.log("transition() from: ", from, " to: ", to);
			var rev = (options && options.reverse) ? " reverse" : "";
			if(!options || !options.transition){
				dojo.style(from,"display","none");
				dojo.style(to, "display", "");
			}else{
				//need to ensure the two dom nodes, from and to, are not set as display=none
				//otherwise the webkitAnimationEnd will not be fired for the dom node.
				dojo.style(from,"display","");
                dojo.style(to, "display", "");
				
				//fromWidget and toWidget are two objects only used for remove animation class 
				//and disconnect the event handler for "webkitAnimationEnd"
				var fromWidget = {
					conn: null,
					node: from
				};
				var toWidget = {
					conn: null,
					node: to
				}
				
				//Connect removeClass logic to the animation end event so that the animation
				//CSS classes are removed after the animation ends. 
				//"this" variable in the removeClass function should be either 
				//fromWidget or toWidget.
				var removeClass = function(){
					dojo.forEach([options.transition,"in","out","reverse"], function(item){
                        dojo.removeClass(this, item);
                    }, this.node);
					dojo.disconnect(this.conn);
				};				
				fromWidget.conn = dojo.connect(from, "webkitAnimationEnd", fromWidget, removeClass);
				toWidget.conn = dojo.connect(to, "webkitAnimationEnd", toWidget, removeClass);
				
				//Start animation by setting the animation classes.
				console.log("dojo.style from: ", dojo.style(from, "display"));
				dojo.addClass(from, options.transition + " out" + rev);
				dojo.addClass(to, options.transition + " in" + rev);
				
				//TODO set the from node to display:none. Currently this task is done by 
				//this.set("selectedScene", next); in kernel.js
				//better to put it here to make the logic complete.
				
				//TODO Since the animation is non-blocking in javascript, we might need to
				//ensure the state consistent, otherwise the application might be broken when
				//we operate continuously and quickly. For example, click back button of the
				//browser very fast for ten times. This is just a concern right now.
			}
	}
});
