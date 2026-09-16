import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AdminLayout from '../components/layout/AdminLayout';
import Callback from '../pages/Callback';
import Dashboard from '../pages/Dashboard';
import UserList from '../pages/users/UserList';
import UserDetail from '../pages/users/UserDetail';
import ServiceList from '../pages/services/ServiceList';
import ServiceDetail from '../pages/services/ServiceDetail';
import SchedulingList from '../pages/schedulings/SchedulingList';
import SchedulingDetail from '../pages/schedulings/SchedulingDetail';
import PaymentList from '../pages/payments/PaymentList';
import PaymentDetail from '../pages/payments/PaymentDetail';
import NotFound from '../pages/NotFound';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* O regresso do Anvil. É a única rota pública, e existe só para trocar
          o código de autorização por tokens. */}
      <Route path="/callback" element={<Callback />} />

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

export default AppRouter;
