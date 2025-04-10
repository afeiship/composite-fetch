import compositeFetch from '../src';

describe('Middleware execution order', () => {
  it('should execute middleware in onion model order', async () => {
    const order: string[] = [];

    const middleware1 = async (ctx: any, next: () => Promise<void>) => {
      order.push('before1');
      await next();
      order.push('after1');
    };

    const middleware2 = async (ctx: any, next: () => Promise<void>) => {
      order.push('before2');
      await next();
      order.push('after2');
    };

    await compositeFetch('https://httpbin.org/get', {}, [middleware1, middleware2]);
    expect(order).toEqual(['before1', 'after1', 'before2', 'after2']);
  });

  it('should handle errors in middleware chain', async () => {
    const order: string[] = [];
    const errorMiddleware = async (ctx: any, next: () => Promise<void>) => {
      order.push('before-error');
      throw new Error('Test error');
    };

    const middleware = async (ctx: any, next: () => Promise<void>) => {
      order.push('before');
      await next();
      order.push('after');
    };

    try {
      await compositeFetch('https://httpbin.org/get', {}, [middleware, errorMiddleware]);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Test error');
    }
    expect(order).toEqual(['before', 'after', 'before-error']);
  });

  it('should handle multiple middlewares with error', async () => {
    const order: string[] = [];

    const middleware1 = async (ctx: any, next: () => Promise<void>) => {
      order.push('before1');
      await next();
      order.push('after1');
    };

    const errorMiddleware = async (ctx: any, next: () => Promise<void>) => {
      order.push('before-error');
      throw new Error('Middleware error');
      await next();
      order.push('after-error');
    };

    const middleware3 = async (ctx: any, next: () => Promise<void>) => {
      order.push('before3');
      await next();
      order.push('after3');
    };

    try {
      await compositeFetch('https://httpbin.org/get', {}, [middleware1, errorMiddleware, middleware3]);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Middleware error');
    }
    expect(order).toEqual(['before1', 'after1', 'before-error']);
  });

  it('should handle fetch error in middleware chain', async () => {
    const order: string[] = [];

    const middleware = async (ctx: any, next: () => Promise<void>) => {
      order.push('before');
      await next();
      order.push('after');
    };

    try {
      await compositeFetch('invalid-url', {}, [middleware]);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
    expect(order).toEqual(['before', 'after']);
  });
});

describe('Normal test cases', () => {
  it('should make a successful GET request', async () => {
    const response = await compositeFetch('https://httpbin.org/get');
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.url).toBe('https://httpbin.org/get');
  });

  it('should handle 404 error', async () => {
    try {
      await compositeFetch('https://httpbin.org/status/404');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should work with middleware', async () => {
    const middleware = async (ctx: any, next: () => Promise<void>) => {
      ctx.options.headers = {
        ...ctx.options.headers,
        'X-Custom-Header': 'test-value'
      };
      await next();
    };

    const response = await compositeFetch('https://httpbin.org/headers', {}, [middleware]);
    const data = await response.json();
    expect(data.headers['X-Custom-Header']).toBe('test-value');
  });

  it('should work with only options parameter', async () => {
    const response = await compositeFetch('https://httpbin.org/headers', {
      headers: { 'X-Test-Header': 'test-value' }
    });
    const data = await response.json();
    expect(data.headers['X-Test-Header']).toBe('test-value');
  });

  it('should work with only interceptors parameter', async () => {
    const middleware = async (ctx: any, next: () => Promise<void>) => {
      ctx.options.headers = { 'X-Interceptor-Header': 'test-value' };
      await next();
    };
    const response = await compositeFetch('https://httpbin.org/headers', undefined, [middleware]);
    const data = await response.json();
    expect(data.headers['X-Interceptor-Header']).toBe('test-value');
  });
});

describe('Normal test cases', () => {
  it('should make a successful GET request', async () => {
    const response = await compositeFetch('https://httpbin.org/get');
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.url).toBe('https://httpbin.org/get');
  });

  it('should handle 404 error', async () => {
    try {
      await compositeFetch('https://httpbin.org/status/404');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should work with middleware', async () => {
    const middleware = async (ctx: any, next: () => Promise<void>) => {
      ctx.options.headers = {
        ...ctx.options.headers,
        'X-Custom-Header': 'test-value'
      };
      await next();
    };

    const response = await compositeFetch('https://httpbin.org/headers', {}, [middleware]);
    const data = await response.json();
    expect(data.headers['X-Custom-Header']).toBe('test-value');
  });

  it('should work with only options parameter', async () => {
    const response = await compositeFetch('https://httpbin.org/headers', {
      headers: { 'X-Test-Header': 'test-value' }
    });
    const data = await response.json();
    expect(data.headers['X-Test-Header']).toBe('test-value');
  });

  it('should work with only interceptors parameter', async () => {
    const middleware = async (ctx: any, next: () => Promise<void>) => {
      ctx.options.headers = { 'X-Interceptor-Header': 'test-value' };
      await next();
    };
    const response = await compositeFetch('https://httpbin.org/headers', undefined, [middleware]);
    const data = await response.json();
    expect(data.headers['X-Interceptor-Header']).toBe('test-value');
  });
});
