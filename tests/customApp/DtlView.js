define(["dojo/_base/lang", "dojo/_base/declare", "dojox/app/View", "dojox/dtl/_Templated"],
	function(lang, declare, View, _Templated){
		return declare([_Templated, View], {
			_dijitTemplateCompat: true
		});
	}
);