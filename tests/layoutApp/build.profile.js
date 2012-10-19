require(["dojox/app/build/buildControlApp"], function(bc){
});

var profile = {
	basePath: "..",
	releaseDir: "./layoutApp/release",
	action: "release",
	packages:[{
		name: "dojo",
		location: "../../../dojo"
	},{
		name: "dijit",
		location: "../../../dijit"
	},{
		name: "dojox",
		location: "../../../dojox"
	},{
		name: "layoutApp",
		location: "../../../dojox/app/tests/layoutApp"
	}],
	layers: {
		"dojo/dojo": {
			include: [ "dojo/dojo" ]
		},
		"layoutApp/layoutApp": {
			include: [ "layoutApp/config.json", "layoutApp/index.html" ]
		}
	},
	resourceTags:{
		declarative: function(filename){
	 		return /\.htm(l)?$/.test(filename); // tags any .html or .htm files as declarative
	 	},
		amd: function(filename){
			return /\.js$/.test(filename);
		}
	}
};
