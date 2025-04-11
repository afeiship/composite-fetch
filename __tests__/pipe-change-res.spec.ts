import compositeFetch from '../src';

describe('Response pipe change test cases', () => {
  it('should modify response data in middleware', async () => {
    const middleware = {
      response: async (ctx: any) => {
        const data = await ctx.response.json();
        data.modified = true;
        ctx.response = new Response(JSON.stringify(data), {
          status: ctx.response.status,
          headers: ctx.response.headers
        });
      }
    };

    const response = await compositeFetch('https://httpbin.org/get', {}, [middleware]);
    const data = await response.json();
    expect(data.modified).toBe(true);
  });

  it('should transform response format', async () => {
    const middleware = {
      response: async (ctx: any) => {
        const data = await ctx.response.json();
        ctx.response = new Response(JSON.stringify({ wrapped: data }), {
          status: ctx.response.status,
          headers: ctx.response.headers
        });
      }
    };

    const response = await compositeFetch('https://httpbin.org/get', {}, [middleware]);
    const data = await response.json();
    expect(data.wrapped).toBeDefined();
    expect(data.wrapped.url).toBe('https://httpbin.org/get');
  });

  it('should process response in correct middleware order (onion model)', async () => {
    const processed: string[] = [];

    const middleware1 = {
      request: async (ctx: any) => {
        processed.push('request1');
      },
      response: async (ctx: any) => {
        processed.push('response1');
      }
    };

    const middleware2 = {
      request: async (ctx: any) => {
        processed.push('request2');
      },
      response: async (ctx: any) => {
        processed.push('response2');
      }
    };

    await compositeFetch('https://httpbin.org/get', {}, [middleware1, middleware2]);
    expect(processed).toEqual(['request1', 'request2', 'response1', 'response2']);
  });

  it('should handle error in response middleware', async () => {
    const middleware = {
      response: async (ctx: any) => {
        throw new Error('Test error');
      }
    };

    try {
      await compositeFetch('https://httpbin.org/get', {}, [middleware]);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toBe('Test error');
    }
  });

  it('should handle multiple response transformations in order', async () => {
    const middleware1 = {
      response: async (ctx: any) => {
        const data = await ctx.response.json();
        data.first = true;
        ctx.response = new Response(JSON.stringify(data), {
          status: ctx.response.status,
          headers: ctx.response.headers
        });
      }
    };

    const middleware2 = {
      response: async (ctx: any) => {
        const data = await ctx.response.json();
        data.second = true;
        ctx.response = new Response(JSON.stringify(data), {
          status: ctx.response.status,
          headers: ctx.response.headers
        });
      }
    };

    const response = await compositeFetch('https://httpbin.org/get', {}, [middleware1, middleware2]);
    const data = await response.json();
    expect(data.first).toBe(true);
    expect(data.second).toBe(true);
  });
});