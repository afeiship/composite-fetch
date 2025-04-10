type MiddlewareFunction = (ctx: Context, next: () => Promise<void>) => Promise<void>;

interface Middleware {
  priority?: number;
  fn: MiddlewareFunction;
}

interface Context {
  url: string;
  options: RequestInit | undefined;
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
  options?: RequestInit,
  registeredMiddlewares?: (Middleware | MiddlewareFunction)[]
): Promise<Response> => {
  const ctx: Context = {
    url,
    options,
    response: null,
    error: null
  };

  // Sort middlewares by priority and normalize to MiddlewareFunction
  const sortedMiddlewares = (registeredMiddlewares || [])
    .map(middleware => typeof middleware === 'function' ? middleware : middleware.fn)
    .map((fn, index) => ({
      priority: typeof registeredMiddlewares![index] === 'function' ? 0 : (registeredMiddlewares![index] as Middleware).priority || 0,
      fn
    }))
    .sort((a, b) => a.priority - b.priority)
    .map(middleware => middleware.fn);

  // Add default fetch middleware
  const finalMiddlewares = [
    ...sortedMiddlewares,
    async (ctx) => {
      try {
        const res = await fetch(ctx.url, ctx.options);
        ctx.response = res;
      } catch (err) {
        ctx.error = err as Error;
      }
    }
  ];

  const composed = compose(finalMiddlewares);

  await composed(ctx);

  if (ctx.error) throw ctx.error;
  return ctx.response!;
};

export default compositeFetch;
