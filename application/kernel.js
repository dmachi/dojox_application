define(["dojo","dijit","dojox","dojo/fx","dojox/json/ref","dojo/parser","dojox/application/scene","dijit/_WidgetBase","dijit/layout/_LayoutWidget","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin","dojox/application/transition"],function(dojo,dijit,dijox,fx,jsonRef,parser,sceneCtor,widget,LayoutWidget,templatedMixin,widgetsInTemplateMixin,transition){
	return dojo.declare([widget,LayoutWidget,templatedMixin,widgetsInTemplateMixin], {
		constructor: function(){
			this.scenes={};
			this._readyDef=new dojo.Deferred();
			this.ready=this._readyDef.promise;	
		},
		config: null,
		templateString: "<div></div>",
		selectedScene: null,
		buildRendering: function(){
			if (this.srcNodeRef===dojo.body()){
				this.srcNodeRef = dojo.create("DIV",{},this.srcNodeRef);
			}
			this.inherited(arguments);
		},
	
		loadScene: function(scene){
			console.log("loadScene(): ", this.config);
			if (!scene) { scene=(this.config && this.config.defaultScene)?this.config.defaultScene:"default" };

			if (this.scenes[scene]){
				return this.scenes[scene];
			}

			if (this.config.scenes && this.config.scenes[scene]){
				var ctor = sceneCtor;
				var s =  this.config.scenes[scene];

				// see if the scene wants to override the class 
				// instance we use to instantiate teh scene with
				// which otherwise defaults to dojox/application/scene
				if (s.type){
					ctor = dojo.getObject(s);	
				}
				console.log("Instantiating new scene: ", scene,this.config.scenes[scene]);
				this.scenes[scene]=new sceneCtor({config: this.config.scenes[scene].params});
				this.addChild(this.scenes[scene]);
				return this.scenes[scene];
			}
		
			throw Error("Scene '" + scene + "' not found.");
		},

		startup: function(node){
			console.log('app startup', this);
			this.inherited(arguments);

			console.log("this._defaultScene: ", this._defaultScene);
			this.transition("@" + (this._defaultScene || this.config.defaultScene),{transition: "flip"});

			this._readyDef.resolve(true);
		},

		layout: function(){
			console.log('app layout');
			var fullScreenScene,children,hasCenter;
			console.log("fullscreen: ", this.selectedScene && this.selectedScene.isFullScreen);
			if (this.selectedScene && this.selectedScene.isFullScreen) {
				/*
				console.log("fullscreen sceen layout");
				fullScreenScene=true;		
				children=[{domNode: this.selectedScene.stageNode,region: "center"}];
				dojo.query("> [region]",this.domNode).forEach(function(c){
					if(this.selectedScene.stageNode!==c.domNode){
						dojo.style(c.domNode,"display","none");
					}
				})
				*/
			}else{
				console.log("regular layout");
				children = dojo.query("> [region]", this.domNode).map(function(node){
						
					return dijit.byNode(node)||{
						domNode: node,
						region: node?dojo.attr(node,"region"):""
					}
						
				});

				children = dojo.filter(children, function(c){
					if (c.region=="center" && this.selectedScene && this.selectedScene.stageNode!==c.domNode){
						hasCenter=true;
						return false;
					}else if (c.region!="center"){
						dojo.style(c.domNode,"display","");
					}
					if (c.region=="center"){hasCenter=true}

					return c.domNode && c.region;
				});

				if (!hasCenter){
					if (this.selectedScene){
						dojo.attr(this.selectedScene.stageNode,"region","center");
						dojo.style(this.selectedScene.stageNode, "display", "");
						children.push({domNode: this.selectedScene.stageNode, region: "center"});	
						if (this.dummyScene){
							dojo.style(this.dummyScene.domNode, "display", "none");
						}
					}else{
						if (!this.dummyScene){
							this.dummyScene = {domNode: dojo.create("div",{"id": this.id + "dummyclient","region":"center"},this.domNode),region:"center"};
						}

						dojo.style(this.dummyScene.domNode,"display","");
						children.push(this.dummyScene);
					}
				}
			}			
			console.log('children: ', children);	
			dijit.layout.layoutChildren(this.domNode, this._contentBox, children);
		},

		addChild: function(child,position){
			// summary:
			//	adds (stages) a scene in the application
			var stageNode = dojo.create("div",{region: "center"},this.domNode);
			stageNode.appendChild(child.domNode);							
			child.stageNode = stageNode;
			if (!this.selectedScene){
				this.set("selectedScene",child);			
			}else{
				stageNode.style = this.selectedScene.stageNode.getAttribute("style");		
			}
		},

		_setSelectedSceneAttr: function(scene,opts){
			console.log('setSelectedScene');

			if (scene && (scene !== this.selectedScene) ){
				if (this.selectedScene){
					dojo.style(this.selectedScene.stageNode, "display", "none");
				}
			
				dojo.style(scene.stageNode, "display", "");
				this.selectedScene=scene;
				this.layout();
			
				if (scene.startup && !scene._started){
					console.log("startup");
					scene.startup();
				}
			}
		},

		transition: function(transitionTo,opts){
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

			var current = this.selectedScene;
			
			if (transitionTo){
				var parts = transitionTo.split("@");
				var toView=parts[0];
				var toScene=parts[1];
				var next = this.loadScene(toScene);
				console.log("transition toScene: ", toScene);
			}else{
				var next = this.loadScene();
			}

			if (!current){
				if (!this.dummyScene){
					this.dummyScene = {domNode: dojo.create("div",{"id": this.id + "dummyclient","region":"center"},this.domNode),region:"center"};
				}

				current = {stageNode: this.dummyScene.domNode};
			}	

			console.log("do the transition: ", this.selectedScene.stageNode, next.stageNode);
			if (next && next.startup && !next._started){
				next.startup();
			}
		
			transition(current.stageNode,next.stageNode,{transition: "slide"});				
			this.set("selectedScene", next);
		}
	});
});
