import compositeFetch from '../src';

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
    const middleware = {
      priority: 1,
      fn: async (ctx: any, next: () => Promise<void>) => {
        ctx.options.headers = {
          ...ctx.options.headers,
          'X-Custom-Header': 'test-value'
        };
        await next();
      }
    };

    const response = await compositeFetch('https://httpbin.org/headers', {}, [middleware]);
    const data = await response.json();
    expect(data.headers['X-Custom-Header']).toBe('test-value');
  });
});

describe('Middleware priority and composition', () => {
  it('should execute middlewares in priority order', async () => {
    const order: number[] = [];

    const middleware1 = {
      priority: 2,
      fn: async (ctx: any, next: () => Promise<void>) => {
        order.push(2);
        await next();
      }
    };

    const middleware2 = {
      priority: 1,
      fn: async (ctx: any, next: () => Promise<void>) => {
        order.push(1);
        await next();
      }
    };

    await compositeFetch('https://httpbin.org/get', {}, [middleware1, middleware2]);
    expect(order).toEqual([1, 2]);
  });

  it('should handle multiple middlewares modifying the same context', async () => {
    const headerMiddleware = {
      priority: 1,
      fn: async (ctx: any, next: () => Promise<void>) => {
        ctx.options.headers = {
          ...ctx.options.headers,
          'X-Header-1': 'value-1'
        };
        await next();
      }
    };

    const secondHeaderMiddleware = {
      priority: 2,
      fn: async (ctx: any, next: () => Promise<void>) => {
        ctx.options.headers = {
          ...ctx.options.headers,
          'X-Header-2': 'value-2'
        };
        await next();
      }
    };

    const response = await compositeFetch('https://httpbin.org/headers', {}, [
      headerMiddleware,
      secondHeaderMiddleware
    ]);
    const data = await response.json();
    expect(data.headers['X-Header-1']).toBe('value-1');
    expect(data.headers['X-Header-2']).toBe('value-2');
  });
});

describe('Error handling', () => {
  it('should handle network errors', async () => {
    try {
      await compositeFetch('https://invalid-url');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should handle middleware errors', async () => {
    const errorMiddleware = {
      priority: 1,
      fn: async () => {
        throw new Error('Middleware error');
      }
    };

    try {
      await compositeFetch('https://httpbin.org/get', {}, [errorMiddleware]);
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toBe('Middleware error');
    }
  });

  it('should handle multiple next() calls', async () => {
    const invalidMiddleware = {
      priority: 1,
      fn: async (ctx: any, next: () => Promise<void>) => {
        await next();
        await next(); // This should throw an error
      }
    };

    try {
      await compositeFetch('https://httpbin.org/get', {}, [invalidMiddleware]);
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toBe('next() called multiple times');
    }
  });
});

describe('Edge cases', () => {
  it('should work with empty middleware array', async () => {
    const response = await compositeFetch('https://httpbin.org/get', {}, []);
    expect(response.ok).toBe(true);
  });

  it('should handle middleware that does not call next()', async () => {
    const noNextMiddleware = {
      priority: 1,
      fn: async () => {
        // Intentionally not calling next()
      }
    };

    const response = await compositeFetch('https://httpbin.org/get', {}, [noNextMiddleware]);
    expect(response).toBeDefined();
  });
});

describe('Direct middleware function support', () => {
  it('should support direct middleware functions', async () => {
    const order: number[] = [];

    const directMiddleware = async (ctx: any, next: () => Promise<void>) => {
      order.push(1);
      await next();
    };

    const objectMiddleware = {
      priority: 2,
      fn: async (ctx: any, next: () => Promise<void>) => {
        order.push(2);
        await next();
      }
    };

    await compositeFetch('https://httpbin.org/get', {}, [directMiddleware, objectMiddleware]);
    expect(order).toEqual([1, 2]);
  });

  it('should treat direct middleware functions with default priority 0', async () => {
    const order: number[] = [];

    const directMiddleware = async (ctx: any, next: () => Promise<void>) => {
      order.push(1);
      await next();
    };

    const objectMiddleware = {
      priority: -1,
      fn: async (ctx: any, next: () => Promise<void>) => {
        order.push(2);
        await next();
      }
    };

    await compositeFetch('https://httpbin.org/get', {}, [directMiddleware, objectMiddleware]);
    expect(order).toEqual([2, 1]);
  });
});

describe('Optional priority field', () => {
  it('should handle middleware without priority field', async () => {
    const order: number[] = [];

    const middleware1 = {
      fn: async (ctx: any, next: () => Promise<void>) => {
        order.push(1);
        await next();
      }
    };

    const middleware2 = {
      priority: 1,
      fn: async (ctx: any, next: () => Promise<void>) => {
        order.push(2);
        await next();
      }
    };

    const middleware3 = {
      fn: async (ctx: any, next: () => Promise<void>) => {
        order.push(3);
        await next();
      }
    };

    await compositeFetch('https://httpbin.org/get', {}, [middleware1, middleware2, middleware3]);
    expect(order).toEqual([1, 3, 2]);
  });

  it('should handle all middlewares without priority field', async () => {
    const order: number[] = [];

    const middleware1 = {
      fn: async (ctx: any, next: () => Promise<void>) => {
        order.push(1);
        await next();
      }
    };

    const middleware2 = {
      fn: async (ctx: any, next: () => Promise<void>) => {
        order.push(2);
        await next();
      }
    };

    await compositeFetch('https://httpbin.org/get', {}, [middleware1, middleware2]);
    expect(order).toEqual([1, 2]);
  });

  it('should preserve middleware context modifications', async () => {
    const middleware1 = {
      fn: async (ctx: any, next: () => Promise<void>) => {
        ctx.options.headers = {
          ...ctx.options.headers,
          'X-Test-1': 'value-1'
        };
        await next();
      }
    };

    const middleware2 = {
      priority: 1,
      fn: async (ctx: any, next: () => Promise<void>) => {
        ctx.options.headers = {
          ...ctx.options.headers,
          'X-Test-2': 'value-2'
        };
        await next();
      }
    };

    const response = await compositeFetch('https://httpbin.org/headers', {}, [
      middleware1,
      middleware2
    ]);
    const data = await response.json();
    expect(data.headers['X-Test-1']).toBe('value-1');
    expect(data.headers['X-Test-2']).toBe('value-2');
  });
});

describe('Options parameter', () => {
  it('should work without options parameter', async () => {
    const response = await compositeFetch('https://httpbin.org/get');
    expect(response.ok).toBe(true);
  });

  it('should work with custom options', async () => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: 'data' })
    };

    const response = await compositeFetch('https://httpbin.org/post', options);
    const data = await response.json();
    expect(data.headers['Content-Type']).toBe('application/json');
    expect(data.json.test).toBe('data');
  });
});
