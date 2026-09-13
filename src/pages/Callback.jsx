import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userManager } from '../auth/userManager';

/**
 * A troca só pode acontecer uma vez, e por isso a promessa vive fora do
 * componente.
 *
 * Em desenvolvimento o React StrictMode monta, desmonta e volta a montar cada
 * componente de propósito, para expor efeitos que não são seguros a repetir.
 * Este é exatamente um desses: o código de autorização é de utilização única,
 * a primeira troca gasta-o e a segunda recebe "Code not valid" do provider —
 * que está certíssimo em recusar. Guardar a promessa faz com que a segunda
 * montagem aguarde o resultado da primeira em vez de queimar o código.
 */
let exchange = null;

const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    if (!exchange) {
      exchange = userManager.signinRedirectCallback();
    }

    exchange
      .then((user) => {
        if (!active) return;
        const returnTo = user.state?.returnTo ?? '/';
        // replace: o URL com o código não deve ficar no histórico.
        navigate(returnTo, { replace: true });
      })
      .catch((err) => {
        if (!active) return;
        // Falhou de vez: deixar a promessa presa impediria uma nova tentativa.
        exchange = null;
        setError(err?.message ?? 'Não foi possível concluir a autenticação.');
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
