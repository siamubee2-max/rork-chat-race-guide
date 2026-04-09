import { createTRPCRouter } from "./create-context";
import { exampleRouter } from "./routes/example";
import { profileRouter } from "./routes/profile";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
