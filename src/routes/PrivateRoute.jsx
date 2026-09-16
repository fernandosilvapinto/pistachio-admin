import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSigningOut } from '../auth/userManager';

/**
 * Já não decide entre "mostrar" e "mandar para o /login": não há /login. Decide
 * entre mostrar e delegar no Anvil.
 *
 * Isto é apenas conveniência para o utilizador. Nada aqui protege dados — a
 * proteção está na API, que exige um token válido e a permissão certa em cada
 * endpoint. Um browser com o devtools aberto contorna esta verificação em
 * segundos e não ganha nada com isso.
 */
const PrivateRoute = ({ children }) => {
  const { status, signIn } = useAuth();
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Uma saída em curso também passa por `anonymous`. Reagir a isso seria
    // mandar a pessoa entrar outra vez enquanto ela sai.
    if (status !== 'anonymous' || isSigningOut()) return;

    // Um redirecionamento que falha deixa a página parada numa mensagem de
    // espera que nunca acaba. Uma promessa rejeitada e não apanhada é a forma
    // mais eficaz de esconder um erro — por isso apanha-se.
    signIn(location.pathname + location.search).catch((err) => {
      setError(err?.message ?? String(err));
    });
  }, [status, signIn, location]);

  if (status === 'authenticated') {
    return children;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md text-center flex flex-col gap-2 px-6">
          <p className="text-sm text-gray-900">Não foi possível iniciar a autenticação.</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-sm text-gray-400">
        {status === 'loading' ? 'A verificar a sessão…' : 'A redirecionar para o Anvil…'}
      </p>
    </div>
  );
};

export default PrivateRoute;
