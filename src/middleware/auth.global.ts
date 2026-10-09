import { checkAuthNavigation } from "~/routes";

export default defineNuxtRouteMiddleware((to) => {
  const redirectTarget = checkAuthNavigation(to.path);
  if (redirectTarget && redirectTarget !== to.path) {
    return navigateTo(redirectTarget, { replace: true });
  }
});