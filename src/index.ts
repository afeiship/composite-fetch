type MiddlewareFunction = (ctx: Context, next: () => Promise<void>) => Promise<void>;

interface Middleware {
  priority: number; // 优先级字段
  fn: MiddlewareFunction; // 中间件函数
}

interface Context {
  url: string;
  options: RequestInit;
  response: Response | null;
  error: Error | null;
}

const compose = (middlewares: MiddlewareFunction[]) => {
  return function (ctx: Context) {
    let index = -1;

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      index = i;
      const fn = middlewares[i];
      if (!fn) return;
      await fn(ctx, () => dispatch(i + 1));
    };

    return dispatch(0);
  };
};

const compositeFetch = async (
  url: string,
  options: RequestInit = {},
  registeredMiddlewares?: Middleware[]
): Promise<Response> => {
  const ctx: Context = {
    url,
    options,
    response: null,
    error: null,
  };

  // 根据优先级对中间件进行排序
  const sortedMiddlewares = (registeredMiddlewares || [])
    .sort((a, b) => a.priority - b.priority) // 按优先级升序排序
    .map((middleware) => middleware.fn); // 提取中间件函数

  // 添加默认的 fetch 中间件
  const finalMiddlewares = [
    ...sortedMiddlewares,
    async (ctx) => {
      try {
        const res = await fetch(ctx.url, ctx.options);
        ctx.response = res;
      } catch (err) {
        ctx.error = err as Error;
      }
    },
  ];

  const composed = compose(finalMiddlewares);

  await composed(ctx);

  if (ctx.error) throw ctx.error;
  return ctx.response!;
};


export default compositeFetch;