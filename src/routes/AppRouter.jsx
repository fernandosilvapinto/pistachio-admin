import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from './PrivateRoute';
import AdminLayout from '../components/layout/AdminLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import UserList from '../pages/users/UserList';
import RoleList from '../pages/roles/RoleList';
import ServiceList from '../pages/services/ServiceList';
import SchedulingList from '../pages/schedulings/SchedulingList';
import PaymentList from '../pages/payments/PaymentList';
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
          <Route path="roles" element={<RoleList />} />
          <Route path="services" element={<ServiceList />} />
          <Route path="schedulings" element={<SchedulingList />} />
          <Route path="payments" element={<PaymentList />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;