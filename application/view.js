define(["dojo", "dijit", "dojox", "dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin"],function(dojo,dijit,dojox,Widget,Container,Contained,TemplatedMixin,WidgetsInTemplateMixin){
	return dojo.declare("dojox.application.view", [Widget,TemplatedMixin,Container,Contained, WidgetsInTemplateMixin], {
		selected: false,
		keepScrollPosition: true,
		baseClass: "applicationView mblView",
		config:null,
		widgetsInTemplate: true,
		templateString: '<div></div>',
		toString: function(){return this.id},
		activate:function(){},
		deactivate: function(){},
		bindModels: function(){
		    if(this.models){
                        //TODO load models here. create dijit.newStatefulModel 
                        //using the configuration data for models
                        for(var item in this.models){
                            if(item.charAt(0)!=="_" && !this.models[item].model){
                                var params = this.models[item].params ? this.models[item].params:{};
                                var options = {
                                    "store": params.store.store,
                                    "query": params.store.query ? params.store.query : {}
                                };
                                        
                                this.models[item].model = dojox.mvc.newStatefulModel(options);
                            }
                        }
                    }
                
                    //TODO bind models

                        var widgets = dojo.query("div[dojoType^=\"dojox.mvc\"]", this.domNode);
                        //TODO set ref for each dojox.mvc widgets.
                        dojo.forEach(widgets, function(widget){
                            var ref = widget.getAttribute("model");
                                if(ref && this.models[ref]){
                                        dijit.byNode(widget).set("ref", this.models[ref].model);
                                }
                        },this);

		}
	});
});
