import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userManager, signOutRedirect } from '../auth/userManager';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  // loading  — ainda não sabemos se há sessão
  // authenticated — há um token válido em memória
  // anonymous — não há, é preciso ir ao Keeper
  const [status, setStatus] = useState('loading');
  const [profile, setProfile] = useState(null);
  const [me, setMe] = useState(null);

  const forget = useCallback(() => {
    setProfile(null);
    setMe(null);
    setStatus('anonymous');
  }, []);

  const adopt = useCallback(async (user) => {
    if (!user || user.expired) {
      forget();
      return;
    }

    // `profile` são os claims do ID token: quem a pessoa é.
    setProfile(user.profile);

    // O que a pessoa pode fazer não se lê aqui. As permissões estão no access
    // token, que é dirigido à API e não a nós — o browser não é autoridade
    // sobre autorização. Perguntamos à API o que aquele token lhe permite, e
    // usamos a resposta apenas para decidir o que mostrar. Quem impõe é ela.
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${user.access_token}` },
      });
      setMe(response.ok ? await response.json() : null);
    } catch {
      setMe(null);
    }

    setStatus('authenticated');
  }, [forget]);

  useEffect(() => {
    let active = true;

    userManager.getUser().then((user) => {
      if (active) adopt(user);
    });

    const onLoaded = (user) => adopt(user);

    userManager.events.addUserLoaded(onLoaded);
    userManager.events.addUserUnloaded(forget);
    userManager.events.addAccessTokenExpired(forget);
    userManager.events.addSilentRenewError(forget);

    return () => {
      active = false;
      userManager.events.removeUserLoaded(onLoaded);
      userManager.events.removeUserUnloaded(forget);
      userManager.events.removeAccessTokenExpired(forget);
      userManager.events.removeSilentRenewError(forget);
    };
  }, [adopt, forget]);

  // Sair daqui leva ao Keeper e volta. Se já houver sessão no Keeper, a volta é
  // imediata e sem formulário — é isso o single sign-on visto de dentro.
  const signIn = useCallback(
    (returnTo) =>
      userManager.signinRedirect({
        state: { returnTo: returnTo ?? window.location.pathname + window.location.search },
      }),
    [],
  );

  // Termina a sessão no Keeper, não só aqui. Limpar o estado local deixaria a
  // sessão do provider viva e o próximo login voltaria a entrar em silêncio.
  const signOut = useCallback(() => signOutRedirect(), []);

  const can = useCallback(
    (permission) => me?.permissions?.includes(permission) ?? false,
    [me],
  );

  return (
    <AuthContext.Provider
      value={{
        status,
        isAuthenticated: status === 'authenticated',
        profile,
        user: me?.user ?? null,
        permissions: me?.permissions ?? [],
        can,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
