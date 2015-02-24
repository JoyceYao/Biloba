// Karma configuration

module.exports = function(config){
    config.set({

        basePath : '',

        files : [
          'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.js',
          'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular-mocks.js',
          'app/*.js',
          'test/**/*Spec.js'
        ],

        reporters: ['progress', 'coverage'],

        preprocessors: {
          'app/gameLogic.js': ['coverage']
        },

        // optionally, configure the reporter
        coverageReporter: {
          type :  'html',
          dir :   'coverage/',
          file :  'coverage.html'
        },

        autoWatch : true,

        frameworks: ['jasmine'],

        browsers : ['Chrome'],

        plugins : [
          'karma-chrome-launcher',
          'karma-jasmine',
          'karma-coverage'
        ],

        colors: true,

    });
};