module.exports = (config) ->
  config.set

    # base path, that will be used to resolve files and exclude
    basePath: ''

    # testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['mocha', 'sinon-chai']

    # list of files / patterns to load in the browser
    files: [
      'node_modules/jquery/dist/jquery.js'
      '.tmp/srcissors-test.js'
      { pattern: './test/**/*', included: false }
    ],

    # list of files / patterns to exclude
    exclude: [],

    # web server port
    port: 8080

    reporters: ['dots']

    # level of logging
    # possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO

    # enable / disable watching file and executing tests whenever any file changes
    autoWatch: true

    # Start these browsers, currently available:
    # - Chrome
    # - ChromeCanary
    # - Firefox
    # - Opera
    # - Safari (only Mac)
    # - PhantomJS
    # - IE (only Windows)
    browsers: ['PhantomJS']

    # If browser does not capture in given timeout [ms], kill it
    captureTimeout: 20000

    # Continuous Integration mode
    # if true, it capture browsers, run tests and exit
    singleRun: false

