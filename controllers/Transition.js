define(["require", "dojo/_base/lang", "dojo/_base/declare", "dojo/has", "dojo/on", "dojo/Deferred", "dojo/when",
	"dojo/dom-style", "../Controller", "../utils/constraints"],
	function(require, lang, declare, has, on, Deferred, when, domStyle, Controller, constraints){

	var transit;

	// module:
	//		dojox/app/controllers/transition
	//		Bind "transition" event on dojox/app application instance.
	//		Do transition from one view to another view.
	return declare("dojox.app.controllers.Transition", Controller, {

		proceeding: false,

		waitingQueue:[],

		constructor: function(app, events){
			// summary:
			//		bind "transition" event on application instance.
			//
			// app:
			//		dojox/app application instance.
			// events:
			//		{event : handler}
			this.events = {
				"transition": this.transition,
				"domNode": this.onDomNodeChange
			};
			require([this.app.transit || "dojox/css3/transit"], function(t){
				transit = t;
			});
			if(this.app.domNode){
				this.onDomNodeChange({oldNode: null, newNode: this.app.domNode});
			}
		},

		transition: function(event){
			// summary:
			//		Response to dojox/app "transition" event.
			//
			// example:
			//		Use emit to trigger "transition" event, and this function will response to the event. For example:
			//		|	this.app.emit("transition", {"viewId": viewId, "opts": opts});
			//
			// event: Object
			//		"transition" event parameter. It should be like this: {"viewId": viewId, "opts": opts}
			
			this.proceeding = (event.opts && event.opts.params && event.opts.params.waitToProceed); // waitToProceed passed when visible is true to delay processing.

			var viewsId = event.viewId || "";
			this.proceedingSaved = this.proceeding;	
			var parts = viewsId.split('+');
			var viewId;
			if(parts.length > 0){
				while(parts.length > 1){ 	
					viewId = parts.shift();
					var newEvent = lang.clone(event);
					newEvent.viewId = viewId;
					this.proceeding = true;
					this.proceedTransition(newEvent);					
				}
				viewId = parts.shift();
				var removeParts = viewId.split('-');
				if(removeParts.length > 0){
					viewId = removeParts.shift();
					while(removeParts.length > 0){ 	
						var remViewId = removeParts.shift();
						var newEvent = lang.clone(event);
						newEvent.viewId = remViewId;
						this._doTransition(newEvent.viewId, newEvent.opts, newEvent.opts.params, event.opts.data, this.app, true, newEvent._doResize);
					}
				}
				if(viewId.length > 0){ // check viewId.length > 0 to skip this section for a transition with only -viewId
					this.proceeding = this.proceedingSaved;
					event.viewId = viewId;	
					event._doResize = true; // at the end of the last transition call resize
					this.proceedTransition(event);
				}
			}else{
				event._doResize = true; // at the end of the last transition call resize
				this.proceedTransition(event);
			}
		},

		onDomNodeChange: function(evt){
			if(evt.oldNode != null){
				this.unbind(evt.oldNode, "startTransition");
			}
			this.bind(evt.newNode, "startTransition", lang.hitch(this, this.onStartTransition));
		},

		onStartTransition: function(evt){
			// summary:
			//		Response to dojox/app "startTransition" event.
			//
			// example:
			//		Use "dojox/mobile/TransitionEvent" to trigger "startTransition" event, and this function will response the event. For example:
			//		|	var transOpts = {
			//		|		title:"List",
			//		|		target:"items,list",
			//		|		url: "#items,list",
			//		|		data: {}
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

			// transition to the target view
			this.transition({ "viewId":target, opts: lang.mixin({}, evt.detail), data: evt.detail.data });
		},

		proceedTransition: function(transitionEvt){
			// summary:
			//		Proceed transition queue by FIFO by default.
			//		If transition is in proceeding, add the next transition to waiting queue.
			//
			// transitionEvt: Object
			//		"transition" event parameter. It should be like this: {"viewId":viewId, "opts":opts}

			if(this.proceeding){
				this.app.log("in app/controllers/Transition proceedTransition push event", transitionEvt);
				this.waitingQueue.push(transitionEvt);
				this.processingQueue = false;  
				return;
			}
			// If there are events waiting, needed to have the last in be the last processed, so add it to waitingQueue
			// process the events in order.
			if(this.waitingQueue.length > 0 && !this.processingQueue){
				this.processingQueue = true;
				this.waitingQueue.push(transitionEvt);
				transitionEvt = this.waitingQueue.shift();	
			}
			
			this.proceeding = true;

			this.app.log("in app/controllers/Transition proceedTransition calling trigger load", transitionEvt);
			if(!transitionEvt.opts){
				transitionEvt.opts = {};
			}
			var params = transitionEvt.params;
			this.app.emit("load", {
				"viewId": transitionEvt.viewId,
				"params": params,
				"callback": lang.hitch(this, function(){
					var transitionDef = this._doTransition(transitionEvt.viewId, transitionEvt.opts, params, transitionEvt.opts.data, this.app, false, transitionEvt._doResize);
					when(transitionDef, lang.hitch(this, function(){
						this.proceeding = false;
						var nextEvt = this.waitingQueue.shift();
						if(nextEvt){
							this.proceedTransition(nextEvt);
						}
					}));
				})
			});
		},

		_getTransition: function(parent, transitionTo, opts){
			// summary:
			//		Get view's transition type from the config for the view or from the parent view recursively.
			//		If not available use the transition option otherwise get view default transition type in the
			//		config from parent view.
			//
			// parent: Object
			//		view's parent
			// transitionTo: Object
			//		view to transition to
			//	opts: Object
			//		transition options
			//
			// returns:
			//		transition type like "slide", "fade", "flip" or "none".
			var parentView = parent;
			var transition = null;
			if(parentView.views[transitionTo]) {
				transition = parentView.views[transitionTo].transition;
			} 
			if(!transition){
				transition = parentView.transition;
			}
			var defaultTransition = parentView.defaultTransition;
			while(!transition && parentView.parent){
				parentView = parentView.parent;
				transition = parentView.transition;
				if(!defaultTransition){
					defaultTransition = parentView.defaultTransition;
				}
			}
			return transition || opts.transition || defaultTransition || "none";
		},

		_doTransition: function(transitionTo, opts, params, data, parent, removeView, doResize, nested){
			// summary:
			//		Transitions from the currently visible scene to the defined scene.
			//		It should determine what would be the best transition unless
			//		an override in opts tells it to use a specific transitioning methodology
			//		the transitionTo is a string in the form of [view]@[scene].  If
			//		view is left of, the current scene will be transitioned to the default
			//		view of the specified scene (eg @scene2), if the scene is left off
			//		the app controller will instruct the active scene to the view (eg view1).  If both
			//		are supplied (view1@scene2), then the application should transition to the scene,
			//		and instruct the scene to navigate to the view.
			//
			// transitionTo: Object
			//		transition to view id. It looks like #tabScene,tab1
			// opts: Object
			//		transition options
			// params: Object
			//		params
			// data: Object
			//		data object that will be passed on activate & de-activate methods of the view
			// parent: Object
			//		view's parent
			// removeView: Boolean
			//		remove the view instead of transition to it
			// doResize: Boolean
			//		emit a resize event
			// nested: Boolean
			//		whether the method is called from the transitioning of a parent view
			//
			// returns:
			//		transit dojo/promise/all object.

			//TODO: Can this be called with a viewId which includes multiple views with a "+"?  Need to handle that!
			this.app.log("in app/controllers/Transition._doTransition transitionTo=[",transitionTo,"], removeView = [",removeView,"] parent.name=[",parent.name,"], opts=",opts);

			if(!parent){
				throw Error("view parent not found in transition.");
			}
			var parts, toId, subIds, next;
			if(transitionTo){
				parts = transitionTo.split(",");
			}else{
				// If parent.defaultView is like "main,main", we also need to split it and set the value to toId and subIds.
				// Or cannot get the next view by "parent.children[parent.id + '_' + toId]"
				parts = parent.defaultView.split(",");
			}
			toId = parts.shift();
			subIds = parts.join(',');

			// next is loaded and ready for transition
			next = parent.children[parent.id + '_' + toId];
			if(!next){
				if(removeView){
					this.app.log("> in Transition._doTransition called with removeView true, but that view is not available to remove");
					return;  // trying to remove a view which is not showing
				}				
				throw Error("child view must be loaded before transition.");
			}

			var current = constraints.getSelectedChild(parent, next.constraint);

			// set params on next view.
			next.params = params || next.params;

			// if no subIds and next has default view, 
			// set the subIds to the default view and transition to default view.
			if(!subIds && next.defaultView){
				subIds = next.defaultView;
			}

			if(removeView){
				// if we remove a view with not replacement
				next = null;
			}

			// next is not a Deferred object, so Deferred.when is no needed.
			if(next !== current){
				//When clicking fast, history module will cache the transition request que
				//and prevent the transition conflicts.
				//Originally when we conduct transition, selectedChild will not be the
				//view we want to start transition. For example, during transition 1 -> 2
				//if user click button to transition to 3 and then transition to 1. After
				//1->2 completes, it will perform transition 2 -> 3 and 2 -> 1 because
				//selectedChild is always point to 2 during 1 -> 2 transition and transition
				//will record 2->3 and 2->1 right after the button is clicked.

				//assume next is already loaded so that this.set(...) will not return
				//a promise object. this.set(...) will handles the this.selectedChild,
				//activate or deactivate views and refresh layout.

				// deactivate sub child of current view, then deactivate current view
				// TODO: why is "center" hard coded here?
				var subChild = constraints.getSelectedChild(current, "center");
				while(subChild){
					this.app.log("< in Transition._doTransition calling subChild.beforeDeactivate subChild name=[",subChild.name,"], parent.name=[",subChild.parent.name,"], next!==current path");
					// TODO what to pass to beforeDeactivate here?
					subChild.beforeDeactivate();
					subChild = constraints.getSelectedChild(subChild, "center");
				}
				if(current){
					this.app.log("< in Transition._doTransition calling current.beforeDeactivate current name=[",current.name,"], parent.name=[",current.parent.name,"], next!==current path");
					current.beforeDeactivate(next, data);
				}
				if(next){
					this.app.log("> in Transition._doTransition calling next.beforeActivate next name=[",next.name,"], parent.name=[",next.parent.name,"], next!==current path");
					next.beforeActivate(current, data);
				}
				this.app.log("> in Transition._doTransition calling app.triggger layoutView view next");
				if(!removeView){
					// if we are removing the view we must delay the layout to _after_ the animation
					this.app.emit("layoutView", {"parent": parent, "view": next });
				}
				if(doResize){  
					this.app.emit("resize"); // after last layoutView call resize			
				}
				
				var result = true;
				if(transit && (!has("ie") || has("ie") >= 10) && (!nested || current != null)){
					// if we are on IE CSS3 transitions are not supported (yet). So just skip the transition itself.
					// we also skip in we are transitioning to a nested view from a parent view and that nested view
					// did not have any current
					var mergedOpts = lang.mixin({}, opts); // handle reverse from mergedOpts or transitionDir
					mergedOpts = lang.mixin({}, mergedOpts, {
						reverse: (mergedOpts.reverse || mergedOpts.transitionDir===-1)?true:false,
						// if transition is set for the view (or parent) in the config use it, otherwise use it from the event or defaultTransition from the config
						transition: this._getTransition(parent, transitionTo, mergedOpts)
					}); 
					result = transit(current && current.domNode, next && next.domNode, mergedOpts);
				}
				when(result, lang.hitch(this, function(){
					if(removeView){
						this.app.emit("layoutView", {"parent": parent, "view": current, "removeView": true});
					}

					// deactivate sub child of current view, then deactivate current view
					subChild = constraints.getSelectedChild(current, "center");
					
					while(subChild){
						this.app.log("  < in Transition._doTransition calling subChild.afterDeactivate subChild name=[",subChild.name,"], parent.name=[",subChild.parent.name,"], next!==current path");
						// TODO what  to pass to beforeDeactivate here?
						subChild.afterDeactivate();
						subChild = constraints.getSelectedChild(subChild, "center");
					}
					if(current){
						this.app.log("  < in Transition._doTransition calling current.afterDeactivate current name=[",current.name,"], parent.name=[",current.parent.name,"], next!==current path");
						current.afterDeactivate(next, data);
					}
					if(next){
						this.app.log("  > in Transition._doTransition calling next.afterActivate next name=[",next.name,"], parent.name=[",next.parent.name,"], next!==current path");
						next.afterActivate(current, data);
					}

					if(subIds){
						this._doTransition(subIds, opts, params, data, next, removeView, doResize, true);
					}
				}));
				return result; // dojo/promise/all
			}else{
				// next view == current view, refresh current view
				// deactivate next view
				this.app.log("< in Transition._doTransition calling next.beforeDeactivate refresh current view next name=[",next.name,"], parent.name=[",next.parent.name,"], next==current path");
				next.beforeDeactivate(current, data);
				this.app.log("  < in Transition._doTransition calling next.afterDeactivate refresh current view next name=[",next.name,"], parent.name=[",next.parent.name,"], next==current path");
				next.afterDeactivate(current, data);
				// activate next view
				this.app.log("> in Transition._doTransition calling next.beforeActivate next name=[",next.name,"], parent.name=[",next.parent.name,"], next==current path");
				next.beforeActivate(current, data);
				this.app.log("  > in Transition._doTransition calling next.afterActivate next name=[",next.name,"], parent.name=[",next.parent.name,"], next==current path");
				next.afterActivate(current, data);
				// layout current view, or remove it
				this.app.log("> in Transition._doTransition calling app.triggger layoutView view next name=[",next.name,"], removeView = [",removeView,"], parent.name=[",next.parent.name,"], next==current path");
				this.app.emit("layoutView", {"parent":parent, "view": next, "removeView": removeView});
				if(doResize){
					this.app.emit("resize"); // after last layoutView call resize			
				}
			}

			// do sub transition like transition from "tabScene,tab1" to "tabScene,tab2"
			if(subIds){
				return this._doTransition(subIds, opts, params, data, next, removeView); //dojo.DeferredList
			}
		}
	});
});
