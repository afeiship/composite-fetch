# composite-fetch
> A minimal fetch wrapper with middleware support and customizable behavior.

[![version][version-image]][version-url]
[![license][license-image]][license-url]
[![size][size-image]][size-url]
[![download][download-image]][download-url]

## installation
```shell
yarn add @jswork/composite-fetch
```

## usage
```js
import compositeFetch from '@jswork/composite-fetch';

// 创建一个添加自定义请求头的中间件
const headerMiddleware = {
  priority: 1,
  fn: async (ctx, next) => {
    ctx.options.headers = {
      ...ctx.options.headers,
      'X-Custom-Header': 'custom-value'
    };
    await next();
  }
};

// 创建一个日志中间件
const logMiddleware = {
  priority: 2,
  fn: async (ctx, next) => {
    console.log('Request:', ctx.url);
    await next();
    console.log('Response:', ctx.response?.status);
  }
};

// 使用多个中间件发起请求
const response = await compositeFetch('https://api.example.com', {}, [
  headerMiddleware,
  logMiddleware
]);
const data = await response.json();

// 中间件是可选的
const simpleResponse = await compositeFetch('https://api.example.com');
```

## features
- 支持中间件机制，可以自定义请求和响应的处理逻辑
- 中间件优先级排序，通过 priority 字段控制执行顺序
- 完整的错误处理，包括网络错误和中间件错误
- TypeScript 支持，提供完整的类型定义

## license
Code released under [the MIT license](https://github.com/afeiship/composite-fetch/blob/master/LICENSE.txt).

[version-image]: https://img.shields.io/npm/v/@jswork/composite-fetch
[version-url]: https://npmjs.org/package/@jswork/composite-fetch

[license-image]: https://img.shields.io/npm/l/@jswork/composite-fetch
[license-url]: https://github.com/afeiship/composite-fetch/blob/master/LICENSE.txt

[size-image]: https://img.shields.io/bundlephobia/minzip/@jswork/composite-fetch
[size-url]: https://github.com/afeiship/composite-fetch/blob/master/dist/composite-fetch.min.js

[download-image]: https://img.shields.io/npm/dm/@jswork/composite-fetch
[download-url]: https://www.npmjs.com/package/@jswork/composite-fetch
