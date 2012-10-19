var profile = (function(){
	var testResourceRe = /\/tests\//,

		copyOnly = function(filename, mid){
			var list = {
				"demos.profile":1,
				"package.json":1,
				"README":1
			};
			return (mid in list) || (/^demos\/resources\//.test(mid) && !/\.css$/.test(filename)) || /(png|jpg|jpeg|gif|tiff)$/.test(filename)
				|| /demo\.profile\.js$/.test(filename);
		}

	return {
		resourceTags:{
			declarative: function(filename){
	   		 return /\.htm(l)?$/.test(filename); // tags any .html or .htm files as declarative
	  		},

			test: function(filename, mid){
				return testResourceRe.test(mid);
			},

			copyOnly: function(filename, mid){
				return copyOnly(filename, mid);
			},

			amd: function(filename, mid){
				return !testResourceRe.test(mid) && !copyOnly(filename, mid) && /\.js$/.test(filename);
			},

			miniExclude: function(filename, mid){
				return 0;
			}
		}
	};
})();
