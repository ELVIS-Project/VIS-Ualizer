// Karma configuration
// Generated: May 19, 2016 14:58:02 GMT-0400 (EDT)
// Updated:  July 14, 2016

module.exports = function(config) {

    config.set({

	// base path that will be used to resolve all patterns (eg. files, exclude)
	basePath: '',
      
	// frameworks to use
	// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
	frameworks: ['jasmine-jquery', 'jasmine'],

	// list of files / patterns to load in the browser
	files: ['node_modules/jquery/dist/jquery.js', 'server/static/js/libs/d3.js', 'server/static/js/utils.js',
		'spec/javascripts/fixtures/test_sorting_barchart.html',
		'server/static/js/test_sorting_barchart.js'
	],

	// list of files to exclude
	exclude: [
	],

	// preprocess matching files before serving them to the browser
	// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
	preprocessors: {
	},


	// test results reporter to use
	// possible values: 'dots', 'progress'
	// available reporters: https://npmjs.org/browse/keyword/karma-reporter
	reporters: ['progress'],

	// web server port
	port: 9876,

	// enable / disable colors in the output (reporters and logs)
	colors: true,

	// level of logging
	// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
	logLevel: config.LOG_INFO,

	// enable / disable watching file and executing tests whenever any file changes
	autoWatch: true,

	// start these browsers
	// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
	browsers: ['Firefox', 'Chrome', 'Safari', 'IE'],

	// Continuous Integration mode
	// if true, Karma captures browsers, runs the tests and exits
	singleRun: false,

	// Concurrency level
	// how many browser should be started simultaneous
	concurrency: Infinity,

	//plugins: ['karma-jasmine-jquery', 'karma-jasmine',  'karma-firefox-launcher', 'karma-chrome-launcher']

    })

}
