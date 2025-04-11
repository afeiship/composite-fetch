type Middleware = {
  request?: (ctx: Context) => void | Promise<void>;
  response?: (ctx: Context) => void | Promise<void>;
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
    const responseHandlers: (() => void | Promise<void>)[] = [];

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      index = i;
      const middleware = middlewares[i];

      if (!middleware) {
        // Execute the actual fetch request
        try {
          ctx.response = await fetch(ctx.url, ctx.options);
        } catch (err) {
          ctx.error = err as Error;
        }
        // Execute all response handlers in order
        for (const handler of responseHandlers) {
          await handler();
        }
        return;
      }

      // Execute request hook before fetch
      if (middleware.request) {
        await middleware.request(ctx);
      }

      // Collect response handlers
      if (middleware.response) {
        responseHandlers.push(() => middleware.response!(ctx));
      }

      // Execute next middleware
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
