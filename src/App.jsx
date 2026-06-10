import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppRouter from './routes/AppRouter';

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;