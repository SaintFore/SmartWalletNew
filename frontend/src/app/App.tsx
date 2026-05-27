import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
const LandingPage = lazy(() => import("@/pages/landing"));
const CategoriesPage = lazy(() => import("@/pages/categories"));
const AccountsPage = lazy(() => import("@/pages/accounts"));
const TransactionsPage = lazy(() => import("@/pages/transactions"));
const AnalyticsPage = lazy(() => import("@/pages/analytics"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));

function PageFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function withSuspense(children: React.ReactNode) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  { path: "/", element: withSuspense(<LandingPage />) },
  { path: "/categories", element: withSuspense(<CategoriesPage />) },
  { path: "/accounts", element: withSuspense(<AccountsPage />) },
  { path: "/transactions", element: withSuspense(<TransactionsPage />) },
  { path: "/analytics", element: withSuspense(<AnalyticsPage />) },
  { path: "*", element: withSuspense(<NotFoundPage />) },
]);

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
