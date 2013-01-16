define(["dojo/_base/lang", "dojo/_base/declare", "dojo/sniff", "dojo/on", "dojo/when", "dojo/_base/window", "dojo/_base/array", 
	"dojo/_base/config", "dojo/topic", "dojo/query", "dojo/dom-style", "dojo/dom-attr", "dojo/dom-geometry", "dojox/app/controllers/LayoutBase",
	"dijit/layout/BorderContainer", "dijit/layout/StackContainer", "dijit/layout/ContentPane", "dijit/registry", "../Controller", "../layout/utils"],
function(lang, declare, has, on, when, win, array, config, topic, query, domStyle, domAttr, domGeom, LayoutBase, BorderContainer, 
	StackContainer, ContentPane, registry, Controller, layoutUtils){
	// module:
	//		dojox/app/controllers/BorderLayout
	// summary:
	//		Bind "layout" and "select" events on dojox/app application instance.

	return declare("dojox.app.controllers.BorderLayout", LayoutBase, {

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
			this.app.log("in app/controllers/BorderLayout.layout event=",event);
			this.app.log("in app/controllers/BorderLayout.layout event.view.parent.name=[",event.view.parent.name,"]");

			if(!this.app.borderLayoutCreated){
				this.app.borderLayoutCreated = true;
				bc = new BorderContainer({style:'height:100%;width:100%;border:1px solid black'});
				event.view.parent.domNode.appendChild(bc.domNode);  // put the border container into the parent (app)

            	var region = domAttr.get(event.view.domNode, "data-app-region") || domAttr.get(event.view.domNode, "region");
            	var configRegion = event.view.region;
				this.app.log("in BorderLayout.js layout configRegion="+configRegion+" and region="+region);
				
				bc.startup();
			}

			this.app.log("in app/controllers/BorderLayout.layout event.view.region=",event.view.region);			
        	var region = event.view.region;
			
			if(event.view.parent.id == this.app.id){  
				var reg = registry.byId(event.view.parent.id+"-"+region);			
				if(reg){  // already has a stackContainer, just create the contentPane for this one.
					cp1 = new ContentPane({id:event.view.id+"-cp-"+region});
					cp1.addChild(event.view); // important to add the widget to the cp before adding cp to BorderContainer for height
					reg.addChild(cp1);
					bc.addChild(reg);
				}else{
					if(!registry.byId(event.view.parent.id+"-"+region)){ // need a contentPane
							sc1 = new StackContainer({doLayout: false, region:region,  splitter:false, id:event.view.parent.id+"-"+region});
							cp1 = new ContentPane({id:event.view.id+"-cp-"+region});
							cp1.addChild(event.view); // should we use addChild or appendChild?
							sc1.addChild(cp1);
							bc.addChild(sc1);
					}											
				}
			}else{ // not a top level page transition.
				event.view.parent.domNode.appendChild(event.view.domNode);
			}
			
			domAttr.set(event.view.domNode, "id", event.view.id);
			
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
			// nothing to layout here since it was added to the right place in layout.
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
			var parent = event.parent || this.app;
			var view = event.view;

			if(!view){
				return;
			}
			var reg = registry.byId("app-"+event.view.region);
			var sc = registry.byId(event.view.parent.id+"-"+event.view.region);
			var cp = registry.byId(event.view.id+"-cp-"+event.view.region);
						
			var parentSelChild = this._getSelectedChild(parent, view.region); 
			if(view !== parentSelChild){
				if(sc && cp){
					sc.selectChild(cp);				
				}
				parent.selectedChildren[view.region] = view;
			}
			// do selected view layout
			this._doResize(parent);  // call for parent and view here, doResize will no longer call it for all children.
			this._doResize(view);  // try calling resize on the view, and in resize call it for the parent.
						
		//	this.inherited(arguments);
		}
		
	});

});
