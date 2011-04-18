define(["dojo","dijit","dojox","dojo/fx","dojox/json/ref","dojo/parser","dojox/application/scene","dojox/application/templatedLayout","dojox/application/transition"],function(dojo,dijit,dijox,fx,jsonRef,parser,sceneCtor,LayoutWidget,transition){
	return dojo.declare([LayoutWidget], {
		constructor: function(){
			this.scenes={};

		},
		config: null,
		templateString: "<div></div>",
		selectedScene: null,
		baseClass: "dojoxApp",
		buildRendering: function(){
			if (this.srcNodeRef===dojo.body()){
				this.srcNodeRef = dojo.create("DIV",{},this.srcNodeRef);
			}
			this.inherited(arguments);
		},
	
		loadScene: function(scene,defaultView){
			console.log("application::loadScene() config:", this.config);
			if (!scene) { scene=(this.config && this.config.defaultScene)?this.config.defaultScene:"default" };
			console.log("Loading Scene: ", scene);
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
				this.scenes[scene]=new sceneCtor({id: this.id + "_scene_" + scene, defaultView: defaultView || sceneCtor.prototype.defaultView, config: this.config.scenes[scene].params, sceneId: scene});
				this.addChild(this.scenes[scene]);
				return this.scenes[scene];
			}
		
			throw Error("Scene '" + scene + "' not found.");
		},

		startup: function(node){
			console.log('application::startup()', this);
			this.inherited(arguments);

			console.log("this._defaultScene: ", this._defaultScene);
			this.resize();
			this.transition("@" + (this._defaultScene || this.config.defaultScene),{transition: "flip"});

		},

		layout: function(){
			//console.log('app layout');
			var fullScreenScene,children,hasCenter;
			//console.log("fullscreen: ", this.selectedScene && this.selectedScene.isFullScreen);
			if (this.selectedScene && this.selectedScene.isFullScreen) {
				console.warn("fullscreen sceen layout");
				/*
				fullScreenScene=true;		
				children=[{domNode: this.selectedScene.domNode,region: "center"}];
				dojo.query("> [region]",this.domNode).forEach(function(c){
					if(this.selectedScene.domNode!==c.domNode){
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
					if (c.region=="center" && this.selectedScene && this.selectedScene.domNode!==c.domNode){
						dojo.style(c.domNode,"z-index",25);
						dojo.style(c.domNode,'display','none');
						return false;
					}else if (c.region!="center"){
						dojo.style(c.domNode,"display","");
						dojo.style(c.domNode,"z-index",100);
					}
				
					return c.domNode && c.region;
				});

				if (this.selectedScene){
					dojo.attr(this.selectedScene.domNode,"region","center");
					dojo.style(this.selectedScene.domNode, "display","");
					dojo.style(this.selectedScene.domNode,"z-index",50);

					children.push({domNode: this.selectedScene.domNode, region: "center"});	
				}
			}			
			//console.log('application::layout() children: ', children);	
			this.layoutChildren(this.domNode, this._contentBox, children);
			//console.log("application::layout() complete");
		},
		addChild: function(child,position){
			// summary:
			//	adds (stages) a scene in the application
			child.region="center";
			this.inherited(arguments);
		},

		_setSelectedSceneAttr: function(scene,opts){
			console.log('application::setSelectedScene()');

			if (scene && (scene !== this.selectedScene) ){
				if (this.selectedScene){
					this.selectedScene.deactivate(); 
					console.log("_setSelectedSceneAttr() hide current selectedScene", this.selectedScene);
					//dojo.style(this.selectedScene.domNode, "display", "none");
					dojo.style(this.selectedScene.domNode,"zIndex",25);
				}
			
				dojo.style(scene.domNode, "display", "");
				dojo.style(scene.domNode,"zIndex",50);
				this.selectedScene=scene;
	
				if (this._started) {	
					if (scene.startup && !scene._started){
						console.log("startup");
						scene.startup();
					}else{
						scene.activate();
					}
	
				}
				this.layout();
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
			console.log("Application::transtion()");
			var next, current = this.selectedScene;
			
			if (transitionTo){
				var parts = transitionTo.split("@");
				var toView=parts[0];
				var toScene=parts[1];
				if (toView && !toScene){
					if (this.selectedScene){
						window.history.replaceState({},this.selectedScene.sceneId,"#"+toView + "@" + this.selectedScene.sceneId);
						if (toView && this.selectedScene.transition){
							this.selectedScene.transition(toView,opts);	
						}
						return;
					}else{
						next = this.loadScene();
					}	
				}else{
					next = this.loadScene(toScene, toView);
				}

				
				console.log("application::transition() toScene: ", toScene, next);
			}else{
				console.log("application::transition() no toScene provided");
				next = this.loadScene();
				console.log("next: ", next);
			}

			if (!current){
				this.set("selectedScene", next);
				return;
			}	

			if (next!==current){
			
				dojo.style(next.domNode, "display","");
				dojo.style(next.domNode, "zIndex", 50);
				dojo.style(current.domNode, "zIndex", 25);

				console.log("transition: ", current.domNode, next.domNode);		
				this.set("selectedScene",next);
				var def = transition(current.domNode,next.domNode,dojo.mixin({},opts,{transition: "flip"})).then(dojo.hitch(this, function(){
					console.log("scene animations are completed, set scene");
					dojo.style(current.domNode, "display", "none");
					if (toView && next.transition){
						return next.transition(toView,opts);
					}
		
				}));

				return def.promise;		
			}

			if (toView && next.transition){
				return next.transition(toView,opts);
			}
		}
	});
});
