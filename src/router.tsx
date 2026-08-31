import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { routeTree } from "./routeTree.gen";
import { supabase } from "./lib/supabase";

export type RouterContext = {
  queryClient: QueryClient;
  supabase: typeof supabase;
  session: Session | null;
};

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
      supabase,
      // session starts as null — __root.tsx beforeLoad resolves the real value
      session: null as Session | null,
    } satisfies RouterContext,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
