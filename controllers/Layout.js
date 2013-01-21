define(["dojo/_base/declare", "dojo/_base/array", "dojo/query", "dojo/dom-attr", "dijit/registry", 
		"dojox/app/controllers/LayoutBase", "../layout/utils"],
function(declare, array, query, domAttr, registry, LayoutBase, layoutUtils){
	// module:
	//		dojox/app/controllers/Layout
	// summary:
	//		Bind "layout" and "select" events on dojox/app application instance.

	return declare("dojox.app.controllers.Layout", LayoutBase, {

		constructor: function(app, events){
			// summary:
			//		bind "layout" and "select" events on application instance.
			//
			// app:
			//		dojox/app application instance.
			// events:
			//		{event : handler}
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
			this.app.log("in app/controllers/Layout.layout event=",event);
			this.app.log("in app/controllers/Layout.layout event.view.parent.name=[",event.view.parent.name,"]");

			this.app.log("in app/controllers/Layout.layout event.view.constraint=",event.view.constraint);
        	var constraint = event.view.constraint || domAttr.get(event.view.domNode, "data-app-constraint") || "center";
			event.view.constraint = constraint;
			this.app.log("in Layout.js layout event.view.constraint set to ="+event.view.constraint);

			event.view.parent.domNode.appendChild(event.view.domNode);

			domAttr.set(event.view.domNode, "id", event.view.id);
			domAttr.set(event.view.domNode, "data-app-constraint", event.view.constraint);

			// set widget attributes
			// TODO here we are overriding the entire style of the node, instead of just width & height
			// maybe we could be a bit smarter
			//domAttr.set(event.view.domNode, "style", "width:100%; height:100%"); // I dont think this is needed
			
			if(event.callback){
				event.callback();
			}
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
			this.app.log("in Layout _doLayout called for view.id="+view.id+" view=",view);

			var fullScreenScene, children;
			//TODO: probably need to handle selectedChildren here, not just selected child...
			var selectedChild = this._getSelectedChild(view, view.constraint || "center");
			if(selectedChild && selectedChild.isFullScreen){
				console.warn("fullscreen sceen layout");
				/*
				 fullScreenScene=true;
				 children=[{domNode: selectedChild.domNode,constraint: "center"}];
				 query("> [constraint]",this.domNode).forEach(function(c){
				 if(selectedChild.domNode!==c.domNode){
				 dstyle(c.domNode,"display","none");
				 }
				 })
				 */
			}else{
				children = query("> [data-app-constraint]", view.domNode).map(function(node){
					var w = registry.getEnclosingWidget(node);
					if(w){
						w._constraint = domAttr.get(node, "data-app-constraint");
						return w;
					}

					return {
						domNode: node,
						_constraint: domAttr.get(node, "data-app-constraint")
					};
				});
				
				if(selectedChild){
					children = array.filter(children, function(c){
						// do not need to set display none here it is set in select.
						return c.domNode && c._constraint;
					}, view);
				}
			}
			// We don't need to layout children if this._contentBox is null for the operation will do nothing.
			if(view._contentBox){
				layoutUtils.layoutChildren(view.domNode, view._contentBox, children);
			}
		},

		_doResize: function(view, changeSize, resultSize){
			// summary:
			//		resize view.
			//
			// view: Object
			//		view instance needs to do layout.
			this.inherited(arguments);
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
			this.inherited(arguments);
		}
	});
});
