define(["dojo", "dijit", "dojox", "dojox/application/view","dojo/parser","dojox/application/templatedLayout","dojox/application/transition"], function(dojo,dijit,dojox,baseView,parser,templatedLayout,transition){
	return dojo.declare([templatedLayout], {
		config: null,
		selectedView: null,
		baseClass: "dojoxAppScene",
		isFullScreen: false,
		constructor: function(params,srcRefNode){
			this.views={};
			this.models=[];

			if (params.fullScreen){
				this.isFullScreen=params.fullScreen;
			}

			if (params.config && params.config.template){
				this.templateString=dojo.cache("",window.location.pathname + params.config.template);
			}	
		},

		templateString: "<div dojoAttachPoint='domNode,containerNode'></div>",
		startup: function(){
			console.log('scene::startup()');
			this.inherited(arguments);
			console.log('scene::startup() call resize()');
			this.resize()

			console.log('scene::startup() call transition()');	
			this.transition(this._defaultView || this.config.defaultView,{transition: "slide"});
		},

		layout: function(){
			//console.log('scene::layout()',this.domNode.style.height, "cb: ", this._contentBox);

			var fullScreenView,children,hasCenter,needsStartup=[];
			//console.log("fullscreen: ", this.selectedView && this.selectedView.isFullScreen);
			if (this.selectedView && this.selectedView.isFullScreen) {
				/*
				console.log("fullscreen sceen layout");
				fullScreenView=true;		
				children=[{domNode: this.selectedView.domNode,region: "center"}];
				dojo.query("> [region]",this.domNode).forEach(function(c){
					if(this.selectedView.domNode!==c.domNode){
						dojo.style(c.domNode,"display","none");
					}
				})
				*/
			}else{
				children = dojo.query("> [region]", this.domNode).map(function(node){
						
					return dijit.byNode(node)||{
						domNode: node,
						region: node?dojo.attr(node,"region"):""
					}
						
				});

				children = dojo.filter(children, function(c){
					if (c.region=="center" && this.selectedView&& this.selectedView.domNode!==c.domNode){
						dojo.style(c.domNode,"display","none");
						dojo.style(c.domNode, "zIndex", 25);
						return false;
					}else if (c.region!="center"){
						dojo.style(c.domNode,"display","");
						dojo.style(c.domNode, "zIndex", 50);
					}
					return c.domNode && c.region;
				});

				//console.log("scene::layout() this.domNode height: ", this.domNode.style.height);

				if (this.selectedView){
					dojo.attr(this.selectedView.domNode,"region","center");
					this.selectedView.region="center";
					dojo.style(this.selectedView.domNode, "display", "");
					dojo.style(this.selectedView.domNode, "zIndex", 50);
					children.push({domNode: this.selectedView.domNode, region: "center"});	
				}
			}			
			//console.log('scene children: ', children);	
			this.layoutChildren(this.domNode, this._contentBox, children);
		},

		activate: function(){
			//summary: 
			// called when this scene becomes active and is going to be made visible
		},

		deactivate: function(){
			//summary: 
			// called when this scene is visible and is going to be hidden and disabled (not necessarily destroyed)
		},

		bind: function(){
			console.log("bind models to views: ", this.models);
			dojo.forEach(this.models, function(model){
				for (var i in this.views){
					if (model["bind"]){	
						model.bind(this.views[i]);
					}
				}
			},this);
		},

		loadModels: function(){
			console.log("loadViews: ", this.config.models);
			dojo.forEach(this.config.models, function(model){
				this.models.push(this.loadModel(model))
			}, this);

		},

		loadModel: function(model){
			//TODO instantiate the model and return 
			return {}	
		},

		addChild: function(child,position){
			// summary:
			//	adds (stages) a scene in the application
			child.region="center";
			this.inherited(arguments);
		},

		_setSelectedViewAttr: function(view,opts){
			console.log('setSelectedVew');

			if (view && (view !== this.selectedView) ){
				if (this.selectedView){
					//this.selectedView.deactivate(); 
					//dojo.style(this.selectedView.domNode, "display", "none");
					dojo.style(this.selectedView.domNode,"zIndex", 25);
				}
			
				dojo.style(view.domNode, "display", "");
				dojo.style(view.domNode,"zIndex", 50);
				dojo.style(view.domNode,"overflow", "auto");
				this.selectedView=view;
		
				if (this._started) {	
					if (view.startup && !view._started){
						console.log("startup");
						view.startup();
					}else{
						//view.activate();
					}

				}
				this.layout();
			}
		},


		loadView: function(id){
			console.log("laod view: ", id);
			
			if(!id){
				id = this.config.defaultView || "default";
			}
	
			if (this.views[id]){
				return this.views[id];
			}

			console.log("this.config: ", this.config);

			view = this.config.views[id];	
			
			var ctor = baseView;

			var type= view.type || view.view.type || "";

			if (type){
				ctor = dojo.getObject(type);
			}

			if (!ctor){console.warn("View type: ", type, "not found.");return;}

			var params = {};

			if (view.view.params){
				dojo.mixin(params,view.view.params);
			}

			if(view.params){
				dojo.mixin(params,view.params); 
			}

			params.id = view.id;
			console.log("view params: ", params);
			this.views[id] = new ctor({id:this.id+"_"+id, config:params});
			this.addChild(this.views[id]);
			return this.views[id]
			
		},

		transition: function(view,opts){
			//summary: 
			//  transitions from the currently visible scene to the defined scene.
			//  it should determine what would be the best transition unless
			//  an override in opts tells it to use a specific transitioning methodology
			//  the transitionTo is a string in the form of [view]@[scene].  If
			//  view is left of, the current scene will be transitioned to the default
			//  view of the specified scene (eg @scene2), if the scene is left off
			//  the app controller will instruct the active scene to the view (eg view1).  If both
			//  are supplied (view1@scene2), then the application should transition to the scene,
			//  and instruct the scene to navigate to the view.

			console.log("scene::transition() view: ", view, opts, this.selectedView);
			var current = this.selectedView;
			
			var next = this.loadView(view || "");
	
			if (!current){
				console.log("scene::transition() !current, set view directly");
				this.set("selectedView",next);	
				return;
			}	

			dojo.style(next.domNode, "display","");
			dojo.style(next.domNode, "zIndex", 50);
			dojo.style(current.domNode, "zIndex", 25);

			console.log("select::transition(): ", this.selectedView, next);

			this.set("selectedView",next);
			if (current.domNode !==next.domNode){
				return transition(current.domNode,next.domNode,dojo.mixin({},opts,{transition: "slide"})).then(dojo.hitch(this, function(){
					dojo.style(current.domNode, "display", "none");
					console.log("View Animations complete, set view");
				}));		
			}
	
		}
	});
});
