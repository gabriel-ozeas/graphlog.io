require.config({
	baseUrl: "/public/js",
	urlArgs: 'cb=' + Math.random(),
	paths: {
		jquery: 'vendor/jquery-1.9.1.min',
		underscore: 'vendor/underscore.min',
		spec: '../test/spec'
	}
});

require(['jquery', 'underscore'], function($) {
	var jasmineEnv = jasmine.getEnv(),
		htmlReporter = new jasmine.HtmlReporter(),
		specs = [];

	jasmineEnv.addReporter(htmlReporter);
	jasmineEnv.specFilter = function(spec) {
		return htmlReporter.specFilter(spec);
	}

	specs.push("../../test/spec/client/NodeLinkSpec");
	specs.push("../../test/spec/client/NodeSpec");
	specs.push("../../test/spec/client/LineSpec");
	specs.push("../../test/spec/client/PointSpec");

	$(function() {
		require(specs, function() {
			jasmineEnv.execute();
		});
	}); 

});