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

// 基本用法 - 不带任何参数
const response1 = await compositeFetch('https://api.example.com');

// 使用自定义选项
const response2 = await compositeFetch('https://api.example.com', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ data: 'example' })
});

// 使用中间件
const headerMiddleware = {
  priority: 1, // 优先级是可选的，默认为 0
  fn: async (ctx, next) => {
    ctx.options.headers = {
      ...ctx.options.headers,
      'X-Custom-Header': 'custom-value'
    };
    await next();
  }
};

const logMiddleware = {
  priority: 2,
  fn: async (ctx, next) => {
    console.log('Request:', ctx.url);
    await next();
    console.log('Response:', ctx.response?.status);
  }
};

// 使用多个中间件发起请求
const response3 = await compositeFetch('https://api.example.com', {}, [
  headerMiddleware,
  logMiddleware
]);
```

## features
- 支持中间件机制，可以自定义请求和响应的处理逻辑
- 中间件优先级排序，通过可选的 priority 字段控制执行顺序（默认为 0）
- 完整的错误处理，包括网络错误和中间件错误
- 灵活的参数配置，支持可选的 options 和中间件数组
- TypeScript 支持，提供完整的类型定义

## middleware context
中间件函数接收两个参数：
- `ctx`: 上下文对象，包含以下属性：
  - `url`: 请求 URL
  - `options`: 请求配置选项（可选）
  - `response`: 响应对象（在请求完成后可用）
  - `error`: 错误对象（如果发生错误）
- `next`: 调用下一个中间件的函数

## error handling
```js
try {
  const response = await compositeFetch('https://api.example.com');
} catch (error) {
  // 处理网络错误或中间件错误
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
