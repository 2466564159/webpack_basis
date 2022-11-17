const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

/*
  开发环境基本配置：
    loader：
      1.css
      2.less
      3.图片（包括html中的图片资源）
      4.fonts 字体
    plugin：
      1.指定使用的html模板
    开发服务器 devServer
    Source Map
*/
module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'js/bundle.js',
    path: resolve(__dirname, 'dist'),
    // 每次打包清空上次文件夹
    clean: true
  },
  module: {
    rules: [
      // 处理css
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },

      // 处理less
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },

      // 处理图片
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        // asset自动地在 resource 和 inline 之间进行选择
        type: 'asset',
        generator: {
          // 指定输出文件名
          filename: 'img/[hash:10][ext]'
        },
        parser: {
          dataUrlCondition: {
            // 小于 8kb 的文件，将会视为 inline(base64处理) 模块类型，否则会被视为 resource 模块类型。
            maxSize: 8 * 1024
          }
        }
      },

      // 处理html中img
      {
        test: /\.html$/,
        // 处理html文件的img图片（负责引入img，从而能被asset module处理）
        loader: 'html-loader'
      },

      // 处理字体文件
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          // 指定输出文件名
          filename: 'font/[hash:10][ext]'
        }
      }

    ]
  },
  plugins: [
    // 指定使用的html模板
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  mode: 'development',
  // 一般Source Map使用这个就好
  devtool: 'eval-source-map',
  // 开发服务器 devServer：用来自动化（自动编译，自动打开浏览器，自动刷新浏览器~~）
  // 特点：只会在内存中编译打包，不会有任何输出
  // npx webpack serve
  devServer: {
    // 项目构建后路径
    static: resolve(__dirname, 'dist'),
    // 启动gzip压缩
    compress: true,
    // 端口号
    port: 3000,
    // 自动打开浏览器
    open: true
  }
}