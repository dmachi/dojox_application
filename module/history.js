define(["dojo/_base/lang", "dojo/_base/declare", "dojo/_base/Deferred", "dojo/on"],function(dlang,declare,Deferred,on){
	return declare(null, {
		postCreate: function(params,node){
			this.inherited(arguments);
			var hash=window.location.hash;
			this._startView= ((hash && hash.charAt(0)=="#")?hash.substr(1):hash)||this.defaultView;

			on(this.domNode, "startTransition", dlang.hitch(this, "onStartTransition"));
			on(window,"popstate", dlang.hitch(this, "onPopState"));
		},
		startup: function(){
			this.inherited(arguments);
		},

		onStartTransition: function(evt){
			console.log("onStartTransition", evt.detail.href, history.state);
			if (evt.preventDefault){
				evt.preventDefault();
			}

			//prevent event from bubbling to window and being
			//processed by dojox/mobile/ViewController
			evt.cancelBubble = true;
			if(evt.stopPropagation){
			    evt.stopPropagation();
			}
			
			var target = evt.detail.target;
			var regex = /#(.+)/;
			if(!target && regex.test(evt.detail.href)){
				target = evt.detail.href.match(regex)[1];
			}

			history.pushState(evt.detail,evt.detail.href, evt.detail.url);
			on.emit(this.evented, "transition", {target:target, opts: dlang.mixin({reverse: false},evt.detail)});
		},

		/*
		onHashChange: function(evt){
			var target = window.location.hash.substr(1);;
			var evt = {target: window.location.hash, url: "#" + target,title:null};
			//this.onStartTransition(evt);
		},
		*/

		onPopState: function(evt){
			// Check application status, if application status not STARTED, do nothing.
			// when clean browser's cache then refresh the current page, it will trigger popState event. 
			// but the application not start, it will throw an error.
			if(this.getStatus() !== this.lifecycle.STARTED ){
				return;
			}
			var state = evt.state;
			if (!state){

				if(!this._startView && window.location.hash){
					state={
						target: (location.hash && location.hash.charAt(0)=="#")?location.hash.substr(1):location.hash,
						url: location.hash
					}		
				}else{
					state={};	
				}
			}

			var target = state.target || this._startView || this.defaultView;

			if (this._startView){
				this._startView=null;
			}
			var title = state.title||null;
			var href = state.url || null;

			if (evt._sim) {
				history.replaceState(state, title, href );
			}

			/*
			dojo.when(this.transition(window.history.state, {rev: true}), dojo.hitch(this, function(){

				console.log('done transition from onPopState');
			}))
			*/
			var currentState = history.state;
			// emit transition event
			on.emit(this.evented, "transition", {target:target, opts: dlang.mixin({reverse: false},evt.detail)});
		}
	});	
});
