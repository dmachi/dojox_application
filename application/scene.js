define(["dojo", "dijit", "dojox", "dojox/application/view","dojo/parser","dijit/_WidgetBase","dijit/layout/_LayoutWidget","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin"], function(dojo,dijit,dojox,baseView,parser,Widget,LayoutWidget,TemplatedMixin,WidgetsInTemplateMixin){
	return dojo.declare([Widget,TemplatedMixin,LayoutWidget, WidgetsInTemplateMixin], {
		config: null,
		selectedView: null,

		isFullScreen: false,
		constructor: function(params,srcRefNode){
			this.views={};
			this.models=[];

			if (params.fullScreen){
				this.isFullScreen=params.fullScreen;
			}

			if (params.config && params.config.template){
				console.log("overriding templateString");
				this.templateString=dojo.cache("",window.location.pathname + params.config.template);
			}	
		},

		templateString: "<div dojoAttachPoint='containerNode'></div>",
		startup: function(){
			console.log('scene startup');
			this.inherited(arguments);
			this.loadViews();	
			this.set('selectedView',this.selectedView);
		},

		buildRendering: function(){
			console.log(this.templateString);
			this.inherited(arguments);
		},

		layout: function(){
			var children = dojo.query("> [region]", this.domNode).map(function(node){
				return dijit.byNode(node) || {
					domNode: node,
					region: dojo.attr(node, "region")
				}
			});
			dijit.layout.layoutChildren(this.domNode, this._contentBox, children);
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

		loadViews: function(){
			console.log("loadViews: ", this.config.views);
			dojo.forEach(this.config.views, function(view){
				var ctor = baseView;
				if (view.type){
					ctor=dojo.getObject(view.type)
				}
				console.log("view: ", view);
				this.addChild(new ctor({config: view.view.params}));
			}, this);

			console.log("Scene views: ", this.views, this.selectedView);
			
		},

		addChild: function(child){
			console.log("scene addChild: ", child);
			dojo.style(child.domNode,"display", "none");
			this.views[child.id]=child;
			dojo.place(child.domNode, this.containerNode,"last");
			if (!this.selectedView) {
				this._setSelectedView(child);
		
			}
		},

		_setSelectedView:function(view){
			console.log("this _setSelectedView", view, this._started);
			this.selectedView=view;
			if (this._started){
				dojo.style(view.domNode,"visibility", "visible");
				dojo.style(view.domNode,"display", "");
				console.log("call vie startup");
				view.startup();
				this.layout();
			}
		},

		loadView: function(id){
			console.log("laod view: ", id);
			if(!id){return;}
	
			if (this.views[id]){
				return this.view[id];
			}

			view = this.config.views[id];	

			var ctor = baseView;

			var type=view.type || view.view.type || "";

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
			return new ctor(params);
		}
	});
});
