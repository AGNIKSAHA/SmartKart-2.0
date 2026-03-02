import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "../store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Never retry on 401 Unauthorized — user is not authenticated
        if (error?.response?.status === 401) return false;
        return failureCount < 1;
      },
    },
  },
});

import { GoogleMapsProvider } from "../../providers/GoogleMapsProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "../../utils/env";

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <GoogleMapsProvider>
            {children}
            <Toaster position="top-right" />
          </GoogleMapsProvider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </Provider>
  );
};
