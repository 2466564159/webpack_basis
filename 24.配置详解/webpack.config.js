const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  /*
    entry: 入口起点
      1. string --> './src/index.js'
      单入口：打包形成一个chunk，输出一个bundle文件
      chunk的默认名称是main

      2. array --> ['./src/index.js', './src/a.js']
        多入口：所有入口文件最终只会形成一个chunk，输出出去只有一个bundle文件
        可以让HMR功能中html文件热更新生效
      
      3. object
        多入口
        有几个入口文件就形成几个chunk，输出几个bundle文件
        此时chunk的名称是 key
        {
          // 所有入口文件最终只会形成一个chunk，输出只有一个bundle文件
          index: ['./src/index.js', './src/b.js'],
          // 形成一个chunk，输出一个bundle文件。
          a: './src/a.js'
        }
  */
  entry: './src/index.js',

  output: {
    // 文件名称（可以同时指定目录）
    filename: 'js/[contenthash:10].[name].js',
    // 输出文件目录（将所有资源输出的公共目录）
    path: resolve(__dirname, 'dist'),
    // 所有资源引入公共路径前缀   'img/a.jpg' --> '/img/a.jpg'
    publicPath: '/',
    // 非入口chunk的文件名称（可以同时指定目录）
    chunkFilename: 'js/[contenthash:10].[name]_chunk.js',
    // library: '[name]', // 整个库向外暴露的变量名
    // libraryTarget: 'window' // 变量名添加到哪个上 browser
    // libraryTarget: 'global' // 变量名添加到哪个上 node
    // libraryTarget: 'commonjs'
  },

  module: {
    rules: [

      {
        test: /\.css$/,
        // 多个loader use使用数组
        use: ['style-loader', 'css-loader']
      },
      // 
      {
        test: /\.js$/,
        // 排除node_modules下的js文件
        exclude: /node_modules/,
        // 只检查 src 下的js文件
        indclude: resolve(__dirname, 'src'),
        // 优先执行
        enforce: 'pre',
        // 延后执行
        // enforce: 'post',
        // 单个loader用loader
        loader: 'html-loader',
        // loader的配置选项
        options: {}
      },
      {
        // 以下配置只会生效一个
        oneOf: []
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin()
  ],

  mode: 'development',

  // 解析模块的规则
  resolve: {
    // 配置解析模块路径别名：优点简写路径 缺点路径没有提示
    alias: {
      '@': resolve(__dirname, 'src')
    },
    // 配置省略文件路径的后缀名
    extensions: ['.js', '.json', '.jsx', '.css'],
    // 告诉webpack解析模块是去哪个目录找
    modules: [
      resolve(__dirname, '../node_modules'),
      'node_modules'
    ]
  },

  devServer: {
    // 静态文件服务器 默认为public目录 设置为false可以禁用
    static: {
      // 文件目录
      directory: resolve(__dirname, 'dist'),
      // 启用后，文件更改将触发整个页面重新加载
      watch: false
    },
    // 启动gzip压缩
    compress: true,
    // 端口号
    port: 8080,
    // 如果你想让你的服务器可以被外部访问，可以设置为'0.0.0.0'
    host: 'localhost',
    // 打开浏览器
    open: true,
    // 开启HMR（热模块替换）
    hot: true,
    client: {
      // 服务器日志信息级别 none为不显示
      logging: 'none',
      // 当出现编译错误或警告时，不要在浏览器中显示全屏覆盖。
      overlay: false
    },
    // 代理   解决开发环境跨域问题
    proxy: {
      // 一旦服务器接受到 /api/xxx 的请求，就会把请求转发到target
      '/api': {
        target: 'http://localhost:3000',
        // 将请求路径重写：将 /api/xxx --> /xxx （去掉/api）
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },

  optimization: {
    splitChunks: {
      chunks: 'all',

      /* 
      minSize: 30 * 1024, // 分割的chunk最小为30kb
      maxSiza: 0, // 最大没有限制
      minChunks: 1, // 要提取的chunk最少被引用1次
      maxAsyncRequests: 5, // 按需加载时并行加载的文件的最大数量
      maxInitialRequests: 3, // 入口js文件最大并行请求数量
      automaticNameDelimiter: '~', // 名称连接符
      name: true, // 可以使用命名规则
      cacheGroups: {
        // 分割chunk的组
        // node_modules文件会被打包到 vendors 组的chunk中。--> vendors~xxx.js
        // 满足上面的公共规则，如：大小超过30kb，至少被引用一次。
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          // 优先级
          priority: -10
        },
        default: {
          // 要提取的chunk最少被引用2次
          minChunks: 2,
          // 优先级
          priority: -20,
          // 如果当前要打包的模块，和之前已经被提取的模块是同一个，就会复用，而不是重新打包模块
          reuseExistingChunk: true
        } 
      }
      */
    },

    // 将当前模块的记录其他模块的hash单独打包为一个文件 runtime
    // 解决：修改a文件导致b文件的contenthash变化
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`
    },

    minimizer: [
      // 配置生产环境的压缩方案：js和css
      new TerserWebpackPlugin({
        // 开启缓存
        cache: true,
        // 开启多进程打包
        parallel: true,
        // 启动source-map
        sourceMap: true
      })
    ]
    
  }
}