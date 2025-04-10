# composite-fetch
> A minimal fetch wrapper with middleware support and customizable behavior.

[![version][version-image]][version-url]
[![license][license-image]][license-url]
[![size][size-image]][size-url]
[![download][download-image]][download-url]

## Installation
```shell
yarn add @jswork/composite-fetch
```

## Features
- Middleware support for customizing request and response handling
- Priority-based middleware ordering with optional priority field (default: 0)
- Support for both object-style and function-style middleware definitions
- Comprehensive error handling for network and middleware errors
- Flexible parameter configuration with optional options and middleware array
- Full TypeScript support with complete type definitions

## Usage

### Basic Usage
```js
import compositeFetch from '@jswork/composite-fetch';

// Basic usage - without any parameters
const response1 = await compositeFetch('https://api.example.com');

// Using custom options
const response2 = await compositeFetch('https://api.example.com', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ data: 'example' })
});
```

### Using Middleware

#### Object-Style Middleware
```js
// Object-style middleware with priority
const headerMiddleware = {
  priority: 1, // Priority is optional, defaults to 0
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
```

#### Function-Style Middleware
```js
// Direct function middleware (priority defaults to 0)
const timingMiddleware = async (ctx, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`Request took ${duration}ms`);
};

// Using both styles together
const response3 = await compositeFetch('https://api.example.com', {}, [
  headerMiddleware,
  timingMiddleware, // Function-style middleware
  logMiddleware
]);
```

## Middleware Context
Middleware functions receive two parameters:
- `ctx`: Context object with the following properties:
  - `url`: Request URL
  - `options`: Request configuration options (optional)
  - `response`: Response object (available after request completion)
  - `error`: Error object (if an error occurs)
- `next`: Function to call the next middleware

## Error Handling
```js
try {
  const response = await compositeFetch('https://api.example.com');
} catch (error) {
  // Handle network or middleware errors
  console.error('Request failed:', error);
}
```

## License
Code released under [the MIT license](https://github.com/afeiship/composite-fetch/blob/master/LICENSE.txt).

[version-image]: https://img.shields.io/npm/v/@jswork/composite-fetch
[version-url]: https://npmjs.org/package/@jswork/composite-fetch

[license-image]: https://img.shields.io/npm/l/@jswork/composite-fetch
[license-url]: https://github.com/afeiship/composite-fetch/blob/master/LICENSE.txt

[size-image]: https://img.shields.io/bundlephobia/minzip/@jswork/composite-fetch
[size-url]: https://github.com/afeiship/composite-fetch/blob/master/dist/composite-fetch.min.js

[download-image]: https://img.shields.io/npm/dm/@jswork/composite-fetch
[download-url]: https://www.npmjs.com/package/@jswork/composite-fetch
