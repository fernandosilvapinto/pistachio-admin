import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@pistachio.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Preenche todos os campos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/auth/login', { email, password });
      login(data.token, data.user ?? { email });
    } catch {
      setError('Credenciais inválidas. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white text-xl mb-4">
            🌱
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Pistachio Admin</h1>
          <p className="text-sm text-gray-400 mt-1">Área administrativa</p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@pistachio.local"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="••••••••"
          />
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full justify-center mt-1"
          >
            {loading ? 'A entrar…' : 'Entrar'}
          </Button>
        </div>

        {/* Rodapé */}
        <p className="text-center text-xs text-gray-400">
          Usa as credenciais do SeedData para testar.
        </p>

      </div>
    </div>
  );
};

export default Login;