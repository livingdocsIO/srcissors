'use strict'
module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/srcissors.js',
  output: {
    filename: './srcissors.js',
    path: __dirname,
    library: 'srcissors',
    libraryTarget: 'umd'
  },
  externals: {
    jquery: {
      commonjs: 'jquery',
      commonjs2: 'jquery',
      amd: 'jquery',
      root: 'jQuery'
    }
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          sourceType: 'unambiguous',
          presets: [
            ['@babel/preset-env', {
              modules: false,
              targets: {
                browsers: ['chrome>=49', 'safari>=10', 'firefox>=52', 'ie>=11', 'opera>=49']
              }
            }]
          ]
        }
      }]
    }]
  },
  devServer: {inline: true}
}
