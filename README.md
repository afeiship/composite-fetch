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

const jsonMiddleware = async (ctx, next) => {

  // add coustom header
  ctx.request.headers.set('X-Custom-Header', 'test-value');

  await next();
  const response = ctx.response;
  const contentType = response.headers.get('Content-Type');
  if (
    contentType &&
    contentType.indexOf('application/json') !== -1
  ) {
    ctx.data = await response.json();
  }
};

// 定义中间件
const middleware1 = async (ctx, next) => {
  console.log('Middleware 1: Before');
  await next();
  console.log('Middleware 1: After');
};

const middleware2 = async (ctx, next) => {
  console.log('Middleware 2: Before');
  await next();
  console.log('Middleware 2: After');
};

// 使用示例
try {
  const response = await compositeFetch(
    'https://httpbin.org/headers',
    null,
    [jsonMiddleware, middleware1, middleware2]
  );

  console.log('Response headers:', response);
  // 输出将包含自定义头部 'X-Custom-Header: test-value'
} catch (error) {
  console.error('Request failed:', error);
}
```

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
