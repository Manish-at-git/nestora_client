import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { publicRoutes, protectedAppRoutes, ProtectedRoute } from "@/routes";
import RoleLayout from "@/layouts/RoleLayout";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-lg mx-auto mt-12 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900">
          <h2 className="font-bold text-lg mb-2">Something went wrong.</h2>
          <pre className="text-xs overflow-auto bg-white p-3 rounded border border-rose-100">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors closeButton />
          <Routes>
            {/* Public and Auth Routes */}
            {publicRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}

            {/* Protected App Routes inside persistent RoleLayout shell */}
            <Route
              element={
                <ProtectedRoute>
                  <RoleLayout />
                </ProtectedRoute>
              }
            >
              {protectedAppRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    route.allowedRoles ? (
                      <ProtectedRoute allowedRoles={route.allowedRoles}>
                        {route.element}
                      </ProtectedRoute>
                    ) : (
                      route.element
                    )
                  }
                />
              ))}
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
