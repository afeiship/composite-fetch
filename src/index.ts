type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>;

interface Context {
  url: string;
  options?: RequestInit;
  response: Response | null;
  error: Error | null;
}

const compose = (middlewares: Middleware[]) => {
  return function (ctx: Context) {
    let index = -1;
    const steps: Array<() => Promise<void>> = [];

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      index = i;
      const fn = middlewares[i];
      if (!fn) return;

      let isNextCalled = false;
      const next = async () => {
        isNextCalled = true;
        return dispatch(i + 1);
      };

      await fn(ctx, () => {
        const promise = next();
        steps.push(async () => {
          await promise;
        });
        return promise;
      });

      if (!isNextCalled) {
        await next();
      }

      // 执行响应处理
      const currentStep = steps.pop();
      if (currentStep) {
        await currentStep();
      }
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
