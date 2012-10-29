define([
	"build/argv",
	"build/fs",
	"build/buildControl",
	"build/messages",
	"build/process",
	"dojox/json/ref"
], function(argv, fs, bc, messages, process, json){
	var parseViews = function(mids, mainLayer, views){
		for(var key in views){
			// ignore naming starting with _ (jsonref adding is own stuff in there)
			if(key.indexOf("_") == 0){
				continue;
			}
			var view = views[key];
			// TODO deal with "./" shortcut & default view location (which relies on "./")
			if(view.definition && view.definition != "none"){
				var mid = view.definition.replace(/(\.js)$/, "");
				if(!bc.layers[mid] && bc.multipleAppConfigLayers){
					bc.layers[mid] = { include: [], exclude: [ mainLayer ] };
					mids = bc.layers[mid].include;
				}
				mids.push(mid);
			}
			if(view.template){
				mids.push(view.template);
			}
			if(view.dependencies){
				Array.prototype.splice.apply(mids, [ mids.length, 0 ].concat(view.dependencies));
			}
			if(view.views){
				parseViews(mids, mainLayer, view.views);
			}
		}
	};
	return function(){
		var config;
		try{
			config = json.fromJson(fs.readFileSync(bc.getSrcModuleInfo(argv.args.appConfigFile, null, true).url));
		}catch(e){
		}
		if(config){
			var mids = [];
			if(config.loaderConfig){
				require(config.loaderConfig);
			}
			// main layer
			var mainLayer;
			if(!argv.args.appConfigLayer){
				// no layer specified, take the first one
				for(var l in bc.layers){
					mainLayer = l;
					break;
				}
			}
			if(!mainLayer && !bc.layers[argv.args.appConfigLayer]){
				bc.layers[mainLayer = argv.args.appConfigLayer] = { include: [], exclude: [] };
			}
			if(config.dependencies){
				mids = mids.concat(config.dependencies);
			}
			if(config.controllers){
				mids = mids.concat(config.controllers);
			}
			if(config.modules){
				mids = mids.concat(config.modules);
			}
			if(config.template){
				mids.push(config.template);
			}
			if(config.definition && config.definition != "none"){
				mids.push(config.definition.replace(/(\.js)$/, ""));
			}
			// go into the view children
			if(config.views){
				parseViews(mids, mainLayer, config.views);
			}
			Array.prototype.splice.apply(bc.layers[mainLayer].include, [bc.layers[mainLayer].length, 0].concat(mids));
		}else{
			messages.log("pacify", argv.args.appConfigFile+" is not a valid dojox/app JSON config file");
			process.exit(-1);
		}
	};
});

