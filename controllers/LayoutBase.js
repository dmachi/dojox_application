define(["dojo/_base/lang", "dojo/_base/declare", "dojo/sniff", "dojo/_base/window", "dojo/_base/config",
		"dojo/topic", "dojo/dom-style", "dojo/dom-geometry", "../Controller"],
function(lang, declare, has, win, config, topic, domStyle, domGeom, Controller){
	// module:
	//		dojox/app/controllers/LayoutBase
	// summary:
	//		Bind "layout" and "select" events on dojox/app application instance.

	return declare("dojox.app.controllers.LayoutBase", Controller, {

		constructor: function(app, events){
			// summary:
			//		bind "layout" and "select" events on application instance.
			//
			// app:
			//		dojox/app application instance.
			// events:
			//		{event : handler}
			this.events = {
				"layout": this.layout,
				"select": this.select,
				"resize": this.onResize
			};
			// if we are using dojo mobile & we are hiding address bar we need to be bit smarter and listen to
			// dojo mobile events instead
			if(config.mblHideAddressBar){
				topic.subscribe("/dojox/mobile/afterResizeAll", lang.hitch(this, this.onResize));
			}else{
				// bind to browsers orientationchange event for ios otherwise bind to browsers resize
				this.bind(win.global, has("ios") ? "orientationchange" : "resize", lang.hitch(this, this.onResize));
			}
		},

		onResize: function(){
			this._doResize(this.app);
			// this is needed to resize the children on an orientation change or a resize of the browser.
			// it was being done in _doResize, but was not needed for every call to _doResize.
			for(var item in this.app.selectedChildren){  // need this to handle all selectedChildren
				this._doResize(this.app.selectedChildren[item]);
			}
			
		},
		
		layout: function(event){
			// summary:
			//		Response to dojox/app "layout" event.
			//
			// example:
			//		Use dojo/on.emit to trigger "layout" event, and this function will respond to the event. For example:
			//		|	on.emit(this.app.evented, "layout", view);
			//
			// event: Object
			// |		{"view": view, "callback": function(){}};
			this.app.log("in app/controllers/LayoutBase.layout event=",event);
			this.app.log("in app/controllers/LayoutBase.layout event.view.parent.name=[",event.view.parent.name,"]");
		},


		_doLayout: function(view){
			// summary:
			//		do view layout.
			//
			// view: Object
			//		view instance needs to do layout.

			if(!view){
				console.warn("layout empty view.");
				return;
			}
			
		},

		_doResize: function(view, changeSize, resultSize){
			// summary:
			//		resize view.
			//
			// view: Object
			//		view instance needs to do layout.
			this.app.log("in LayoutBase _doResize called for view.id="+view.id+" view=",view);
			var node = view.domNode;
			if(!node){
				this.app.log("Warning - View has not been loaded, in LayoutBase _doResize view.domNode is not set for view.id="+view.id+" view=",view);
				return;
			}
			// set margin box size, unless it wasn't specified, in which case use current size
			if(changeSize){
				domGeom.setMarginBox(node, changeSize);
				// set offset of the node
				if(changeSize.t){ node.style.top = changeSize.t + "px"; }
				if(changeSize.l){ node.style.left = changeSize.l + "px"; }
			}

			// If either height or width wasn't specified by the user, then query node for it.
			// But note that setting the margin box and then immediately querying dimensions may return
			// inaccurate results, so try not to depend on it.
			var mb = resultSize || {};
			lang.mixin(mb, changeSize || {});	// changeSize overrides resultSize
			if( !("h" in mb) || !("w" in mb) ){
				mb = lang.mixin(domGeom.getMarginBox(node), mb);	// just use dojo/_base/html.marginBox() to fill in missing values
			}

			// Compute and save the size of my border box and content box
			// (w/out calling dojo/_base/html.contentBox() since that may fail if size was recently set)
			if(view !== this.app){
				var cs = domStyle.getComputedStyle(node);
				var me = domGeom.getMarginExtents(node, cs);
				var be = domGeom.getBorderExtents(node, cs);
				var bb = (view._borderBox = {
					w: mb.w - (me.w + be.w),
					h: mb.h - (me.h + be.h)
				});
				var pe = domGeom.getPadExtents(node, cs);
				view._contentBox = {
					l: domStyle.toPixelValue(node, cs.paddingLeft),
					t: domStyle.toPixelValue(node, cs.paddingTop),
					w: bb.w - pe.w,
					h: bb.h - pe.h
				};
			}else{
				// if we are layouting the top level app the above code does not work when hiding address bar
				// so let's use similar code to dojo mobile.
				view._contentBox = {
					l: 0,
					t: 0,
					h: win.global.innerHeight || win.doc.documentElement.clientHeight,
					w: win.global.innerWidth || win.doc.documentElement.clientWidth
				};
			}

			this._doLayout(view);

		},
				
		_getSelectedChild: function(view, constraint){
			// summary:
			//		return the selectedChild for this constraint.
			//
			this.app.log("in Layout _getSelectedChild view.id="+view.id+"  constraint = "+constraint);
			if(view.selectedChildren && view.selectedChildren[constraint]){
				return view.selectedChildren[constraint];				
			}else{
				return null;
			}
		},


		select: function(event){
			// summary:
			//		Response to dojox/app "select" event.
			//
			// example:
			//		Use dojo/on.emit to trigger "select" event, and this function will response the event. For example:
			//		|	on.emit(this.app.evented, "select", view);
			//
			// event: Object
			// |		{"parent":parent, "view":view}

			var parent = event.parent || this.app;
			var view = event.view;

			if(!view){
				return;
			}
			
			// if the parent has a child in the view constraint it has to be hidden, and this view displayed.
			var parentSelChild = this._getSelectedChild(parent, view.constraint); 
			if(view !== parentSelChild){
				if(parentSelChild){
				//	domStyle.set(parentSelChild.domNode, "zIndex", 25);
					domStyle.set(parentSelChild.domNode, "display", "none");
				}

				domStyle.set(view.domNode, "display", "");
				//domStyle.set(view.domNode, "zIndex", 50);
				parent.selectedChildren[view.constraint] = view;
			}
			// do selected view layout
			// call _doResize for parent and view here, doResize will no longer call it for all children.
			this._doResize(parent);  
			this._doResize(view);
		}
	});
});
