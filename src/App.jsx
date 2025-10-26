import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import TemplateList from "./pages/TemplateList";
import CreateTemplate from "./pages/CreateTemplate";
import FormList from "./pages/FormList";
import FormDetail from "./pages/FormDetail";
import HomePage from "./pages/HomePage";
import TableView from "./pages/TableView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export default function Main() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route index element={<HomePage />} />
            <Route path="template-list" element={<TemplateList />} />
            <Route path="create-template/:id" element={<CreateTemplate />} />
            <Route path="form-list" element={<FormList />} />
            <Route path="form-detail/:id" element={<FormDetail />} />
            <Route path="table-view" element={<TableView />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ margin: "8px" }}
          toastOptions={{
            success: {
              duration: 3000,
            },
            error: {
              duration: 5000,
            },
            style: {
              fontSize: "16px",
              maxWidth: "500px",
              padding: "16px 24px",
              backgroundColor: "var(--color-grey-0)",
              color: "var(--color-grey-700)",
            },
          }}
        />
      </QueryClientProvider>
    </>
  );
}
