module.exports = function(grunt) {
  // Configure our build
  grunt.initConfig({
    // Custom config which we'll use later
    exclusions: ['build','node_modules'],
    // Copy files ready for gh-pages
    copy: {
      // Do the main copy - all entries from all years.
      main: {
        src: '**/*',
        dest: 'build/',
        filter: function(filepath) {
          var filepathParts = filepath.split(require('path').sep);
          // We will copy all folders except those in the "exclude" property (build and node_modules)
          var shouldExclude = (filepathParts.length === 1 && grunt.file.isFile(filepath)) ||
                              (grunt.config('exclusions').indexOf(filepathParts[0]) !== -1);
          if (!shouldExclude) {
            // Log what we're copying with some debug info
            console.log("Copying " + filepath + " " + filepath.split(require('path').sep)[0]);
          }
          return !shouldExclude;
        }
      },
      // Then do the copy to make sure links aren't broken for the original 2013 entry.
      backCompat: {
        expand: true,
        cwd: 'build/2013/',
        src: '**/*',
        dest: 'build/'
      }
    },
    // Clean the destination folder that we'll use to drive the gh-pages output.
    clean: {
      src: 'build/'
    },
    // And generate the gh-pages output, pushing it to origin.
    'gh-pages': {
      options: {
        base: 'build'
      },
      src: '**/*'
    }
  });

  // Load the plugin that provides the "copy" task.
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task(s).
  grunt.registerTask('default', ['clean', 'copy', 'gh-pages']);
};
