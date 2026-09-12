import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userManager } from '../auth/userManager';

/**
 * O ponto de regresso do Keeper. O browser chega aqui com um código de
 * autorização no URL; esta página troca-o por tokens e sai.
 *
 * A troca acontece contra o token endpoint, servidor a servidor do ponto de
 * vista do protocolo, e prova a posse do code_verifier gerado no início. O
 * código é de utilização única e vive segundos — uma tentativa falhada também
 * o queima.
 */
const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    userManager
      .signinRedirectCallback()
      .then((user) => {
        if (!active) return;
        const returnTo = user.state?.returnTo ?? '/';
        // replace: o URL com o código não deve ficar no histórico.
        navigate(returnTo, { replace: true });
      })
      .catch((err) => {
        if (active) setError(err.message ?? 'Não foi possível concluir a autenticação.');
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      {error ? (
        <div className="w-full max-w-sm text-center flex flex-col gap-3">
          <p className="text-sm text-gray-900">Não foi possível concluir a autenticação.</p>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={() => userManager.signinRedirect()}
            className="text-xs text-blue-600 hover:underline cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400">A concluir a autenticação…</p>
      )}
    </div>
  );
};

export default Callback;
