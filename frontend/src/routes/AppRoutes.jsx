import { Routes, Route } from "react-router-dom";
import AdminSignIn from "../pages/auth/AdminSignIn";
import AdminRegister from "../pages/auth/AdminRegister";
import UserSignIn from "../pages/auth/UserSignIn";
import UserRegister from "../pages/auth/UserRegister";
import Dashboard from "../pages/Dashboard";
import CreateTask from "../pages/tasks/CreateTask";
import EditTask from "../pages/tasks/EditTask";
import CreateOrganisation from "../pages/organisation/CreateOrganisation";

export default function AppRoutes() { 
  return (
    <Routes>
      <Route path="/auth/admin/signin" element={<AdminSignIn />} />
      <Route path="/auth/admin/register" element={<AdminRegister />} />
      <Route path="/auth/user/signin" element={<UserSignIn />} />
      <Route path="/auth/user/register" element={<UserRegister />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/tasks/create" element={<CreateTask />} />
      <Route path="/tasks/edit/:taskId" element={<EditTask />} />
      <Route path="/organisation/create" element={<CreateOrganisation />} />
    </Routes>
  );
}