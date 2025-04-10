import compositeFetch from '../src';

describe('Add token middleware real-world scenarios', () => {
  it('should demonstrate encapsulated fetch instance usage', async () => {
    // 创建一个封装的 fetch 实例
    const createCustomFetch = (baseToken: string) => {
      let currentToken = baseToken;

      // 预设认证令牌中间件
      const authMiddleware = async (ctx: any, next: () => Promise<void>) => {
        ctx.options.headers = {
          ...ctx.options.headers,
          'Authorization': `Bearer ${currentToken}`
        };
        await next();
      };

      // 返回封装后的 fetch 函数
      return {
        fetch: (url: string, options?: RequestInit) => {
          return compositeFetch(url, options, [authMiddleware]);
        },
        updateToken: (newToken: string) => {
          currentToken = newToken;
        }
      };
    };

    // 使用封装的 fetch 实例
    const customFetch = createCustomFetch('initial-token');

    // 第一次请求
    const response1 = await customFetch.fetch('https://httpbin.org/headers');
    const data1 = await response1.json();
    expect(data1.headers['Authorization']).toBe('Bearer initial-token');

    // 更新令牌
    customFetch.updateToken('updated-token');

    // 第二次请求
    const response2 = await customFetch.fetch('https://httpbin.org/headers');
    const data2 = await response2.json();
    expect(data2.headers['Authorization']).toBe('Bearer updated-token');
  });

  it('should handle token authentication flow', async () => {
    // 初始化认证令牌
    let authToken = 'initial-token';

    // 创建添加令牌的中间件
    const addTokenMiddleware = async (ctx: any, next: () => Promise<void>) => {
      ctx.options.headers = {
        ...ctx.options.headers,
        'Authorization': `Bearer ${authToken}`
      };
      await next();
    };

    // 第一次请求：使用初始令牌
    const response1 = await compositeFetch('https://httpbin.org/headers', {}, [addTokenMiddleware]);
    const data1 = await response1.json();
    expect(data1.headers['Authorization']).toBe(`Bearer ${authToken}`);

    // 模拟令牌更新
    authToken = 'updated-token';

    // 第二次请求：使用更新后的令牌
    const response2 = await compositeFetch('https://httpbin.org/headers', {}, [addTokenMiddleware]);
    const data2 = await response2.json();
    expect(data2.headers['Authorization']).toBe(`Bearer ${authToken}`);
  });

  it('should handle multiple middleware with token', async () => {
    const authToken = 'test-token';

    // 添加令牌的中间件
    const addTokenMiddleware = async (ctx: any, next: () => Promise<void>) => {
      ctx.options.headers = {
        ...ctx.options.headers,
        'Authorization': `Bearer ${authToken}`
      };
      await next();
    };

    // 添加自定义头部的中间件
    const addCustomHeaderMiddleware = async (ctx: any, next: () => Promise<void>) => {
      ctx.options.headers = {
        ...ctx.options.headers,
        'X-Custom-Header': 'custom-value'
      };
      await next();
    };

    // 组合多个中间件测试
    const response = await compositeFetch('https://httpbin.org/headers', {}, [
      addTokenMiddleware,
      addCustomHeaderMiddleware
    ]);

    const data = await response.json();
    expect(data.headers['Authorization']).toBe(`Bearer ${authToken}`);
    expect(data.headers['X-Custom-Header']).toBe('custom-value');
  });
});