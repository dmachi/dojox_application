define(["dojo","dijit","dojox","dojo/fx","dojox/json/ref","dojo/parser","dojox/application/scene","dojox/application/base","dojox/application/transition"],function(dojo,dijit,dijox,fx,jsonRef,parser,sceneCtor,LayoutWidget,transition){
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
	
		loadScene: function(scene){
			console.log("application::loadScene() config:", this.config);
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
				this.scenes[scene]=new sceneCtor({config: this.config.scenes[scene].params});
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
			console.log('app layout');
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
						dojo.attr(this.selectedScene.domNode,"region","center");
						dojo.style(this.selectedScene.domNode, "display", "");
						children.push({domNode: this.selectedScene.domNode, region: "center"});	
						//if (this.dummyScene){
						//	dojo.style(this.dummyScene.domNode, "display", "none");
						//}
					}//else{
						//if (!this.dummyScene){
						//	this.dummyScene = {domNode: dojo.create("div",{"id": this.id + "dummyclient","region":"center"},this.domNode),region:"center"};
						//}

						//dojo.style(this.dummyScene.domNode,"display","");
						//children.push(this.dummyScene);
					//}
				}
			}			
			console.log('application::layout() children: ', children);	
			this.layoutChildren(this.domNode, this._contentBox, children);
			console.log("application::layout() complete");
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
					dojo.style(this.selectedScene.domNode, "display", "none");
				}
			
				dojo.style(scene.domNode, "display", "");
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
			var current = this.selectedScene;
			
			if (transitionTo){
				var parts = transitionTo.split("@");
				var toView=parts[0];
				var toScene=parts[1];
				var next = this.loadScene(toScene);
				console.log("application::transition() toScene: ", toScene);
			}else{
				console.log("application::transition() no toScene provided");
				var next = this.loadScene();
			}

			if (!current){
				this.set("selectedScene", next);
				return;
			}	

			console.log("application::transition() post begin animation", toView, next);	
			if (toView && next.transition){
				next.transition(toView,opts);	
			}
			
			if(current !== next){// only switches scenes when necessary
			    //Since the animation is non-blocking in javascript, we need to register
			    //the call back after animation of scene switch to set the selectedScene.
			    var _conn = dojo.connect(next.domNode, "webkitAnimationEnd", this, function(){
			        this.set("selectedScene", next);
			        dojo.disconnect(_conn);
			    });
			    
			    transition(current.domNode,next.domNode,{transition: "slide"});
			}
			
		}
	});
});
