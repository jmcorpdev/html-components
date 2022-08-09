"use strict";

module.exports = function (grunt) {
  // Show elapsed time at the end
  //require('time-grunt')(grunt);
  // Load all grunt tasks
  require("load-grunt-tasks")(grunt);

  // Project configuration.
  grunt.initConfig({
    clean: [".tmp"],
    nodeunit: {
      files: ["test/**/*_test.js"],
    },
    jshint: {
      options: {
        jshintrc: ".jshintrc",
        reporter: require("jshint-stylish"),
      },
      gruntfile: {
        src: "Gruntfile.js",
      },
      lib: {
        src: ["lib/!**!/!*.js"],
      },
      test: {
        src: ["test/!**!/!*.js"],
      },
    },
    // mochacli: {
    //     options: {
    //         reporter: 'spec',
    //         bail: true
    //     },
    //     all: ['test/*.js']
    // },
    jsdox: {
      generate: {
        options: {
          contentsTitle: "My Project Documentation",
        },

        src: ["lib/**/*.js"],
        dest: "doc",
      },
    },
    watch: {
      gruntfile: {
        files: "<%= jshint.gruntfile.src %>",
        tasks: ["jshint:gruntfile"],
      },
      lib: {
        files: "<%= jshint.lib.src %>",
        tasks: ["jshint:lib", "mochacli"],
      },
      test: {
        files: "<%= jshint.test.src %>",
        tasks: ["mochacli"],
      },
      //            example:{
      //                files: 'example/**/*.*',
      //                tasks: ['example']
      //            }
    },
  });

  // Default task.
  grunt.registerTask("default", ["clean", "mochacli", "clean"]);
  grunt.registerTask("dev", ["example", "watch"]);
  grunt.registerTask("devtest", ["mochacli", "watch"]);
  /*grunt.registerTask('example', function () {
     var example = require('./example/html-components_example');
     example();
     });
     */
  /*grunt.registerTask('docEnd', function() {
     //move generated document files into doc folder
     var fs = require('fs');
     if(!fs.existsSync('doc')) {
     fs.mkdirSync('doc');
     }


     });*/
};
