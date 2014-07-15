'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg   : grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    watch: {
      all: {
        files: ['src/**/*.coffee', 'specs/**/*_spec.js'],
        tasks: ['default'],
        options: {
          reload: true,
          atBegin: true
        }
      }
    },
    coffee: {
      compile: {
        files: {
          'build/hexagonal.js': 'src/hexagonal.coffee'
        }
      }
    },
    jasmine: {
      src: "build/hexagonal.js",
      options: {
        coffee: true,
        specs: 'specs/**/*_spec.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('default', ['coffee', 'jasmine']);
};
