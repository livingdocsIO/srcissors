module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'sinon-chai', 'browserify'],
    files: ['./test/specs/*.coffee', {pattern: './test/**/*', included: false}],
    preprocessors: {
      './test/specs/*': ['browserify']
    },
    browserify: {
      transform: ['coffeeify'],
      extensions: ['.js', '.coffee']
    },
    port: 8080,
    reporters: ['dots'],
    logLevel: config.LOG_INFO,
    browsers: ['Electron'],
    captureTimeout: 20000,
    autoWatch: true,
    singleRun: true
  })
}
