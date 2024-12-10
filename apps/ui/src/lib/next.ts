export function errorHandler<T, U>(handler: (req: T) => Promise<U>) {
  return async function (req: Request) {
    try {
      const body: T = await req.json();
      const result = await handler(body);
      return Response.json(result);
    } catch (err) {
      return new Response((err as Error).message, { status: 500 });
    }
  };
}
