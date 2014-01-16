module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    dest: '2013/',
    exclusions: ['build','node_modules','2013','2014'],
    copy: {
      main: {
        src: '**/*',
        dest: 'build/<%= dest %>',
        filter: function(filepath) {
          var filepathParts = filepath.split(require('path').sep);
          var shouldExclude = (filepathParts.length === 1 && grunt.file.isFile(filepath)) ||
                              (grunt.config('exclusions').indexOf(filepathParts[0]) !== -1);
          if (shouldExclude) {
            console.log("Skipping " + filepath + " " + grunt.config('exclusions') + " " + filepath.split(require('path').sep)[0]);
          }
          return !shouldExclude;
        }
      }
    },
    'gh-pages': {
      options: {
        base: 'build'/*,
        push: false*/
      },
      src: '**/*'
    }
  });

  // Load the plugin that provides the "copy" task.
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-gh-pages');

  // Default task(s).
  grunt.registerTask('default', ['copy', 'gh-pages']);
};
