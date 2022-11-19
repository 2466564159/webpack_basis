console.log('index.js被加载')

import '../css/index.less'
import '../css/iconfont.css'
import a from './a'

a()

if (module.hot) {
  module.hot.accept('./a.js', () => {
    a()
  })
}