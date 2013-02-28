define([
	"require",
	"doh/runner"
], function(require, doh){
	try{
		var userArgs = window.location.search.replace(/[\?&](dojoUrl|testUrl|testModule)=[^&]*/g, "").replace(/^&/, "?");
		// DOH
		doh.registerUrl("dojox.app.tests.doh.lifecycleTest", require.toUrl("./lifecycleTest/" + userArgs), 999999);
		doh.registerUrl("dojox.app.tests.doh.hasConfigTest", require.toUrl("./hasConfigTest/" + userArgs), 999999);
		doh.registerUrl("dojox.app.tests.doh.simpleModelApp", require.toUrl("./simpleModelApp/" + userArgs), 999999);
	}catch(e){
		doh.debug(e);
	}
});
