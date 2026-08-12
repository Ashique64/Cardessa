"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useAlertStore } from "@/store/alertStore";
import CustomAlert from "@/components/CustomAlert";

function AuthInitializer({ children }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  React.useEffect(() => {
    initializeAuth();
    if (typeof window !== "undefined") {
      window.alert = (msg) => {
        useAlertStore.getState().showAlert(msg);
      };
    }
  }, [initializeAuth]);
  return children;
}

export default function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false, // avoid refetch during edit layout focus
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>{children}</AuthInitializer>
      <CustomAlert />
    </QueryClientProvider>
  );
}
