import { userManager } from '../auth/userManager';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const request = async (path, options = {}) => {
  // Pedido a pedido, e não uma cópia guardada: o token é renovado em segundo
  // plano e o que estava em memória há dois minutos pode já não servir.
  const user = await userManager.getUser();
  const token = user && !user.expired ? user.access_token : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // 401 e 403 dizem coisas diferentes e merecem respostas diferentes.
  // 401: a API não reconhece o token — expirou, ou não existe. Vale a pena
  // voltar ao Keeper.
  if (response.status === 401) {
    await userManager.signinRedirect({
      state: { returnTo: window.location.pathname + window.location.search },
    });
    throw new ApiError(401, 'Sessão expirada.');
  }

  // 403: o token é válido e a pessoa é quem diz ser — apenas não tem a
  // permissão. Mandá-la autenticar-se outra vez não muda nada e só a confunde.
  if (response.status === 403) {
    throw new ApiError(403, 'Não tens permissão para esta operação.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.message ?? `Erro ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
