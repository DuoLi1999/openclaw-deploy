import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LoginPage } from "@/pages/LoginPage";
import { HomePage } from "@/pages/HomePage";
import { GeneratePage } from "@/pages/GeneratePage";
import { MaterialsPage } from "@/pages/MaterialsPage";
import { ContentManagementPage } from "@/pages/ContentManagementPage";
import { PlanPage } from "@/pages/PlanPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { PrecisionPage } from "@/pages/PrecisionPage";
import { EmergencyPage } from "@/pages/EmergencyPage";
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
        path: "plan",
        element: <PlanPage />,
      },
      {
        path: "analytics",
        element: <AnalyticsPage />,
      },
      {
        path: "precision",
        element: <PrecisionPage />,
      },
      {
        path: "emergency",
        element: <EmergencyPage />,
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
