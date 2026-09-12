import { UserManager, WebStorageStateStore, InMemoryWebStorage } from 'oidc-client-ts';

const authority = import.meta.env.VITE_KEEPER_AUTHORITY;
const clientId = import.meta.env.VITE_KEEPER_CLIENT_ID;

if (!authority || !clientId) {
  throw new Error(
    'VITE_KEEPER_AUTHORITY e VITE_KEEPER_CLIENT_ID têm de estar definidos. Copia .env.example para .env.',
  );
}

// O PKCE calcula o code_challenge com SHA-256, e o SHA-256 do browser vive em
// `crypto.subtle`, que só existe em contextos seguros: HTTPS, `localhost` ou
// `127.0.0.1`. Qualquer outro nome sobre HTTP simples — mesmo que resolva para
// 127.0.0.1 — fica sem WebCrypto e o fluxo falha em silêncio. Mais vale falhar
// aqui, a dizer porquê.
if (!window.crypto?.subtle) {
  throw new Error(
    `Esta página está em ${window.location.origin}, que o browser não considera um contexto seguro, ` +
      'por isso crypto.subtle não existe e o PKCE não pode ser calculado. ' +
      'Serve a aplicação em http://localhost, em http://127.0.0.1, ou sobre HTTPS.',
  );
}

/**
 * O único ponto da aplicação que sabe falar OpenID Connect.
 *
 * Nada aqui é específico do Keycloak: a biblioteca lê o documento de discovery
 * publicado em `<authority>/.well-known/openid-configuration` e descobre
 * sozinha os endpoints, os algoritmos e as chaves. Trocar o Keeper por outro
 * provider conforme é mudar uma variável de ambiente.
 */
export const userManager = new UserManager({
  authority,
  client_id: clientId,

  // Authorization Code com PKCE. Não há client secret: uma aplicação que corre
  // dentro do browser não consegue guardar um segredo — qualquer pessoa abre o
  // devtools e lê-o. O PKCE substitui o segredo por uma prova gerada em cada
  // pedido, que só quem o iniciou consegue apresentar.
  response_type: 'code',
  scope: 'openid profile email',

  redirect_uri: `${window.location.origin}/callback`,
  post_logout_redirect_uri: `${window.location.origin}/`,

  // Os tokens vivem em memória JavaScript e mais lado nenhum. Recarregar a
  // página perde-os de propósito: a sessão não é desta aplicação, é do Keeper,
  // e é lá que ela deve ser reconstruída. Guardá-los em localStorage tornaria
  // qualquer XSS — ou qualquer dependência npm comprometida — suficiente para
  // os exfiltrar.
  userStore: new WebStorageStateStore({ store: new InMemoryWebStorage() }),

  // O state e o code_verifier de um redirecionamento têm de sobreviver ao
  // próprio redirecionamento — e só a esse. Ficam um instante em sessionStorage
  // e são apagados assim que o código é trocado por tokens.
  stateStore: new WebStorageStateStore({ store: window.sessionStorage }),

  // Renova o access token pelo refresh token pouco antes de expirar, sem
  // iframes e sem sair da página.
  automaticSilentRenew: true,
  accessTokenExpiringNotificationTimeInSeconds: 60,

  // O iframe de session management do OIDC está depreciado e depende de
  // cookies de terceiros, que os browsers estão a bloquear.
  monitorSession: false,
});
