import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "../store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

import { GoogleMapsProvider } from "../../providers/GoogleMapsProvider";

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GoogleMapsProvider>
          {children}
          <Toaster position="top-right" />
        </GoogleMapsProvider>
      </QueryClientProvider>
    </Provider>
  );
};
