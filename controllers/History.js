define(["dojo/_base/lang", "dojo/_base/declare", "dojo/on", "dojo/_base/Deferred", "../controller"],
function(lang, declare, on, Deferred, Controller){
	// module:
	//		dojox/app/controllers/History
	// summary:
	//		Bind "startTransition" event on dojox.app application's domNode,
	//		Bind "popstate" event on window object.
	//		Maintain history by HTML5 "pushState" method and "popstate" event.

	return declare("dojox.app.controllers.History", Controller, {
		constructor: function(app){
			// summary:
			//		Bind "startTransition" event on dojox.app application's domNode,
			//		Bind "popstate" event on window object.
			//
			// app:
			//		dojox.app application instance.

			this.events = {};//set events to empty because history controller directly bind event to domNode/window.
			this.inherited(arguments);

			this.bind(this.app.domNode, "startTransition", lang.hitch(this, this.onStartTransition));
			this.bind(window, "popstate", lang.hitch(this, this.onPopState));
		},

		onStartTransition: function(evt){
			// summary:
			//		Response to dojox.app "startTransition" event.
			//
			// example:
			//		Use "dojox/mobile/TransitionEvent" to trigger "startTransition" event, and this function will response the event. For example:
			//		|	var transOpts = {
			//		|		title:"List",
			//		|		target:"items,list",
			//		|		url: "#items,list"
			//		|	};
			//		|	new TransitionEvent(domNode, transOpts, e).dispatch();
			//
			// evt: Object
			//		transition options parameter

			// prevent event from bubbling to window and being
			// processed by dojox/mobile/ViewController
			if(evt.preventDefault){
				evt.preventDefault();
			}
			evt.cancelBubble = true;
			if(evt.stopPropagation){
				evt.stopPropagation();
			}

			var target = evt.detail.target;
			var regex = /#(.+)/;
			if(!target && regex.test(evt.detail.href)){
				target = evt.detail.href.match(regex)[1];
			}

			// push states to history list
			history.pushState(evt.detail,evt.detail.href, evt.detail.url);
			// transition to the target view
			on.emit(this.app.evented, "transition", {target:target, opts: lang.mixin({reverse: false},evt.detail)});
		},

		onPopState: function(evt){
			// summary:
			//		Response to dojox.app "popstate" event.
			//
			// evt: Object
			//		transition options parameter

			// Clean browser's cache and refresh the current page will trigger popState event,
			// but in this situation the application not start and throw an error.
			// so we need to check application status, if application not STARTED, do nothing.
			if(this.app.getStatus() !== this.app.lifecycle.STARTED){
				return;
			}

			var state = evt.state;
			if(!state){
				if(!this.app._startView && window.location.hash){
					state = {
						target: (location.hash && location.hash.charAt(0) == "#") ? location.hash.substr(1) : location.hash,
						url: location.hash
					}
				}else{
					state = {};
				}
			}

			var target = state.target || this.app._startView || this.app.defaultView;

			if(this.app._startView){
				this.app._startView = null;
			}
			var title = state.title || null;
			var href = state.url || null;

			if(evt._sim){
				history.replaceState(state, title, href);
			}

			var currentState = history.state;
			// transition to the target view
			on.emit(this.app.evented, "transition", {target:target, opts: lang.mixin({reverse: false},evt.detail)});
		}
	});
});
