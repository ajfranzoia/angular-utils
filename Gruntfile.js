var fs = require('fs');

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-karma');

  // Project configuration.
  grunt.util.linefeed = '\n';

  grunt.initConfig({
    main: 'angularUtils',
    modules: [], // to be filled in by build task
    pkg: grunt.file.readJSON('package.json'),
    dist: 'dist',
    filename: 'angular-utils',
    meta: {
      modules: 'angular.module("angularUtils", [<%= srcModules %>]);',
      banner: ['/*',
               ' * <%= pkg.name %>',
               ' * <%= pkg.homepage %>',
               ' * Version: <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
               ' * License: <%= pkg.license %>',
               ' */\n'].join('\n')
    },
    concat: {
      dist: {
        options: {
          banner: '<%= meta.banner %><%= meta.modules %>\n\n',
        },
        src: [], //src filled in by build task
        dest: '<%= dist %>/<%= filename %>.js'
      },
    },
    uglify: {
      dist: {
        files: {
          '<%= dist %>/<%= filename %>.min.js': ['<%= dist %>/<%= filename %>.js']
        }
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },
  });

  grunt.registerTask('build', 'Create build files', function() {
    var _ = grunt.util._;

    grunt.file.expand({
      filter: 'isDirectory', cwd: '.'
    }, 'src/*').forEach(function(dir) {
      findModule(dir.split('/')[1]);
    });

    var modules = grunt.config('modules');
    grunt.config('srcModules', _.pluck(modules, 'moduleName'));

    var srcFiles = _.pluck(modules, 'srcFiles');
    grunt.config('concat.dist.src', grunt.config('concat.dist.src').concat(srcFiles));

    grunt.task.run(['concat']);
  });

  function findModule(name) {

    var formattedName = formatName(name);

    var module = {
      name: formattedName,
      moduleName: enquote(grunt.config('main') + '.' + formattedName),
      srcFiles: grunt.file.expand('src/' + name + '/*.js'),
    };

    grunt.config('modules', grunt.config('modules').concat(module));
  }

  function formatName(name) {
    name = name.replace(/-[a-z]/g, function (match) {
      return match.charAt(1).toUpperCase() + match.slice(2);
    });

    return name;
  }

  function enquote(name) {
    return '"' + name + '"';
  }

  grunt.registerTask('default', ['jshint', 'build']);

};
