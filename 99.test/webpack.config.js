const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'js/bundle.js',
    path: resolve(__dirname, 'dist'),
    // 每次打包清空上次文件夹
    clean: true
  },
  module: {
    rules: []
  },
  plugins: [
    // 指定使用的html模板
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  devServer: {
    static: false,
    compress: true,
    port: 8080,
    open: true
  }
}