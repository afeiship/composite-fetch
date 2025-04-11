import compositeFetch from '../src';

describe('Extra field test cases', () => {
  it('should initialize with null extra field', async () => {
    const middleware = {
      request: async (ctx: any) => {
        expect(ctx.extra).toBe(null);
      }
    };

    await compositeFetch('https://httpbin.org/get', {}, [middleware]);
  });

  it('should allow setting extra field in middleware', async () => {
    const testData = { key: 'value' };
    const middleware1 = {
      request: async (ctx: any) => {
        ctx.extra = testData;
      }
    };

    const middleware2 = {
      request: async (ctx: any) => {
        expect(ctx.extra).toEqual(testData);
      }
    };

    await compositeFetch('https://httpbin.org/get', {}, [middleware1, middleware2]);
  });

  it('should persist extra field modifications through middleware chain', async () => {
    const middleware1 = {
      request: async (ctx: any) => {
        ctx.extra = { count: 1 };
      }
    };

    const middleware2 = {
      request: async (ctx: any) => {
        ctx.extra.count += 1;
      }
    };

    const middleware3 = {
      request: async (ctx: any) => {
        expect(ctx.extra.count).toBe(2);
      }
    };

    await compositeFetch('https://httpbin.org/get', {}, [middleware1, middleware2, middleware3]);
  });
});
