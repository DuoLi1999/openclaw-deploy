import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LoginPage } from "@/pages/LoginPage";
import { HomePage } from "@/pages/HomePage";
import { GeneratePage } from "@/pages/GeneratePage";
import { MaterialsPage } from "@/pages/MaterialsPage";
import { ContentManagementPage } from "@/pages/ContentManagementPage";
import { SystemManagementPage } from "@/pages/SystemManagementPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "generate",
        element: <GeneratePage />,
      },
      {
        path: "materials",
        element: <MaterialsPage />,
      },
      {
        path: "content",
        element: <ContentManagementPage />,
      },
      {
        path: "system",
        element: <SystemManagementPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
