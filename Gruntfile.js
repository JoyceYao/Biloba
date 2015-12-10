module.exports = function(grunt) {

  'use strict';
  
  // Auto resize (and pad with white color) an image
  // into multiple sizes for Google&Apple app submission.
  // modified by JoyceYao --> windows version
  // using imagemagick v6
  // for mac version, please see: https://github.com/yoav-zibin/TicTacToe/blob/gh-pages/Gruntfile.js
  var src_img = "src.png";
  var src_img_width_to_height_ratio = 1024/1024;
  var directory = "auto_resize_images";
  var output_directory = directory + "\\output";
  var padColor = "FFFFFF"; // white in HEX
  var desired_sizes = [
    "1024x1024",
    "1024x500",
    "512x512",
    "50x50",
    "200x200",
    "320x50",
    "android/7inTablet-615x984",
    "android/10inTablet-656x1048",
    "android/Phone-656x1054",
    "ios/iPad-768x1024",
    "ios/iPadPro-2732x2048",
    "ios/iphone4-3.5inch-640x960",
    "ios/iphone5-4inch-640x1096",
    "ios/iphone6-4.7inch-750x1334",
    "ios/iphone6plus-5.5inch-1242x2208",
    "phonegap/icon-29",
    "phonegap/icon-40",
    "phonegap/icon-57",
    "phonegap/icon-58",
    "phonegap/icon-60",
    "phonegap/icon-72",
    "phonegap/icon-76",
    "phonegap/icon-80",
    "phonegap/icon-114",
    "phonegap/icon-120",
    "phonegap/icon-144",
    "phonegap/icon-152",
    "phonegap/icon-180",
    "phonegap/icon-512",
    "phonegap/splash-1536x2048",
    "phonegap/splash-1024x768",
    "phonegap/splash-1242x2208",
    "phonegap/splash-2048x1536",
    "phonegap/splash-2208x1242",
    "phonegap/splash-320x480",
    "phonegap/splash-640x1136",
    "phonegap/splash-640x960",
    "phonegap/splash-750x1334",
    "phonegap/splash-768x1024",
    "phonegap/splash-512x512",
  ];
  var commands = [];
  var commands2 = [];
  var subdirectories = {};
  commands.push('rmdir /s/q ' + output_directory);
  commands.push('mkdir ' + output_directory);
  for (var i = 0; i < desired_sizes.length; i++) {
    var desired_size = desired_sizes[i];
    if (desired_size.split('/').length >= 3) {
      throw new Error("You can have at most one sub-directory in filename: " + desired_size);
    }
    var slashIndex = desired_size.indexOf("/");
    if (slashIndex !== -1) {
      var subdirectory = desired_size.substring(0, slashIndex);
      if (!subdirectories[subdirectory]) {
        subdirectories[subdirectory] = true;
        commands.push('mkdir ' + output_directory + '\\' + subdirectory);
      }
    }
    var lastDashIndex = desired_size.lastIndexOf("-");
    var dimensions = desired_size.substring(lastDashIndex + 1);
    var width_height = dimensions.split("x");
    var width = Number(width_height[0]);
    var height = Number(width_height[width_height.length - 1]);
    if (dimensions != '' + (width_height.length == 1 ? width : width + "x" + height)) {
      throw new Error("Illegal dimension size in filename '" + desired_size + "'. You should have a dimension suffix, e.g., 'blabla-512x200'");
    }

    var fileName = desired_size.replace('/', '\\') + '.png';

    // create resized pictures in temp folders
    var commandStr = 'convert ' + directory + '\\' + src_img +
        ' -resize ' + width + 'x' + height +
        ' -size ' + width + 'x' + height +
        ' -gravity center' + 			// put the image in the vertical and horizontal center
        ' -background transparent' + 	// make background transparent
        ' -extent ' + dimensions +		// force the image to fit the require pixel size
        ' -quality 75' +   				// compress the image
        ' ' + output_directory + '\\' + fileName;

    console.log("make command=" + commandStr);
    commands.push(commandStr);
  }
  var auto_resize_images_command = commands.join(" & ");  

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    shell: {
       auto_resize_images_on_mac: {
         command: auto_resize_images_command
       }
    },
    karma: {
      once: {
        configFile: 'karma.conf.js',
        singleRun: true
      },
      unit: {
        configFile: 'karma.conf.js',
        background: true,
        singleRun: false
      }
    },
    // Run karma and watch files using:
    // grunt karma:unit:start watch
    watch: {
      files: ['src/*.js'],
      tasks: ['karma:unit:run']
    },
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        // Order is important! gameLogic.js must be first because it defines myApp angular module.
        src: [
          'ts_output_readonly_do_NOT_change_manually/src/gameLogic.js',
          'ts_output_readonly_do_NOT_change_manually/src/game.js',
          'ts_output_readonly_do_NOT_change_manually/src/aiService.js'],
        dest: 'dist/everything.js',
      },
    },
    uglify: {
      options: {
        sourceMap: true,
      },
      my_target: {
        files: {
          'dist/everything.min.js': ['dist/everything.js']
        }
      }
    },
    processhtml: {
      dist: {
        files: {
          'game.min.html': ['game.html']
        }
      }
    },
    manifest: {
      generate: {
        options: {
          basePath: '.',
          cache: [
            'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.min.js',
            'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular-touch.min.js',
            'http://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.12.1/ui-bootstrap-tpls.min.js',
            'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css',
            'http://yoav-zibin.github.io/emulator/dist/turnBasedServices.3.min.js',
            'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/fonts/glyphicons-halflings-regular.woff',
            'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/fonts/glyphicons-halflings-regular.ttf',
            'http://yoav-zibin.github.io/emulator/main.css',
            'dist/everything.min.js',
            'imgs/ico_help.png',
            'styles/main.css',
            'imgs/200x200.png',
            'imgs/50x50.png'
          ],
          network: [
            'languages/en.js',
            'dist/everything.min.js.map',
            'dist/everything.js'
          ],
          timestamp: true
        },
        dest: 'game.appcache',
        src: []
      }
    },
    'http-server': {
        'dev': {
            // the server root directory
            root: '.',
            port: 9000,
            host: "0.0.0.0",
            cache: 1,
            showDir : true,
            autoIndex: true,
            // server default file extension
            ext: "html",
            // run in parallel with other tasks
            runInBackground: true
        }
    },
    protractor: {
      options: {
        configFile: "protractor.conf.js", // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
          // Arguments passed to the command
        }
      },
      all: {}
    },
  });

  require('load-grunt-tasks')(grunt);

  // Default task(s).
  grunt.registerTask('default', [   //'karma', 'protractor',
  	  'shell',
      'concat', 'uglify', 'processhtml',
      'manifest',
      'http-server']);

};
