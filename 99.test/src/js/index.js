
console.log('index文件被加载')


setTimeout(async () => {
  // es6
  import(/* webpackChunkName: 'a' */ './a')
    .then(res => {
      res.default()
    })

  // commonjs
  // const a = require('./a')
  // a()
}, 1000)