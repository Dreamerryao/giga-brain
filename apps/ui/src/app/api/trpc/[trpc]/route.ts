import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { appRouter } from '@/trpc/app-router';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
    onError: ({ error, path }) => {
      // Ensure errors are properly serialized for Cloudflare
      console.error(`Error in tRPC handler [${path}]:`, error);
      return {
        message: error.message,
        code: error.code,
        data: {
          cause: error.cause ? JSON.stringify(error.cause) : undefined,
        },
      };
    },
  });

export { handler as GET, handler as POST };
