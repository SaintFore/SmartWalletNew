import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LandingPage from "./pages/LandingPage";

const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

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
  { path: "/", element: <LandingPage /> },
  { path: "/categories", element: withSuspense(<CategoriesPage />) },
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
