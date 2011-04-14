define(["dojo","dojox/application"],function(dojo,Application){
	app = new Application({
			"id": "test",
			"name": "Test",
			"description": "A Test Application",
			"splash": "splash",

			// Modules for the application.  The are basically used as the second
			// array of mixins in a dojo.declare().  Modify the top level behavior
			// of the application, how it processes the config or any other life cycle
			// by creating and including one or more of these
			"modules": [
				"dojox/application/module/env"
				//"dojox/application/module/phonegap",
				//"dojox/application/module/somePlugin"
			],

			//stores we are using 
			"stores": { 
				"contact":{
					"type": "dojo.store.Memory", 
					"cacheLocal": "true", 
					"params":{"url": "contacts.json"}
				},
				"news":{
					"type": "dojo.store.Memory", 
					"params": {"idAttribute":"articleId", "url":"news.json"}
				}
			},

			//models and instantiation parameters for the models. Including 'type' as a property allows
			//one to overide the class that will be used for the model.  By default it is dojox/mvc/model
			"models": { 
				"contact": {
					"params": {
						"schemas":[{"$ref": "http://json-schema.org/card"}], 
						"store": {"$ref": "#stores.contact"}, 
					}
				},
				"news": {
					"params": {
						"type": "my.newsModel",
						"store": {"$ref": "#stores.news"}
					}
				} 
			},

			//views for the classes.  Like the models, type can be specified to override the class. The params property defines the
			//default parameters that will be used to instantiate this view.  Parameters define in the view definitions below get mixed
			//into the parameter set when using that scene/view/model combination.  Parameters outside of the 'param's object
			//are used to advise the management of the view by the application controller and are not passed to the view.
			"views": { 
				//simple html view, no context data
				"simple": {
					"params": {
						"template": "templates/viewA.html"
					} 
				},

				//simple templated view, same as the simple view, but this time with a context supplied
				//it will treat the html as a string template and replate ${foo} with "bar" before rendering. 
				"templated": {
					"params": {
						"template": "templates/viewB.html",  
						"context": {"foo": "bar"}
					}
				},

				//simple query view. When the model is instantiated, the query is performed against the store
				//and the model should then hold an array of data objects that are the result of the query 
				"simpleQuery": {
					//"type": "dojox.mvc.QueryView", 
					"params": {
						"template": "templates/fubar.html",
						//query is sent to any models bound to this view (if it has a query method)
						"query": {}
					}
				},

				//mvc listview type of view
				"listView": {
					"type": "dojox.mvc.ListView", 
					"params": {
						"type": "dojox.mobile.List",
						"template": "templates/cardListItem.html", 
						"query": {}
					}
				}
			},

			//the name of the scene to load when the app is initialized.
			"defaultScene": "main",	

			//scenes are groups of views and models loaded at once	
			"scenes": {
				"main": { 
					//all views in the main scene will be bound to the user model
					"models": [{"$ref": "#models.contact"}], 
					
					//the views available to this scene
					"views": [
						{"id":"simple", "view": {"$ref": "#views.simple"}},
						{"id":"simpleQuery","view": {"$ref": "#views.simpleQuery"},"params": {"query":{"organization":"Acme"}}},
						{"id":"templated", "default": "true","view": {"$ref": "#views.templated"},"params": {"context":{"foo": "fubar"}}},
						{"id":"listView", "view": {"$ref": "#views.listView"},"params": {"query":{"organization":"Acme"}}},
					],
					"persist": true
				}	
			}	
	});
});
