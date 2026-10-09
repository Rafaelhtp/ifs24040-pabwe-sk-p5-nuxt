import type { RouteRecordRaw } from "vue-router";
import { getAccessToken } from "~/helpers/apiHelper";

// Lazy-load: tiap layout/halaman menjadi chunk sendiri agar bundle awal kecil
const AuthLayout = () => import("./features/auth/layouts/AuthLayout.vue");
const LoginPage = () => import("./features/auth/pages/LoginPage.vue");
const RegisterPage = () => import("./features/auth/pages/RegisterPage.vue");
const CashFlowLayout = () => import("./features/cashflows/layouts/CashFlowLayout.vue");
const HomePage = () => import("./features/cashflows/pages/HomePage.vue");
const DetailPage = () => import("./features/cashflows/pages/DetailPage.vue");
const UsersPage = () => import("./features/users/pages/UsersPage.vue");
const ProfilePage = () => import("./features/users/pages/ProfilePage.vue");
const NotFoundPage = () => import("./features/common/pages/NotFoundPage.vue");

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
