module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'sinon-chai'],
    files: [
      {pattern: './test/specs/*.js', watched: false},
      // expose files to tests
      {pattern: './test/**/*', included: false}
    ],
    preprocessors: {
      './test/specs/*': ['webpack']
    },
    webpack: {mode: 'production'},
    port: 8080,
    reporters: ['dots'],
    logLevel: config.LOG_INFO,
    browsers: ['Electron'],
    captureTimeout: 20000,
    autoWatch: true,
    singleRun: true
  })
}
