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
  
  优化打包构建速度：
    1.oneOf：
      匹配到一个loader后，后面的就不会再继续匹配了。

    2.babel缓存：
      cacheDirectory: resolve(__dirname, 'cache') 
      -->  指定的目录将用来缓存 loader 的执行结果，
      如果设置为true，loader 将使用默认的缓存目录 node_modules/.cache/babel-loader
      
    3.多进程打包：
      thread-loader
      进程启动大概为600ms，进程通信也有开销
      只有工作消耗时间比较长，才需要多进程打包

    4.externals：
      externals 配置选项提供了「从输出的 bundle 中排除依赖」的方法
      externals: {
        // 拒绝jQuery被打包进来
        jquery: 'jQuery'
      }

    5.dll
      使用dll技术，对某些库（第三方库：jquery，react，vue...）进行单独打包
      1).webpack.dll.js：
        // 打包生成一个 mainfest.json --> 提供和jquery映射
      2).
        webpack.DllReferencePlugin：告诉webpack哪些库不参与打包，同时使用时的名称也得变
        AddAssetHtmlWebpackPlugin：将某个文件打包输出，并在html中自动引入该资源

  优化代码运行的性能：
    1.文件资源缓存(hash-chunkhash-contenthash)：
      --> 让代码上线运行缓存更好使用
      hash: 每次wepack构建时会生成一个唯一的hash值。
        问题: 因为js和css同时使用一个hash值。
          如果重新打包，会导致所有缓存失效。（可能我却只改动一个文件）
      chunkhash：根据chunk生成的hash值。如果打包来源于同一个chunk，那么hash值就一样
        问题: js和css的hash值还是一样的
          因为css是在js中被引入的，所以同属于一个chunk
      contenthash: 根据文件的内容生成hash值。不同文件hash值一定不一样    

    2.tree shaking：
      前提：1. 必须使用ES6模块化  2. 开启production环境
      作用: 去除无用代码，减少代码体积

      在package.json中配置 
        "sideEffects": false 所有代码都没有副作用（都可以进行tree shaking）
          问题：可能会把css / @babel/polyfill （副作用）文件干掉
        "sideEffects": ["*.css", "*.less"]

    3.code split：
      入口起点：使用 entry 配置手动地分离代码。
        // 多入口
        // entry: {
        //   index: './src/js/index.js',
        //   a: './src/js/a.js'
        // },

      防止重复：SplitChunksPlugin 去重和分离 chunk。
        1. 可以将node_modules中代码单独打包一个chunk最终输出
        2. 自动分析多入口chunk中，有没有公共的文件。如果有会打包成单独一个chunk
        optimization: {
          splitChunks: {
            chunks: 'all'
          }
        }

      动态导入：通过模块的内联函数调用来分离代码。
          通过js代码，让某个文件被单独打包成一个chunk
          import动态导入语法：能将某个文件单独打包
          import(注释* webpackChunkName: 'test' *注释 './test')
          .then( ({ default }) => {
            // 文件加载成功~
          })
          .catch(() => {
            // 文件加载失败~
          });

        一般单入口用的比较多：
          防止重复（1. 可以将node_modules中代码单独打包一个chunk最终输出）
          动态导入（import动态导入语法：能将某个文件单独打包）
      
    4.懒加载/预加载：
      懒加载：当文件需要使用时才加载~
      预加载 prefetch：会在使用之前，提前加载js文件 
      正常加载可以认为是并行加载（同一时间加载多个文件）  
      预加载 prefetch：等其他资源加载完毕，浏览器空闲了，再偷偷加载资源
      跟 动态导入 一样的语法： import(注释* webpackChunkName: 'test', webpackPrefetch: true *注释'./test')
    
    5.pwa：
      让应用在 离线(offline) 时能够继续运行功能，通过使用 workbox-webpack-plugin 插件来实现的
        
      // 注册serviceWorker
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/service-worker.js')
            .then(() => {
              console.log('sw注册成功了~');
            }).catch((err) => {
              console.log('sw注册失败了~', err);
            });
        });
      }

      eslint不认识 window、navigator全局变量
        解决：需要修改package.json中eslintConfig配置
        "env": {
          "browser": true // 支持浏览器端全局变量
        }
*/

const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const ESLintWebpackPlugin = require("eslint-webpack-plugin")
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const webpack = require('webpack')
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin')

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
 
  // 单入口
  entry: './src/js/index.js',

  output: {
    filename: 'js/[contenthash:10].[name].bundle.js',
    path: resolve(__dirname, 'dist'),
    // 每次打包清空上次文件夹
    clean: true
  },

  module: {
    rules: [
      {
        oneOf: [

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
            use: [
              // 开启多进程打包
              'thread-loader',

              {
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
                  ],
                  // 指定babel缓存目录
                  cacheDirectory: resolve(__dirname, 'cache')
                }
              }
            ]
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
      }
    ]
  },

  plugins: [
    new MiniCssExtractPlugin({
      // 对输出的css文件进行重命名
      filename: 'css/[contenthash:10].[name].bundle.css'
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
    }),

    new WorkboxWebpackPlugin.GenerateSW({
      // 1. 帮助serviceworker快速启动
      // 2. 删除旧的 serviceworker
      // 生成 serviceworker 配置文件
      clientsClaim: true,
      skipWaiting: true,
    }),

    // 告诉webpack哪些库不参与打包，同时使用时的名称也得变
    // new webpack.DllReferencePlugin({
    //   manifest: resolve(__dirname, 'dll/mainfest.json')
    // }),

    // 将某个文件打包输出，并在html中自动引入该资源
    // new AddAssetHtmlWebpackPlugin({
    //   filepath: resolve(__dirname, 'dll/jquery.js'),
    //   outputPath: 'dll',
    //   // 不加publicPath script标签会多了一个目录auto
    //   publicPath: './dll'
    // })
  ],

  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },

  // externals: {
  //   // 拒绝jQuery被打包进来
  //   jquery: 'jQuery'
  // },

  // 设置为production自动压缩js和html
  mode: 'production'
}