define([
	"doh/runner",
	"dojo/_base/sniff"
], function(doh, has){
	try{
		var userArgs = window.location.search.replace(/[\?&](dojoUrl|testUrl|testModule)=[^&]*/g, "").replace(/^&/, "?");
		// DOH
		doh.registerUrl("dojox.app.tests.doh.lifecycleTest", require.toUrl("dojox/app/tests/doh/lifecycleTest/" + userArgs), 999999);
		doh.registerUrl("dojox.app.tests.doh.hasConfigTest", require.toUrl("dojox/app/tests/doh/hasConfigTest/" + userArgs), 999999);
		doh.registerUrl("dojox.app.tests.doh.simpleModelApp", require.toUrl("dojox/app/tests/doh/simpleModelApp/" + userArgs), 999999);
	}catch(e){
		doh.debug(e);
	}
});
