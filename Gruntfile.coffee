module.exports = (grunt) ->

  # load all grunt tasks
  require('load-grunt-tasks')(grunt)

  grunt.initConfig

    watch:
      src:
        files: [
          'src/*.coffee'
          'test/specs/*.coffee'
        ]
        tasks: ['browserify:tmp', 'browserify:test']
      gruntfile:
        files: ['Gruntfile.coffee']

    connect:
      options:
        port: 9040
        # Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
        livereload: 35749 # Default livereload listening port: 35729
      livereload:
        options:
          open: true
          base: [
            '.tmp'
            'examples'
          ]

    clean:
      tmp: '.tmp'

    browserify:
      options:
        browserifyOptions:
          extensions: ['.coffee']
        transform: ['coffeeify']
        debug: true
      tmp:
        files:
          '.tmp/srcissors.js' : [
            'src/srcissors.coffee'
          ]
      test:
        files:
          '.tmp/srcissors-test.js' : [
            'test/specs/*.coffee'
          ]
      build:
        options:
          debug: false
        files:
          'srcissors.js' : [
            'src/srcissors.coffee'
          ]

    mochaTest:
      test:
        options:
          reporter: 'dot'
          compilers: 'coffee-script/register'
          require: './test/node/mocha_test.js'
        src: [
          'test/specs/*.coffee'
        ]

    karma:
      unit:
        configFile: 'karma.conf.coffee'
      unit_once:
        configFile: 'karma.conf.coffee'
        browsers: ['PhantomJS']
        singleRun: true
      browsers:
        configFile: 'karma.conf.coffee'
        browsers: ['Chrome', 'Firefox', 'Safari']
      build:
        configFile: 'karma.conf.coffee'
        browsers: ['Chrome', 'Firefox', 'Safari']
        singleRun: true

    # note: run grunt uglify --verbose to see the file size report
    uglify:
      options:
        report: 'gzip'
      dist:
        files:
          'srcissors.min.js': [
            'srcissors.js'
          ]

    bump:
      options:
        files: ['package.json', 'bower.json']
        commitFiles: ['-a'], # '-a' for all files
        pushTo: 'origin'
        push: true

    shell:
      npm:
        command: 'npm publish'


  # Tasks
  # -----

  grunt.registerTask('dev', [
    'browserify:tmp'
    'connect:livereload'
    'watch'
  ])

  grunt.registerTask('test', [
    'clean:tmp'
    'browserify:test'
    'karma:unit'
  ])

  grunt.registerTask('build', [
    'clean'
    'browserify:test'
    'karma:build'
    'browserify:build'
    'uglify'
  ])

  # Release a new version
  # Only do this on the `master` branch.
  #
  # options:
  # release:patch
  # release:minor
  # release:major
  grunt.registerTask 'release', (type) ->
    type ?= 'patch'
    grunt.task.run('build')
    grunt.task.run('bump:' + type)
    grunt.task.run('shell:npm')


  grunt.registerTask('default', ['dev'])
