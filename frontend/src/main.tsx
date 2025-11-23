import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeModeProvider } from "./ThemeModeProvider";
import "./index.css"; // istersen boş bırak
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <App />
      </ThemeModeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
