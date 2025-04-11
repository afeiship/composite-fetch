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

// 第一个中间件：错误处理
const errorMiddleware = {
  request: async (ctx) => {
    console.log('1. errorMiddleware.request');
    // 第一个执行的 request 钩子
    ctx.options.headers = {
      ...ctx.options.headers,
      'Accept': 'application/json'
    };
  },
  response: async (ctx) => {
    console.log('5. errorMiddleware.response');
    // 第一个执行的 response 钩子
    if (!ctx.response.ok) {
      throw new Error(`HTTP Error: ${ctx.response.status}`);
    }
  }
};

// 第二个中间件：认证信息
const authMiddleware = {
  request: async (ctx) => {
    console.log('2. authMiddleware.request');
    // 第二个执行的 request 钩子
    ctx.options.headers = {
      ...ctx.options.headers,
      'Authorization': 'Bearer your-token-here'
    };
  },
  response: async (ctx) => {
    console.log('6. authMiddleware.response');
  }
};

// 第三个中间件：JSON 响应处理
const jsonMiddleware = {
  request: async (ctx) => {
    console.log('3. jsonMiddleware.request');
  },
  response: async (ctx) => {
    console.log('7. jsonMiddleware.response');
    // 第二个执行的 response 钩子
    const response = ctx.response;
    const contentType = response.headers.get('Content-Type');

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      ctx.extra = { data };
    }
  }
};

// 使用示例
try {
  console.log('开始执行中间件链：');
  // 中间件按照数组顺序依次执行
  // 1. errorMiddleware.request
  // 2. authMiddleware.request
  // 3. jsonMiddleware.request (如果有)
  // 4. 发起实际的 fetch 请求
  // 5. errorMiddleware.response
  // 6. authMiddleware.response (如果有)
  // 7. jsonMiddleware.response
  const response = await compositeFetch(
    'https://httpbin.org/get',
    {
      method: 'GET'
    },
    [errorMiddleware, authMiddleware, jsonMiddleware]
  );
  console.log('Response data:', response);
} catch (error) {
  console.error('Request failed:', error);
}
```

## middleware execution order
The middleware execution follows a sequential order:
1. Request hooks are executed in array order
2. Actual fetch request is made
3. Response hooks are executed in array order

For example, with [errorMiddleware, authMiddleware, jsonMiddleware]:
1. errorMiddleware.request
2. authMiddleware.request
3. jsonMiddleware.request
4. Actual fetch request
5. errorMiddleware.response
6. authMiddleware.response
7. jsonMiddleware.response

## middleware signature
```typescript
type Middleware = {
  request?: (ctx: Context) => void | Promise<void>;
  response?: (ctx: Context) => void | Promise<void>;
};

interface Context {
  url: string;
  options?: RequestInit;
  extra?: any;
  response: Response | null;
  error: Error | null;
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
