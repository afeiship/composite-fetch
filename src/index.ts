type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>;

interface Context {
  url: string;
  options?: RequestInit;
  response: Response | null;
  error: Error | null;
}

const compose = (middlewares: Middleware[]) => {
  return async function (ctx: Context): Promise<void> {
    for (const middleware of middlewares) {
      await middleware(ctx, async () => {});
    }
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
