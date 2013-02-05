define(["dojo/_base/lang", "dojo/_base/declare", "dojo/has", "dojo/on", "dojo/Deferred",
	"dojo/when", "dojox/css3/transit", "../Controller", "../utils/constraints"],
	function(lang, declare, has, on, Deferred, when, transit, Controller, constraints){
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
			if(this.app.domNode){
				this.onDomNodeChange({oldNode: null, newNode: this.app.domNode});
			}
		},

		transition: function(event){
			// summary:
			//		Response to dojox/app "transition" event.
			//
			// example:
			//		Use trigger() to trigger "transition" event, and this function will response to the event. For example:
			//		|	this.trigger("transition", {"viewId":viewId, "opts":opts});
			//
			// event: Object
			//		"transition" event parameter. It should be like this: {"viewId":viewId, "opts":opts}
			
			this.proceeding = (event.opts && event.opts.params && event.opts.params.waitToProceed); // waitToProceed passed when visible is true to delay processing.

			var viewsId = event.viewId || "";
			this.proceedingSaved = this.proceeding;	
			var parts = viewsId.split('+');
			if(parts.length > 0){		
				while(parts.length > 1){ 	
					var viewId = parts.shift();
					var newEvent = lang.clone(event);
					newEvent.viewId = viewId;
					this.proceeding = true;
					this.proceedTransition(newEvent);					
				}				
				this.proceeding = this.proceedingSaved;
				var viewId = parts.shift();
				event.viewId = viewId;	
				event._doResize = true; // at the end of the last transition call resize
				this.proceedTransition(event);
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

			// transition to the target view
			this.transition({"viewId":target, opts: lang.mixin({},evt.detail)});
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
			var params;
			if(transitionEvt.opts && transitionEvt.opts.params){
				params = transitionEvt.opts.params;
			}
			this.app.emit("load", {
				"viewId": transitionEvt.viewId,
				"params": params,
				"callback": lang.hitch(this, function(){
					var transitionDef = this._doTransition(transitionEvt.viewId, transitionEvt.opts, params, this.app, transitionEvt._doResize);
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

		_getDefaultTransition: function(parent){
			// summary:
			//		Get view's default transition type from parent view.
			//		Retrieve the parent chain and get the latest ancestor's default transition type.
			//
			// parent: Object
			//		view's parent
			//
			// returns:
			//		transition type like "slide", "fade", "flip" or undefined.
			var parentView = parent;
			var defaultTransition = parentView.defaultTransition;
			while(!defaultTransition && parentView.parent){
				parentView = parentView.parent;
				defaultTransition = parentView.defaultTransition;
			}
			return defaultTransition;
		},

		_doTransition: function(transitionTo, opts, params, parent, doResize){
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
			// parent: Object
			//		view's parent
			// doResize: Boolean
			//		emit a resize event
			//
			// returns:
			//		transit dojo/DeferredList object.

			//TODO: Can this be called with a viewId which includes multiple views with a "+"?  Need to handle that!
			this.app.log("in app/controllers/Transition._doTransition transitionTo=[",transitionTo,"], parent.name=[",parent.name,"], opts=",opts);

			if(!parent){
				throw Error("view parent not found in transition.");
			}
			var parts, toId, subIds, next, params; 
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
				// TODO: ELC NEED A LOOP HERE TO deactivate all children
				var subChild = constraints.getSelectedChild(current, "center");
				while(subChild){
					this.app.log("< in Transition._doTransition calling subChild.beforeDeactivate subChild name=[",subChild.name,"], parent.name=[",subChild.parent.name,"], next!==current path");
					subChild.beforeDeactivate();
					subChild = constraints.getSelectedChild(subChild, "center");
				}
				if(current){
					this.app.log("< in Transition._doTransition calling current.beforeDeactivate current name=[",current.name,"], parent.name=[",current.parent.name,"], next!==current path");
					current.beforeDeactivate();
				}
				this.app.log("> in Transition._doTransition calling next.beforeActivate next name=[",next.name,"], parent.name=[",next.parent.name,"], next!==current path");
				next.beforeActivate();
				this.app.log("> in Transition._doTransition calling app.triggger layoutView view next name=[",next.name,"], parent.name=[",next.parent.name,"], next!==current path");
				this.app.emit("layoutView", {"parent":parent, "view":next});
				if(doResize){  
					this.app.emit("resize"); // after last layoutView call resize			
				}
				
				var result = true;
				if(!has("ie") || has("ie") >= 10){
					// if we are on IE CSS3 transitions are not supported (yet). So just skip the transition itself.
					var mergedOpts = lang.mixin({}, opts); // handle reverse from mergedOpts or transitionDir 
					mergedOpts = lang.mixin({}, mergedOpts, {
						reverse: (mergedOpts.reverse || mergedOpts.transitionDir===-1)?true:false,
						transition: mergedOpts.transition || this._getDefaultTransition(parent) || "none"
					});
					result = transit(current && current.domNode, next.domNode, mergedOpts);
				}
				when(result, lang.hitch(this, function(){
					// deactivate sub child of current view, then deactivate current view
					subChild = constraints.getSelectedChild(current, "center");
					
					while(subChild){
						this.app.log("  < in Transition._doTransition calling subChild.afterDeactivate subChild name=[",subChild.name,"], parent.name=[",subChild.parent.name,"], next!==current path");
						subChild.afterDeactivate();
						subChild = constraints.getSelectedChild(subChild, "center");
					}
					if(current){
						this.app.log("  < in Transition._doTransition calling current.afterDeactivate current name=[",current.name,"], parent.name=[",current.parent.name,"], next!==current path");
						current.afterDeactivate();
					}
					this.app.log("  > in Transition._doTransition calling next.afterActivate next name=[",next.name,"], parent.name=[",next.parent.name,"], next!==current path");
					next.afterActivate();

					if(subIds){
						this._doTransition(subIds, opts, params, next, doResize);
					}
				}));
				return result; // dojo/DeferredList
			}else{
				// next view == current view, refresh current view
				// deactivate next view
				this.app.log("< in Transition._doTransition calling next.beforeDeactivate refresh current view next name=[",next.name,"], parent.name=[",next.parent.name,"], next==current path");
				next.beforeDeactivate();
				this.app.log("  < in Transition._doTransition calling next.afterDeactivate refresh current view next name=[",next.name,"], parent.name=[",next.parent.name,"], next==current path");
				next.afterDeactivate();
				// activate next view
				this.app.log("> in Transition._doTransition calling next.beforeActivate next name=[",next.name,"], parent.name=[",next.parent.name,"], next==current path");
				next.beforeActivate();
				this.app.log("  > in Transition._doTransition calling next.afterActivate next name=[",next.name,"], parent.name=[",next.parent.name,"], next==current path");
				next.afterActivate();
				// layout current view
				this.app.log("> in Transition._doTransition calling app.triggger layoutView view next name=[",next.name,"], parent.name=[",next.parent.name,"], next==current path");
				this.app.emit("layoutView", {"parent":parent, "view":next});
				if(doResize){
					this.app.emit("resize"); // after last layoutView call resize			
				}
				
			}

			// do sub transition like transition from "tabScene,tab1" to "tabScene,tab2"
			if(subIds){
				return this._doTransition(subIds, opts, params, next); //dojo.DeferredList
			}
		}
	});
});
