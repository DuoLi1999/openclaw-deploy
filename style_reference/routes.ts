import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { HomePage } from "./pages/HomePage";
import { GeneratePage } from "./pages/GeneratePage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { ContentManagementPage } from "./pages/ContentManagementPage";
import { SystemManagementPage } from "./pages/SystemManagementPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "generate", Component: GeneratePage },
      { path: "materials", Component: MaterialsPage },
      { path: "content", Component: ContentManagementPage },
      { path: "system", Component: SystemManagementPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
