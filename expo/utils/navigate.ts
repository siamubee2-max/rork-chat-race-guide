/**
 * navigate.ts
 *
 * Typed navigation helpers for Expo Router.
 *
 * Expo Router's typed routes (`typedRoutes: true`) requires every `router.push`
 * argument to be a statically known `Href`. When building paths dynamically
 * (e.g. `/(tabs)/community/profile/${userId}`) TypeScript cannot infer the
 * literal type, so a single `as any` cast is required.
 *
 * By centralising that cast here every call-site can import `navigate` /
 * `navigateWithParams` and remain free of `as any`.
 */

import { router } from "expo-router";

/**
 * Navigate to a route string.
 *
 * @example
 *   navigate("/(tabs)/subscription");
 *   navigate(`/(tabs)/community/profile/${userId}`);
 */
export const navigate = (route: string): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router.push(route as any);
};

/**
 * Navigate to a route with typed params object.
 *
 * @example
 *   navigateWithParams("/cats/weight-form", { catId: cat.id });
 */
export const navigateWithParams = (
  pathname: string,
  params: Record<string, string | number | undefined>
): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router.push({ pathname, params } as any);
};

/**
 * Replace the current route (no back navigation).
 *
 * @example
 *   navigateReplace("/");
 */
export const navigateReplace = (route: string): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router.replace(route as any);
};
