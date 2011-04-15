define(["dojo","dijit","dojox","dojo/fx","dojox/json/ref","dojo/parser","dojox/application/scene","dijit/_WidgetBase","dijit/layout/_LayoutWidget","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin"],function(dojo,dijit,dijox,fx,jsonRef,parser,sceneCtor,widget,LayoutWidget,templatedMixin,widgetsInTemplateMixin){
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

			this.transition();

			this._readyDef.resolve(true);
		},

		layout: function(){
			console.log('layout');
			var children = dojo.query("> [region]", this.domNode).map(function(node){
				return dijit.byNode(node) || {
					domNode: node,
					region: dojo.attr(node, "region")
				}
			});
			dijit.layout.layoutChildren(this.domNode, this._contentBox, children);
		},

		addChild: function(child,position){
			dojo.place(child.domNode, this.containerNode);
		},

		_setSelectedSceneAttr: function(scene,opts){
			if (scene){
				this.selectedScene=scene;
			}
			this.layout();

			if (scene && scene.startup && !scene._started){
				scene.startup();
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

			if (transitionTo){
				var parts = transitionTo.split("@");
				var toView=parts[0];
				var toScene=parts[1];
				var to = this.loadScene(toScene);
				console.log("transition toScene: ", toScene);
			}else{
				var to = this.loadScene();
			}
	
			if (this.selectedScene){	
				dojo.style(this.selectedScene.domNode, "display", "none");
			}
			console.log("to: ", to);
			//dojo.style(to.domNode, "display", "");
			//dojo.style(to.domNode, "visibility", "visible");

			this.set("selectedScene",to);
		}
	});
});
