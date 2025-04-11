import compositeFetch from '../src/index.js';

describe('Sync middleware test cases', () => {
  it('should handle synchronous request middleware', async () => {
    const processed: string[] = [];

    const syncMiddleware = {
      request: (ctx: any) => {
        processed.push('sync request');
        ctx.options.headers = {
          ...ctx.options.headers,
          'X-Test': 'test'
        };
      }
    };

    await compositeFetch('https://httpbin.org/get', {}, [syncMiddleware]);
    expect(processed).toEqual(['sync request']);
  });

  it('should handle synchronous response middleware', async () => {
    const processed: string[] = [];

    const syncMiddleware = {
      response: (ctx: any) => {
        processed.push('sync response');
      }
    };

    await compositeFetch('https://httpbin.org/get', {}, [syncMiddleware]);
    expect(processed).toEqual(['sync response']);
  });

  it('should handle mixed sync and async middleware', async () => {
    const processed: string[] = [];

    const syncMiddleware = {
      request: (ctx: any) => {
        processed.push('sync request');
      },
      response: (ctx: any) => {
        processed.push('sync response');
      }
    };

    const asyncMiddleware = {
      request: async (ctx: any) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        processed.push('async request');
      },
      response: async (ctx: any) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        processed.push('async response');
      }
    };

    await compositeFetch('https://httpbin.org/get', {}, [syncMiddleware, asyncMiddleware]);
    expect(processed).toEqual(['sync request', 'async request', 'sync response', 'async response']);
  });
});