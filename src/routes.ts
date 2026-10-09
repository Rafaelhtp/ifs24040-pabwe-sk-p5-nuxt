import type { RouteRecordRaw } from "vue-router";

// Setiap halaman/layout di-lazy-load supaya ukuran bundle awal tetap kecil
const AuthLayout = () => import("./features/auth/layouts/AuthLayout.vue");
const LoginPage = () => import("./features/auth/pages/LoginPage.vue");
const RegisterPage = () => import("./features/auth/pages/RegisterPage.vue");
const CashFlowLayout = () => import("./features/cashflows/layouts/CashFlowLayout.vue");
const HomePage = () => import("./features/cashflows/pages/HomePage.vue");
const DetailPage = () => import("./features/cashflows/pages/DetailPage.vue");
const NotFoundPage = () => import("./features/common/pages/NotFoundPage.vue");
const ProfilePage = () => import("./features/users/pages/ProfilePage.vue");
const UsersPage = () => import("./features/users/pages/UsersPage.vue");

const routes: RouteRecordRaw[] = [
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      { path: "", redirect: "/auth/login" },
      { path: "login", component: LoginPage },
      { path: "register", component: RegisterPage },
    ],
  },
  {
    path: "/",
    component: CashFlowLayout,
    children: [
      { path: "", redirect: "/home" },
      { path: "home", component: HomePage },
      { path: "cash-flows/:cashFlowId", component: DetailPage },
      { path: "users", component: UsersPage },
      { path: "profile", component: ProfilePage },
    ],
  },
  { path: "/:pathMatch(.*)*", component: NotFoundPage },
];

export default routes;
