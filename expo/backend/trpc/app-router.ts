import { createTRPCRouter } from "./create-context";
import { exampleRouter } from "./routes/example";
import { profileRouter } from "./routes/profile";
import { aiRouter } from "./routes/ai";
import { subscriptionRouter } from "./routes/subscription";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  profile: profileRouter,
  ai: aiRouter,
  subscription: subscriptionRouter,
});

export type AppRouter = typeof appRouter;
