import '../css/index.less';
import '../css/iconfont.css';
import $ from 'jquery';

console.log($);

// 注册serviceWorker
// 处理兼容性问题
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

// const add = (x, y) => x + y;

// console.log(add(1, 2));
// console.log(add(2, 2));

// new Promise((resolve) => {
//   setTimeout(() => {
//     resolve(111);
//   }, 2000);
// })
//   .then((result) => {
//     console.log(result);
//   });

// const m = new Map();
// m.set('name', 'zx');

// console.log(m.get('name'));
