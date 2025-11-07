import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./lib/auth";
import LoginPage from "./components/LoginPage";
import CustomersList from "./components/CustomersList";
import CustomerDetail from "./components/CustomerDetail";
import AuthGate from "./components/AuthGate";
import { Toaster } from "./components/ui/sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { token } = useAuth();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );

  if (!token) {
    return <LoginPage />;
  }

  return (
    <AuthGate>
      {selectedCustomerId ? (
        <CustomerDetail
          customerId={selectedCustomerId}
          onBack={() => setSelectedCustomerId(null)}
        />
      ) : (
        <CustomersList onSelectCustomer={setSelectedCustomerId} />
      )}
    </AuthGate>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
