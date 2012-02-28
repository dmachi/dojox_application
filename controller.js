define(["dojo/_base/lang", "dojo/_base/declare", "dojo/on", "dojo/Evented"], function(lang, declare, on, Evented){
	// module:
	//		dojox/app/controller
	// summary:
	//		Bind events on dojox.app application's dojo.Evented instance or document.

	return declare("dojox.app.controller", null, {
		constructor: function(app, events){
			// summary:
			//		bind events on application dojo.Evented instance.
			//		bind css selector events on document.
			//
			// app:
			//		dojox.app application instance.
			// events:
			//		{event : handler}

			this.events = this.events || events;
			this.signals = [];
			this.app = app;
			if(!this.app.evented){
				this.app.evented = new Evented();
			}
			if(this.events){
				for(var item in this.events){
					if(item.charAt(0) !== "_"){//skip the private properties
						if(item.indexOf(':') > 0){
							this.bind(document, item, lang.hitch(this, this.events[item]));
						}else{
							this.bind(this.app.evented, item, lang.hitch(this, this.events[item]));
						}
					}
				}
			}
		},

		bind: function(evented, event, handler){
			// summary:
			//		Bind event on dojo.Evented instance, document, domNode or window.
			//		Save event signal in controller instance.
			//
			// evented: Object
			//		dojo.Evented instance, document, domNode or window
			// event: String
			//		event
			// handler: Function
			//		event handler

			if(!handler){
				console.warn("bind event '"+event+"' without callback function.");
			}
			var signal = on(evented, event, handler);
			this.signals.push({
				"event": event,
				"evented": evented,
				"signal": signal
			});
		},

		unbind: function(evented, event){
			// summary:
			//		remove a binded event signal.
			//
			// evented: Object
			//		dojo.Evented instance, document, domNode or window
			// event: String
			//		event

			var len = this.signals.length;
			for(var i=0; i<len; i++){
				if((this.signals[i]['event'] == event) && (this.signals[i]['evented'] == evented)){
					this.signals[i]['signal'].remove();
					this.signals.splice(i, 1);
					return;
				}
			}
			console.warn("event '"+event+"' not bind on ", evented);
		}
	});
});
