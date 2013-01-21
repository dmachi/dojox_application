define(["dojo/_base/declare", "dojo/dom-attr", "dojox/app/controllers/LayoutBase","dijit/layout/BorderContainer",
		"dijit/layout/StackContainer", "dijit/layout/ContentPane", "dijit/registry"],
function(declare, domAttr, LayoutBase, BorderContainer, StackContainer, ContentPane, registry){
	// module:
	//		dojox/app/controllers/BorderLayout
	// summary:
	//		Will layout an application with a BorderContainer.  
	//		Each view to be shown in a region of the BorderContainer will be wrapped in a StackContainer and a ContentPane.
	//		

	return declare("dojox.app.controllers.BorderLayout", LayoutBase, {

		layout: function(event){
			// summary:
			//		Response to dojox/app "layout" event which is setup in LayoutBase.  
			//		The layout event is called once when the View is being created the first time.
			//
			// example:
			//		Use dojo/on.emit to trigger "layout" event, and this function will respond to the event. For example:
			//		|	on.emit(this.app.evented, "layout", view);
			//
			// event: Object
			// |		{"view": view, "callback": function(){}};
			this.app.log("in app/controllers/BorderLayout.layout event=",event);
			this.app.log("in app/controllers/BorderLayout.layout event.view.parent.name=[",event.view.parent.name,"]");

			if(!this.borderLayoutCreated){ // If the BorderContainer has not been created yet, create it.
				this.borderLayoutCreated = true;
				bc = new BorderContainer({style:'height:100%;width:100%;border:1px solid black'});
				event.view.parent.domNode.appendChild(bc.domNode);  // put the border container into the parent (app)

				bc.startup();  // startup the BorderContainer
			}

			this.app.log("in app/controllers/BorderLayout.layout event.view.constraint=",event.view.constraint);			
        	var constraint = event.view.constraint;  // constraint holds the region for this view, center, top etc. 
			
			if(event.view.parent.id == this.app.id){  // If the parent of this view is the app we are working with the BorderContainer
				var reg = registry.byId(event.view.parent.id+"-"+constraint);			
				if(reg){  // already has a stackContainer, just create the contentPane for this view and add it to the stackContainer.
					cp1 = new ContentPane({id:event.view.id+"-cp-"+constraint});
					cp1.addChild(event.view); // important to add the widget to the cp before adding cp to BorderContainer for height
					reg.addChild(cp1);
					bc.addChild(reg);
				}else{ // need a contentPane
					// this is where the region (constraint) is set for the BorderContainer's StackContainer
					// TODO: may need a way to make doLayout and splitter configurable
					sc1 = new StackContainer({doLayout: true, splitter:true, region:constraint, id:event.view.parent.id+"-"+constraint});
					cp1 = new ContentPane({id:event.view.id+"-cp-"+constraint});
					cp1.addChild(event.view); // should we use addChild or appendChild?
					sc1.addChild(cp1);
					bc.addChild(sc1);
				}
			}else{ // Not a top level page transition, so not changing a page in the BorderContainer, so handle it like Layout.
				event.view.parent.domNode.appendChild(event.view.domNode);
				domAttr.set(event.view.domNode, "data-app-constraint", event.view.constraint);
			}
			
			domAttr.set(event.view.domNode, "id", event.view.id);  // Set the id for the domNode
			
			if(event.callback){   // if the event has a callback, call it.
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
			//var reg = registry.byId("app-"+event.view.constraint);
			var sc = registry.byId(event.view.parent.id+"-"+event.view.constraint);
			var cp = registry.byId(event.view.id+"-cp-"+event.view.constraint);
						
			var parentSelChild = this._getSelectedChild(parent, view.constraint); 
			if(view !== parentSelChild){
				if(sc && cp){
					sc.selectChild(cp);				
				}
				parent.selectedChildren[view.constraint] = view;
			}
			// do selected view layout
			// Do not need to call _doResize when setting doLayout: true on the StackContainer
			// If doLayout is set to false the calls below should be made
			//	this._doResize(view);    // call for parent and view here, doResize will no longer call it for all children.
			//	this._doResize(parent);  
		}
		
	});

});
