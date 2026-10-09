import type { RouteRecordRaw } from "vue-router";
import AuthLayout from "~/features/auth/layouts/AuthLayout.vue";
import LoginPage from "~/features/auth/pages/LoginPage.vue";
import RegisterPage from "~/features/auth/pages/RegisterPage.vue";
import CashFlowLayout from "~/features/cashflows/layouts/CashFlowLayout.vue";
import HomePage from "~/features/cashflows/pages/HomePage.vue";
import DetailPage from "~/features/cashflows/pages/DetailPage.vue";
import UsersPage from "~/features/users/pages/UsersPage.vue";
import ProfilePage from "~/features/users/pages/ProfilePage.vue";
import NotFoundPage from "~/features/common/pages/NotFoundPage.vue";
import { getAccessToken } from "~/helpers/apiHelper";

export const routes: RouteRecordRaw[] = [
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      {
        path: "login",
        name: "login",
        component: LoginPage,
      },
      {
        path: "register",
        name: "register",
        component: RegisterPage,
      },
      {
        path: "",
        redirect: "/auth/login",
      },
    ],
  },
  {
    path: "/",
    component: CashFlowLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "home",
        component: HomePage,
      },
      {
        path: "cash-flows/:cashFlowId",
        name: "cash-flow-detail",
        component: DetailPage,
      },
      {
        path: "users",
        name: "users",
        component: UsersPage,
      },
      {
        path: "profile",
        name: "profile",
        component: ProfilePage,
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFoundPage,
  },
];

export function checkAuthNavigation(toPath: string, token: string | null = getAccessToken()): string | null {
  const isAuthRoute = toPath.startsWith("/auth");
  const isPublicRoute = isAuthRoute;

  if (!isPublicRoute && !token) {
    return "/auth/login";
  }

  if (isAuthRoute && token) {
    return "/";
  }

  return null;
}
