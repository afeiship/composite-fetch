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

const compose = (middlewares: Middleware[]) => {
  return function (ctx: Context) {
    let index = -1;
    const responseHandlers: (() => Promise<void>)[] = [];

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      index = i;
      const middleware = middlewares[i];

      if (!middleware) {
        // 执行实际的 fetch 请求
        try {
          const res = await fetch(ctx.url, ctx.options);
          ctx.response = res;
        } catch (err) {
          ctx.error = err as Error;
        }
        // 按顺序执行所有响应钩子
        for (const handler of responseHandlers.reverse()) {
          await handler();
        }
        return;
      }

      // 执行请求前的钩子
      if (middleware.request) {
        await middleware.request(ctx);
      }

      // 收集响应钩子
      if (middleware.response) {
        responseHandlers.push(() => middleware.response!(ctx));
      }

      // 执行下一个中间件
      await dispatch(i + 1);
    };

    return dispatch(0);
  };
};

const compositeFetch = async (
  url: string,
  options?: RequestInit,
  interceptors?: Middleware[]
): Promise<Response> => {
  const ctx: Context = {
    url,
    options: options || {},
    extra: null,
    response: null,
    error: null
  };

  const composed = compose(interceptors || []);
  await composed(ctx);

  if (ctx.error) throw ctx.error;
  return ctx.response!;
};

export default compositeFetch;
