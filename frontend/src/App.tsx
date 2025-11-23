import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import Layout from "./components/Layout";
import InstitutionsPage from "./pages/InstitutionsPage";
import SchoolsPage from "./pages/SchoolsPage";
import ClassesPage from "./pages/ClassesPage";
import LicensesPage from "./pages/LicensesPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/institutions" element={<InstitutionsPage />} />
          <Route path="/institutions/:id/schools" element={<SchoolsPage />} />
          <Route path="/schools/:id/classes" element={<ClassesPage />} />
          <Route path="/licenses" element={<LicensesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
