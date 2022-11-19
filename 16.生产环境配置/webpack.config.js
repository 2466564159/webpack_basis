/*
  生产环境基本配置：
    1.css （提取css单独文件，postcss解决兼容性，压缩css）
    2.less
    3.eslint  airbnb  js语法检查
    4.babel   js兼容性
    5.图片（包括html中的图片）
    6.字体或其他资源
    7.js压缩
    8.html压缩
*/

const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const ESLintWebpackPlugin = require("eslint-webpack-plugin")

// 设置为production自动压缩js和html
// 设置node环境变量：决定使用browserslist的那个环境
process.env.NODE_ENV = 'production'

// 复用loader
const commonCssLoader = [
  // 创建style标签，将样式放入
  // 'style-loader', 

  // 这个loader取代style-loader。作用：提取js中的css成单独文件
  MiniCssExtractPlugin.loader,

  // 将css文件整合到js文件中
  'css-loader',

  /*
    css兼容性处理：postcss --> postcss-loader postcss-preset-env

    postcss-preset-env这个插件帮助postcss找到package.json中browserslist里面的配置，通过配置加载指定的css兼容性样式
    
    "browserslist": {
      // 这里的"development"和"production"是跟node环境变量相关的（process.env.NODE_ENV）!!!  跟webpack中的mode没有关系

      // 开发环境
      "development": [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version"
      ],
      // 生产环境
      "production": [
        ">0.2%",
        "not dead",
        "not op_mini all"
      ]
    }
  */
  {
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        plugins: [
          ['postcss-preset-env']
        ],
      }
    }
  }
];

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
        use: [...commonCssLoader]
      },

      // 处理less
      {
        test: /\.less$/,
        use: [...commonCssLoader, 'less-loader']
      },

      // babel
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  // 按需加载
                  useBuiltIns: 'usage',
                  // 指定core-js版本
                  corejs: {
                    version: 3
                  },
                  // 指定兼容性做到哪个版本浏览器
                  targets: {
                    chrome: '60',
                    firefox: '60',
                    ie: '9',
                    safari: '10',
                    edge: '17'
                  }
                }
              ]
            ]
          }
        }
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
    new MiniCssExtractPlugin({
      // 对输出的css文件进行重命名
      filename: 'css/bundle.css'
    }),

    // 压缩css
    new OptimizeCssAssetsWebpackPlugin(),

    // 指定使用的html模板
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),

    // eslint
    new ESLintWebpackPlugin({
      // 指定检查文件的根目录
      context: resolve(__dirname, "src"),
      // 自动修复eslint的错误
      fix: true
    })
  ],

  // 设置为production自动压缩js和html
  mode: 'production'
}