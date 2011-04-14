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
				return this.scenes[scene]=new sceneCtor({config: this.config.scenes[scene].params});
			}
		
			throw Error("Scene '" + scene + "' not found.");
		},

		startup: function(node){
			console.log('app startup', this);
			this.inherited(arguments);

			this.addChild(this.loadScene());
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
			if (!this.selectedScene){
				this.set("selectedScene", child);
				this.layout();					
			}
			
		},
		_setSelectedSceneAttr: function(scene){
			if (scene){
				this.selectedScene=scene;
				this.selectedScene.startup();
			}
		}
	});
});
