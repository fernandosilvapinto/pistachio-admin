import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from './PrivateRoute';
import AdminLayout from '../components/layout/AdminLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import UserList from '../pages/users/UserList';
import UserDetail from '../pages/users/UserDetail';
import RoleList from '../pages/roles/RoleList';
import RoleDetail from '../pages/roles/RoleDetail';
import ServiceList from '../pages/services/ServiceList';
import ServiceDetail from '../pages/services/ServiceDetail';
import SchedulingList from '../pages/schedulings/SchedulingList';
import SchedulingDetail from '../pages/schedulings/SchedulingDetail';
import PaymentList from '../pages/payments/PaymentList';
import PaymentDetail from '../pages/payments/PaymentDetail';
import NotFound from '../pages/NotFound';

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="roles" element={<RoleList />} />
          <Route path="roles/:id" element={<RoleDetail />} />
          <Route path="services" element={<ServiceList />} />
          <Route path="services/:id" element={<ServiceDetail />} />
          <Route path="schedulings" element={<SchedulingList />} />
          <Route path="schedulings/:id" element={<SchedulingDetail />} />
          <Route path="payments" element={<PaymentList />} />
          <Route path="payments/:id" element={<PaymentDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;