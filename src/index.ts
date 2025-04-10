type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>;

interface Context {
  url: string;
  options?: RequestInit;
  data?: any;
  response: Response | null;
  error: Error | null;
}

const compose = (middlewares: Middleware[]) => {
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
  interceptors?: Middleware[]
): Promise<Response> => {
  const ctx: Context = {
    url,
    options: options || {},
    data: null,
    response: null,
    error: null
  };

  const composed = compose([
    ...(interceptors || []),
    async (ctx) => {
      try {
        const res = await fetch(ctx.url, ctx.options);
        ctx.response = res;
      } catch (err) {
        ctx.error = err as Error;
      }
    }
  ]);

  await composed(ctx);

  if (ctx.error) throw ctx.error;
  return ctx.response!;
};

export default compositeFetch;
