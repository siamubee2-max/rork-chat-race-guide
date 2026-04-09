import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { createClient } from "@supabase/supabase-js";
import superjson from "superjson";

// ---------------------------------------------------------------------------
// Supabase admin client
// ---------------------------------------------------------------------------
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "";

// OpenAI API key — server-side only, never sent to client
export const getOpenAIKey = (): string => {
  const key = process.env.OPENAI_API_KEY ?? "";
  if (!key) console.warn("[tRPC] OPENAI_API_KEY is not set");
  return key;
};

// We create a server-side client per-request so we can set the auth header.
function makeSupabaseClient(accessToken?: string) {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });
}

// ---------------------------------------------------------------------------
// Context factory
// ---------------------------------------------------------------------------
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  // Extract the Bearer token from the Authorization header (if present)
  const authHeader = opts.req.headers.get("Authorization") ?? "";
  const accessToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  const supabase = makeSupabaseClient(accessToken);

  // If a token was provided, resolve the Supabase user
  let user: { id: string; email?: string } | null = null;
  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (!error && data.user) {
      user = { id: data.user.id, email: data.user.email };
    }
  }

  return {
    req: opts.req,
    supabase,
    user, // null when unauthenticated
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// ---------------------------------------------------------------------------
// tRPC instance
// ---------------------------------------------------------------------------
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;

/** Open to everyone — no auth required */
export const publicProcedure = t.procedure;

/** Requires a valid Supabase session; throws UNAUTHORIZED otherwise */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to perform this action.",
    });
  }
  return next({
    ctx: {
      ...ctx,
      // Narrow the type: user is guaranteed non-null here
      user: ctx.user,
    },
  });
});
