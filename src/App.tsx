
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import BiographyQuestionnaire from "./pages/BiographyQuestionnaire";
import BiographyTOC from "./pages/BiographyTOC";
import BiographyEditor from "./pages/BiographyEditor";
import BiographyDraft from "./pages/BiographyDraft";
import ViewBiography from "./pages/ViewBiography"; // Import ViewBiography
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Create a query client instance with better error and retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Main App component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <Sonner />
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/biography/:biographyId/questionnaire" element={
                <ProtectedRoute>
                  <BiographyQuestionnaire />
                </ProtectedRoute>
              } />
              <Route path="/biography/:biographyId/toc" element={
                <ProtectedRoute>
                  <BiographyTOC />
                </ProtectedRoute>
              } />
              <Route path="/biography/:biographyId/draft" element={
                <ProtectedRoute>
                  <BiographyDraft />
                </ProtectedRoute>
              } />
              <Route path="/biography/:biographyId/editor" element={
                <ProtectedRoute>
                  <BiographyEditor />
                </ProtectedRoute>
              } />
              {/* Public View Route */}
              <Route path="/view-biography/:biographyId" element={<ViewBiography />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
