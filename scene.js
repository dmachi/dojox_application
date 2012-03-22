define(["dojo/_base/declare",
	"dojo/_base/connect",
	"dojo/_base/window",
	"dojo/on",
	"dojo/_base/array",
	"dojo/_base/Deferred",
	"dojo/_base/lang",
	"dojo/_base/sniff",
	"dojo/dom-style",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dojo/query",
	"dijit/registry",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojox/css3/transit",
	"./model", 
	"./view", 
	"./bind",
    "./layout/utils"], 
	function(declare,connect,win,on,array,Deferred,dlang,has,dstyle,dgeometry,cls,dconstruct,dattr,query,registry,WidgetBase,Templated,WidgetsInTemplate,transit, model, baseView, bind,layoutUtils){
	
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

		resize: function(changeSize,resultSize){
			var node = this.domNode;

			// set margin box size, unless it wasn't specified, in which case use current size
			if(changeSize){
				dgeometry.setMarginBox(node, changeSize);

				// set offset of the node
				if(changeSize.t){ node.style.top = changeSize.t + "px"; }
				if(changeSize.l){ node.style.left = changeSize.l + "px"; }
			}

			// If either height or width wasn't specified by the user, then query node for it.
			// But note that setting the margin box and then immediately querying dimensions may return
			// inaccurate results, so try not to depend on it.
			var mb = resultSize || {};
			dlang.mixin(mb, changeSize || {});	// changeSize overrides resultSize
			if( !("h" in mb) || !("w" in mb) ){
				mb = dlang.mixin(dgeometry.getMarginBox(node), mb);	// just use dojo.marginBox() to fill in missing values
			}

			// Compute and save the size of my border box and content box
			// (w/out calling dojo.contentBox() since that may fail if size was recently set)
			var cs = dstyle.getComputedStyle(node);
			var me = dgeometry.getMarginExtents(node, cs);
			var be = dgeometry.getBorderExtents(node, cs);
			var bb = (this._borderBox = {
				w: mb.w - (me.w + be.w),
				h: mb.h - (me.h + be.h)
			});
			var pe = dgeometry.getPadExtents(node, cs);
			this._contentBox = {
				l: dstyle.toPixelValue(node, cs.paddingLeft),
				t: dstyle.toPixelValue(node, cs.paddingTop),
				w: bb.w - pe.w,
				h: bb.h - pe.h
			};

			// Callback for widget to adjust size of its children
			this.layout();
		},

		layout: function(){
			var fullScreenScene,children,hasCenter;
			//console.log("fullscreen: ", this.selectedChild && this.selectedChild.isFullScreen);
			if (this.selectedChild && this.selectedChild.isFullScreen) {
				console.warn("fullscreen sceen layout");
				/*
				fullScreenScene=true;		
				children=[{domNode: this.selectedChild.domNode,region: "center"}];
				dojo.query("> [region]",this.domNode).forEach(function(c){
					if(this.selectedChild.domNode!==c.domNode){
						dojo.style(c.domNode,"display","none");
					}
				})
				*/
			}else{
				children = query("> [region]", this.domNode).map(function(node){
					var w = registry.getEnclosingWidget(node);
					if (w){return w;}

					return {		
						domNode: node,
						region: dattr.get(node,"region")
					}
						
				});
				if (this.selectedChild){
					children = array.filter(children, function(c){
						if (c.region=="center" && this.selectedChild && this.selectedChild.domNode!==c.domNode){
							dstyle.set(c.domNode,"zIndex",25);
							dstyle.set(c.domNode,'display','none');
							return false;
						}else if (c.region!="center"){
							dstyle.set(c.domNode,"display","");
							dstyle.set(c.domNode,"zIndex",100);
						}
					
						return c.domNode && c.region;
					},this);

				//	this.selectedChild.region="center";	
				//	dojo.attr(this.selectedChild.domNode,"region","center");
				//	dojo.style(this.selectedChild.domNode, "display","");
				//	dojo.style(this.selectedChild.domNode,"zIndex",50);

				//	children.push({domNode: this.selectedChild.domNode, region: "center"});	
				//	children.push(this.selectedChild);
				//	console.log("children: ", children);
				}else{
					array.forEach(children, function(c){
						if (c && c.domNode && c.region=="center"){
							dstyle.set(c.domNode,"zIndex",25);
							dstyle.set(c.domNode,'display','none');
						}	
					});
				}
			
			}	
			// We don't need to layout children if this._contentBox is null for the operation will do nothing.
			if (this._contentBox) {
				layoutUtils.layoutChildren(this.domNode, this._contentBox, children);
			}
			array.forEach(this.getChildren(), function(child){ 
				if (!child._started && child.startup){
					child.startup(); 
				}

			});

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

				this.set("selectedChild", next);
				
				// If I am a not being controlled by a parent layout widget...
				var parent = this.getParent && this.getParent();
				if (!(parent && parent.isLayoutContainer)) {
					// Do recursive sizing and layout of all my descendants
					// (passing in no argument to resize means that it has to glean the size itself)
					this.resize();
					
					// Since my parent isn't a layout container, and my style *may be* width=height=100%
					// or something similar (either set directly or via a CSS class),
					// monitor when my size changes so that I can re-layout.
					// For browsers where I can't directly monitor when my size changes,
					// monitor when the viewport changes size, which *may* indicate a size change for me.
					this.connect(has("ie") ? this.domNode : win.global, 'onresize', function(){
						// Using function(){} closure to ensure no arguments to resize.
						this.resize();
					});
					
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

		_setSelectedChildAttr: function(child,opts){
			if (child !== this.selectedChild) { 
				return Deferred.when(child, dlang.hitch(this, function(child){
					if (this.selectedChild){
						if (this.selectedChild.deactivate){
							this.selectedChild.deactivate(); 
						}

						dstyle.set(this.selectedChild.domNode,"zIndex",25);
					}
		
					//dojo.style(child.domNode, {
					//	"display": "",
					//	"zIndex": 50,
					//	"overflow": "auto"
					//});
					this.selectedChild = child;
					dstyle.set(child.domNode, "display", "");
					dstyle.set(child.domNode,"zIndex",50);
					this.selectedChild=child;
					if (this._started) {	
						if (child.startup && !child._started){
							child.startup();
						}else if (child.activate){
							child.activate();
						}
		
					}
					this.layout();
				}));
			}
		},

		toString: function(){return this.id},

		activate: function(){},
		deactive: function(){}
	});
});
