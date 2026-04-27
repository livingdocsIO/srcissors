import {fileURLToPath} from 'url'

export default {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/srcissors.js',
  experiments: {
    outputModule: true
  },
  output: {
    filename: './srcissors.js',
    path: fileURLToPath(new URL('.', import.meta.url)),
    library: {
      type: 'module'
    }
  },
  externalsType: 'module',
  externals: {
    jquery: 'jquery'
  }
}
