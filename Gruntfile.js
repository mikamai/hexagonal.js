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
        files: ['src/**/*.coffee', 'specs/**/*.coffee', 'gruntfile.js'],
        tasks: ['default'],
        options: {
          reload: true,
          atBegin: true
        }
      }
    },
    coffee: {
      app: {
        files: {
          'build/hexagonal.js': 'src/hexagonal.coffee'
        }
      },
      test: {
        files: {
          'build/spec_helper.js': 'specs/spec_helper.coffee',
          'build/specs.js'      : ['specs/**/*_spec.coffee']
        },
        options: {
          bare: true,
          join: true
        }
      }
    },
    jasmine: {
      src: "build/hexagonal.js",
      options: {
        specs  : 'build/specs.js',
        helpers: 'build/spec_helper.js',
        display: 'short',
        summary: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('default', ['coffee', 'jasmine']);
};
