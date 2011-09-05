require(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/array", "dijit/registry", "dojo/_base/loader"], 
function(dojo, lang, array, registry){
    var path = window.location.pathname;
    if (path.charAt(path.length)!="/"){
    	path = path.split("/");
    	path.pop();
    	path=path.join("/");	
    }

    dojo.registerModulePath("app",path);

	// subscribe /app/loadchild to do this operation
	// I think this function is too general, should be support by scene.
	
	// search script tag and create new tag in head to fix IE and Firefox not load script.
	// In IE, set script text to innerHTML with <script type="text/javascript" defer> can load script.
	// In Firefox and Chrome, not support defer in innerHTML, but support defer in static page.
	// Use string.match(/<script.*?>.*?<\/script>/, templateString) cannot get matches because templateString contains "\n".
	// So use string.indexOf to check "<script" and "</script>", then replace "<script*" to empty.
	var addDynamicScript = function(node){
		if(!node.templateString){
			return;
		}
		
		var tempStr = node.templateString;
		var scriptText = "";
		var startIndex = tempStr.indexOf("<script");				
		var endIndex = tempStr.indexOf("<\/script>");
		
		while ((startIndex>-1) && (endIndex>-1) && (endIndex>startIndex)) {
			var str = tempStr.substring(startIndex, endIndex);
			str = str.replace(/<script.*?>.*?/, "");
			scriptText += str;
			
			startIndex = tempStr.indexOf("<script", endIndex);				
			endIndex = tempStr.indexOf("<\/script>", endIndex);
		}
		
		if (scriptText) {
			var header = document.getElementsByTagName('head')[0];
			var scriptTag = document.createElement('script');
			scriptTag.text = scriptText;
			header.appendChild(scriptTag);
		}
	};
    require(["dojo/_base/html","dojox/app/main", "dojo/text!app/config.json", "dojo/_base/connect"],
	function(dojo,Application,config, connect, lifecycle){
    	app = Application(eval("(" + config + ")"));
		
		// subscribe /app/loadchild event to deal dynamic script for firefox.
		connect.subscribe("/app/loadchild", lang.hitch(app, function(node){
			addDynamicScript(node);
        }));
    });
});