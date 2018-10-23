module.exports = function( grunt ) {

  grunt.initConfig({
  sync: {
    main: {
      files: [

        {
          cwd: 'src/',
          src: ['**/*.jsx','!**/tab*.jsx'],
          dest: '../www.ideo-base.ieo.es/src/'
        },
        {
          cwd: 'src/',
          src: ['**/*.jsx','!**/tab*.jsx'],
          dest: '../www.ideo-cabrera.ieo.es/src/'
        },
        {
          cwd: 'src/',
          src: ['**/*.jsx','!**/tab*.jsx'],
          dest: '../www.ideo-elhierro.ieo.es/src/'
        },
        {
          cwd: 'src/',
          src: ['**/*.jsx','!**/tab*.jsx'],
          dest: '../www.ideo-namibia.ieo.es/src/'
        },
        {
          cwd: 'src/',
          src: ['**/*.jsx','!**/tab*.jsx'],
          dest: '../www.ideo-tpea.es/src/'
        } // makes all src relative to cwd
      ],
      verbose: true, // Default: false
      pretend: false, // Don't do any disk operations - just write log. Default: false
      failOnError: false, // Fail the task when copying is not possible. Default: false
      ignoreInDest: "**/*.json", // Never remove js files from destination. Default: none
      updateAndDelete: false, // Remove all files from dest that are not found in src. Default: false
      compareUsing: "mtime" // compares via md5 hash of file contents, instead of file modification time. Default: "mtime"

    }
  },
  watch: {
    jsxfiles: {
      files: ['src/**/*.jsx'],
      tasks: ['sync:main'],
    }
  }
});

grunt.loadNpmTasks('grunt-sync');
grunt.loadNpmTasks('grunt-contrib-watch');

grunt.registerTask('default', ['watch']);
}
