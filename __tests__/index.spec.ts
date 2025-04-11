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

  it('should work with request middleware', async () => {
    const middleware = {
      request: async (ctx: any) => {
        ctx.options.headers = {
          ...ctx.options.headers,
          'X-Custom-Header': 'test-value'
        };
      }
    };

    const response = await compositeFetch('https://httpbin.org/headers', {}, [middleware]);
    const data = await response.json();
    expect(data.headers['X-Custom-Header']).toBe('test-value');
  });

  it('should work with response middleware', async () => {
    let responseData: any;
    const middleware = {
      response: async (ctx: any) => {
        responseData = await ctx.response.json();
      }
    };

    await compositeFetch('https://httpbin.org/headers', {}, [middleware]);
    expect(responseData.headers).toBeDefined();
  });

  it('should work with only options parameter', async () => {
    const response = await compositeFetch('https://httpbin.org/headers', {
      headers: { 'X-Test-Header': 'test-value' }
    });
    const data = await response.json();
    expect(data.headers['X-Test-Header']).toBe('test-value');
  });

  it('should work with both request and response hooks', async () => {
    let requestTime: number = 0;
    let responseTime: number = 0;
    const middleware = {
      request: async (ctx: any) => {
        requestTime = Date.now();
        ctx.options.headers = { 'X-Interceptor-Header': 'test-value' };
      },
      response: async (ctx: any) => {
        responseTime = Date.now();
      }
    };
    const response = await compositeFetch('https://httpbin.org/headers', undefined, [middleware]);
    const data = await response.json();
    expect(data.headers['X-Interceptor-Header']).toBe('test-value');
    expect(responseTime).toBeGreaterThan(requestTime);
  });
});
