define(["dojo/_base/declare",
	"dojo/_base/connect",
	"dojo/_base/window",
	"dojo/on",
	"dojo/_base/array",
	"dojo/_base/Deferred",
	"dojo/_base/lang",
	"dojo/_base/sniff",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"./model", 
	"./view", 
	"./bind"],
	function(declare,connect,win, on, array,deferred,dlang,has,dstyle,cls,dconstruct,dattr,WidgetBase,Templated,WidgetsInTemplate, model, baseView, bind){

	return declare("dojox.app.scene", [WidgetBase, Templated, WidgetsInTemplate], {
		isContainer: true,
		widgetsInTemplate: true,
		defaultView: "default",

		selectedChild: null,
		baseClass: "scene mblView",
		isFullScreen: false,
		defaultViewType: baseView,
		
		//Temporary work around for getting a null when calling getParent
//		getParent: function(){return null;},


		constructor: function(params,node){
			this.children={};
			if(params.parent){
				this.parent=params.parent
			}
			if(params.app){
				this.app = params.app;
			}
		},

		buildRendering: function(){
			this.inherited(arguments);
			dstyle.set(this.domNode, {width: "100%", "height": "100%"});
			cls.add(this.domNode,"dijitContainer");
		},

		splitChildRef: function(childId){
			var id = childId.split(",");
			if (id.length>0){
				var to = id.shift();
			}else{
				console.warn("invalid child id passed to splitChildRef(): ", childId);
			}

			return {
				id:to || this.defaultView,
				next: id.join(',') 
			}
		},


		getChildren: function(){
			return this._supportingWidgets;
		},

		// Get application's dojo.Evented instance
		// This is a temporary method and will be removed when view is changed to object.
		// we need this method to get the application's dojo.Evented instance because scene is a child of application and not has the application instance.
		getApplicationEvented: function(){
			var parent = this;
			do{
				if(parent.evented){
					return parent.evented;
				}
				parent = parent.parent;
			}while(parent)
			return null;
		},

		startup: function(){
			if(this._started){ return; }
			this._started=true;

			var parts = this.defaultView?this.defaultView.split(","):"default";
			var toId, subIds;
			toId= parts.shift();
			subIds = parts.join(',');

			if(this.views[this.defaultView] && this.views[this.defaultView]["defaultView"]){
				subIds =  this.views[this.defaultView]["defaultView"];
			}	
			
			if(this.models && !this.loadedModels){
				//if there is this.models config data and the models has not been loaded yet,
				//load models at here using the configuration data and load model logic in model.js
				this.loadedModels = model(this.models);
				bind(this.getChildren(), this.loadedModels);
			}
			
			//startup assumes all children are loaded into DOM before startup is called
			//startup will only start the current available children.
			var cid = this.id + "_" + toId;
            if (this.children[cid]) {
				var next = this.children[cid];

				var evented = this.getApplicationEvented();
				on.emit(evented, "select", {"parent":this, "view":next});

				// If I am a not being controlled by a parent layout widget...
				var parent = this.getParent && this.getParent();
				if (!(parent && parent.isLayoutContainer)) {
					// Do recursive sizing and layout of all my descendants
					// (passing in no argument to resize means that it has to glean the size itself)
//					this.resize();
					on.emit(evented, "resize", this);

					// Since my parent isn't a layout container, and my style *may be* width=height=100%
					// or something similar (either set directly or via a CSS class),
					// monitor when my size changes so that I can re-layout.
					// For browsers where I can't directly monitor when my size changes,
					// monitor when the viewport changes size, which *may* indicate a size change for me.
//					this.connect(has("ie") ? this.domNode : win.global, 'onresize', function(){
//						// Using function(){} closure to ensure no arguments to resize.
//						on.emit(evented, "resize", this);
//					});
				}
				
				array.forEach(this.getChildren(), function(child){
					child.startup();
				});

				//transition to _startView
              if (this._startView && (this._startView != this.defaultView)) {
				  var evented = this.getApplicationEvented();
				  on.emit(evented, "transition", {"target":this._startView, "opts":{}});
              }
			}
		},

		addChild: function(widget){
			cls.add(widget.domNode, this.baseClass + "_child");
			widget.region = "center";;
			dattr.set(widget.domNode,"region","center");
			this._supportingWidgets.push(widget);
			dconstruct.place(widget.domNode,this.domNode);
			this.children[widget.id] = widget;
			return widget;
		},

		removeChild: function(widget){
			// summary:
			//		Removes the passed widget instance from this widget but does
			//		not destroy it.  You can also pass in an integer indicating
			//		the index within the container to remove

			if(widget){
				var node = widget.domNode;
				if(node && node.parentNode){
					node.parentNode.removeChild(node); // detach but don't destroy
				}
				return widget;
			}
		},

		toString: function(){return this.id},

		activate: function(){},
		deactivate: function(){}
	});
});
