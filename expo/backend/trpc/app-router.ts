import { createTRPCRouter } from "./create-context";
import { exampleRouter } from "./routes/example";
import { profileRouter } from "./routes/profile";
import { aiRouter } from "./routes/ai";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  profile: profileRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
