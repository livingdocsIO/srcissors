import {fileURLToPath} from 'url'

export default {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/srcissors.js',
  output: {
    filename: './srcissors.js',
    path: fileURLToPath(new URL('.', import.meta.url)),
    library: {
      name: 'srcissors',
      type: 'umd',
      export: 'default'
    }
  },
  externals: {
    jquery: {
      commonjs: 'jquery',
      commonjs2: 'jquery',
      amd: 'jquery',
      root: 'jQuery'
    }
  }
}
