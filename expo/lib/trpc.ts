import { httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

import type { AppRouter } from "@/backend/trpc/app-router";
import { supabase } from "@/lib/supabase";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

  if (!url) {
    throw new Error(
      "EXPO_PUBLIC_RORK_API_BASE_URL is not set. Please add it to your .env file.",
    );
  }

  return url;
};

/**
 * Retrieves the current Supabase access token to attach as a Bearer header.
 * Returns an empty string when the user is not signed in.
 */
async function getAccessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      /**
       * Attach the Supabase Bearer token to every tRPC request so the backend
       * can authenticate the caller via `protectedProcedure`.
       */
      async headers() {
        const token = await getAccessToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
