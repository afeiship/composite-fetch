import compositeFetch from '../src';

describe('Extra field test cases', () => {
  it('should initialize with null extra field', async () => {
    const middleware = async (ctx: any, next: () => Promise<void>) => {
      expect(ctx.extra).toBe(null);
      await next();
    };

    await compositeFetch('https://httpbin.org/get', {}, [middleware]);
  });

  it('should allow setting extra field in middleware', async () => {
    const testData = { key: 'value' };
    const middleware1 = async (ctx: any, next: () => Promise<void>) => {
      ctx.extra = testData;
      await next();
    };

    const middleware2 = async (ctx: any, next: () => Promise<void>) => {
      expect(ctx.extra).toEqual(testData);
      await next();
    };

    await compositeFetch('https://httpbin.org/get', {}, [middleware1, middleware2]);
  });

  it('should persist extra field modifications through middleware chain', async () => {
    const middleware1 = async (ctx: any, next: () => Promise<void>) => {
      ctx.extra = { count: 1 };
      await next();
    };

    const middleware2 = async (ctx: any, next: () => Promise<void>) => {
      ctx.extra.count += 1;
      await next();
    };

    const middleware3 = async (ctx: any, next: () => Promise<void>) => {
      expect(ctx.extra.count).toBe(2);
      await next();
    };

    await compositeFetch('https://httpbin.org/get', {}, [middleware1, middleware2, middleware3]);
  });

  it('should handle different types of extra field data', async () => {
    const testCases = [
      { value: 42, description: 'number' },
      { value: 'test string', description: 'string' },
      { value: { nested: { data: true } }, description: 'object' },
      { value: [1, 2, 3], description: 'array' }
    ];

    for (const testCase of testCases) {
      const middleware = async (ctx: any, next: () => Promise<void>) => {
        ctx.extra = testCase.value;
        await next();
        expect(ctx.extra).toEqual(testCase.value);
      };

      await compositeFetch('https://httpbin.org/get', {}, [middleware]);
    }
  });
});