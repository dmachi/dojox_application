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
		/*		var reg = registry.byId("app-"+region);
				if(reg && region == "center"){
					reg.addChild(event.view);
					//reg.set("content", event.view);
				}else if(reg && reg.domNode.children.length > 0){
					reg.addChild(event.view);
					//reg.set("content", event.view);			
				}else{
					cp1 = new ContentPane({region:region,  splitter:false, id:"app-"+region});
					cp1.addChild(event.view); // important to add the widget to the cp before adding cp to BorderContainer for height
					//cp1.set("content", event.view);
					bc.addChild(cp1);
				}
		*/		
		//		if(reg && reg.hasChildren()){  // already has a view, remove it and add the new one
		//			reg.removeChild(reg.getChildren()[0]);
		//			reg.addChild(event.view);
		//		}else{
				var reg = registry.byId(event.view.parent.id+"-"+region);			
				if(reg){  // already has a stackContainer, just create the contentPane for this one.
					//cp1 = new ContentPane({region:region,  splitter:false, id:"app-"+region});
					cp1 = new ContentPane({id:event.view.id+"-cp-"+region});
					cp1.addChild(event.view); // important to add the widget to the cp before adding cp to BorderContainer for height
					//cp1.set("content", event.view);
					//bc.addChild(cp1);
					reg.addChild(cp1);
					bc.addChild(reg);
				}else{
				//	if(!event.view.parent.wrapChildViewsInContentPanes){ // wrapChildViewsInContentPanes is set in the config to indicate that a ContentPane and should be used to add the child views
						if(registry.byId(event.view.parent.id+"-"+region)){
						//	registry.byId(event.view.parent.id+"-"+region).domNode.appendChild(event.view.domNode);
						}else{ // need a contentPane
							sc1 = new StackContainer({doLayout: false, region:region,  splitter:false, id:event.view.parent.id+"-"+region});
							//cp1 = new ContentPane({region:region,  splitter:false, id:event.view.parent.id+"-"+region});
							cp1 = new ContentPane({id:event.view.id+"-cp-"+region});
							cp1.addChild(event.view); // should we use addChild or appendChild?
							sc1.addChild(cp1);
							//cp1.domNode.appendChild(event.view.domNode);
							bc.addChild(sc1);
							//event.view.parent.addChild(sc1);  //???? is this right?
						}
											
				/*	}else{
						//event.view.parent.domNode.appendChild(event.view.domNode);
					}
				*/	
				}
			}else{ // not a top level page transition.
				event.view.parent.domNode.appendChild(event.view.domNode);
		/*		if(!event.view.parent.wrapChildViewsInContentPanes){ // wrapChildViewsInContentPanes is set in the config to indicate that a ContentPane and should be used to add the child views
					if(registry.byId(event.view.parent.id+"-"+region)){
				//		registry.byId(event.view.parent.id+"-"+region).domNode.appendChild(event.view.domNode);
					}else{ // need a contentPane
						sc1 = new StackContainer({doLayout: false, region:region,  splitter:false, id:event.view.parent.id+"-"+region});
						//cp1 = new ContentPane({region:region,  splitter:false, id:event.view.parent.id+"-"+region});
						cp1 = new ContentPane({id:event.view.id+"-cp-"+region});
						cp1.addChild(event.view); // should we use addChild or appendChild?
						sc1.addChild(cp1);
						//cp1.domNode.appendChild(event.view.domNode);
						//event.view.parent.addChild(sc1);  //???? is this right?
						bc.addChild(sc1);
					}					
				}else{
				//	event.view.parent.domNode.appendChild(event.view.domNode);
				}
			*/	
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
			
			if(reg && reg.domNode.children.length > 0){  // already has a view, remove it and add the new one
		//		reg.removeChild(reg.domNode.children[0]);
		//		reg.addChild(event.view);
		//	} else{
		//		reg.addChild(event.view);
			}
			
			var parentSelChild = this._getSelectedChild(parent, view.region); 
			if(view !== parentSelChild){
				if(parentSelChild){
					//reg.removeChild(parentSelChild);
				//	domStyle.set(parentSelChild.domNode, "zIndex", 25);
				//	domStyle.set(parentSelChild.domNode, "display", "none");
				}
				if(sc && cp){
					sc.selectChild(cp);				
				}
			//	domStyle.set(view.domNode, "display", "");
			//	domStyle.set(view.domNode, "zIndex", 50);
				parent.selectedChildren[view.region] = view;
			}
			// do selected view layout
			this._doResize(parent);
			
			
		//	this.inherited(arguments);
		}
		
	});

});
