exports.config = {
	specs: ['test/endToEndSpec.js'],
	allScriptsTimeout: 66000,
	directConnect: true, // only works with Chrome and Firefox
	capabilities: {
		'browserName': 'chrome'
	},
	baseUrl: 'http://localhost:9000/',
	framework: 'jasmine',
	jasmineNodeOpts: {
		defaultTimeoutInterval: 60000
	}
};