import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LandingPage from "./pages/LandingPage";

const ItemsPage = lazy(() => import("./pages/ItemsPage"));
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
  { path: "/items", element: withSuspense(<ItemsPage />) },
  { path: "*", element: withSuspense(<NotFoundPage />) },
]);

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
