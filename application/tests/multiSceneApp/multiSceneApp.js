define(["dojo","dojox/application"],function(dojo,Application){
	app = new Application({
			"id": "multiSceneApp",
			"name": "Multi Scene App",
			"description": "A multiSceneApp",
			"splash": "splash",

			"dependencies": [
				"dojox/mobile/_base",
				"dojox/mobile/TabBar",
				"dojox/mobile/Button",
				"dojox/mobile/EdgeToEdgeDataList"
			],
			// Modules for the application.  The are basically used as the second
			// array of mixins in a dojo.declare().  Modify the top level behavior
			// of the application, how it processes the config or any other life cycle
			// by creating and including one or more of these
			"modules": [
				"dojox/application/module/env",
				"dojox/application/module/hash"
				//"dojox/application/module/phonegap",
				//"dojox/application/module/somePlugin"
			],

			//stores we are using 
			"stores": {},

			"template": "application.html",

			//models and instantiation parameters for the models. Including 'type' as a property allows
			//one to overide the class that will be used for the model.  By default it is dojox/mvc/model
			"models": {}, 

			//views for the classes.  Like the models, type can be specified to override the class. The params property defines the
			//default parameters that will be used to instantiate this view.  Parameters define in the view definitions below get mixed
			//into the parameter set when using that scene/view/model combination.  Parameters outside of the 'param's object
			//are used to advise the management of the view by the application controller and are not passed to the view.
			"views": { 
				//simple html view, no context data
				"main": {
					"params": {
						//path to the template
						"template": "views/simple/main.html" 
					} 
				},
				//simple html view, no context data
				"second": {
					"params": {
						//path to the template
						"template": "views/simple/second.html" 
					} 
				},
				//simple html view, no context data
				"third": {
					"params": {
						//path to the template
						"template": "views/simple/third.html",
						"fullScreen": true
					} 
				},
				//simple html view, no context data
				"tab1": {
					"params": {
						//path to the template
						"template": "views/tabs/tab1.html",
						"fullScreen": true
					} 
				},

				//simple html view, no context data
				"tab2": {
					"params": {
						//path to the template
						"template": "views/tabs/tab2.html",
						"fullScreen": true
					} 
				},

				//simple html view, no context data
				"tab3": {
					"params": {
						//path to the template
						"template": "views/tabs/tab3.html",
						"fullScreen": true
					} 
				}



			},

			//the name of the scene to load when the app is initialized.
			"defaultScene": "main",	

			//scenes are groups of views and models loaded at once	
			"scenes": {

				//simple scene which loads all views and shows the default first
				"main": { 
					//all views in the main scene will be bound to the user model
					"params": {
						"models": [],
						"template": "simple.html",	
						"defaultView": "main",
						//the views available to this scene
						"views": { 
							"main":{"view": {"$ref": "#views.main"}},
							"second":{"view": {"$ref": "#views.second"}},
							"third":{"view": {"$ref": "#views.third"}},
						}						
					}
				},
				//simple scene which loads all views and shows the default first
				"second": { 
					//all views in the second scene will be bound to the user model
					"params": {
						"models": [],
						"template": "tabScene.html",	
						"defaultView": "tab1",
						//the views available to this scene
						"views": { 
							"tab1":{ "view": {"$ref": "#views.tab1"}},
							"tab2":{ "view": {"$ref": "#views.tab2"}},
							"tab3":{ "view": {"$ref": "#views.tab3"}},
						},
						"dependencies": [
							"dojox/mobile/Button"
						]	

					}
				},
				//simple scene which loads all views and shows the default first
				"third": { 
					//all views in the main scene will be bound to the user model
					"params": {
						"models": [],
				
						"defaultView": "third",
						//the views available to this scene
						"views": { 
							"third": {"view": {"$ref": "#views.third"}},
						},

						"dependencies": [
							"dojox/mobile/Button"
						]
					}
				}
			}	
	});
});
