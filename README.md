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

// 请求拦截中间件：添加认证信息
const authMiddleware = {
  request: async (ctx) => {
    // 在请求前添加认证头
    ctx.options.headers = {
      ...ctx.options.headers,
      'Authorization': 'Bearer your-token-here'
    };
  }
};

// 响应处理中间件：自动解析 JSON 响应
const jsonMiddleware = {
  response: async (ctx) => {
    const response = ctx.response;
    const contentType = response.headers.get('Content-Type');
    
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      // 将解析后的数据存储在 ctx.extra 中
      ctx.extra = { data };
    }
  }
};

// 错误处理中间件：统一处理错误
const errorMiddleware = {
  request: async (ctx) => {
    // 可以在请求前进行一些配置
    ctx.options.headers = {
      ...ctx.options.headers,
      'Accept': 'application/json'
    };
  },
  response: async (ctx) => {
    // 处理非 2xx 的响应
    if (!ctx.response.ok) {
      throw new Error(`HTTP Error: ${ctx.response.status}`);
    }
  }
};

// 使用示例
try {
  // 组合多个中间件，按照顺序执行
  const response = await compositeFetch(
    'https://api.example.com/data',
    {
      method: 'GET'
    },
    [errorMiddleware, authMiddleware, jsonMiddleware]
  );

  // 获取解析后的数据
  console.log('Response data:', response);
  if (ctx.extra?.data) {
    console.log('Parsed JSON data:', ctx.extra.data);
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

## 中间件执行顺序
中间件执行顺序遵循洋葱模型：
1. errorMiddleware.request
2. authMiddleware.request
3. jsonMiddleware.request
4. 实际的 fetch 请求
5. jsonMiddleware.response
6. authMiddleware.response
7. errorMiddleware.response

## 中间件类型定义
```typescript
type Middleware = {
  request?: (ctx: Context) => Promise<void>;
  response?: (ctx: Context) => Promise<void>;
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
