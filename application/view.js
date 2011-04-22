define(["dojo", "dijit", "dojox", "dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin"],function(dojo,dijit,dojox,Widget,Container,Contained,TemplatedMixin,WidgetsInTemplateMixin){
	return dojo.declare([Widget,TemplatedMixin,Container,Contained, WidgetsInTemplateMixin], {
		selected: false,
		keepScrollPosition: true,
		baseClass: "applicationView mblView",
		config:null,
		templateString: '<div dojoAttachPoint="domNode,containerNode" class="appView"></div>',
		constructor: function(params,node){
			//if (params.config && params.config.template){
			//	this.templateString=dojo.cache("",window.location.pathname + params.config.template);
			//}
		},
		toString: function(){return this.id},
		activate:function(){},
		deactivate: function(){}	
	});
});
