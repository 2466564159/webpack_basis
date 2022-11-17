import '../css/index.less';
import '../css/iconfont.css';

const add = (x, y) => x + y;

new Promise((resolve) => {
  setTimeout(() => {
    resolve(123);
  }, 2000);
})
  .then((result) => {
    console.log(result);
  });

const m = new Map();
m.set('name', 'zx');

console.log(m.get('name'));
console.log(add(1, 2));
console.log(add(2, 2));
