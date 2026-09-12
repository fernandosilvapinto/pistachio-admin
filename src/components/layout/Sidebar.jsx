import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// `permission` é o que a API exige para a página servir de alguma coisa. Uma
// entrada sem permissão é escondida — não porque isso proteja o que quer que
// seja, mas porque mostrar um menu que devolve 403 é uma promessa falsa.
const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊', permission: null },
  { to: '/users', label: 'Utilizadores', icon: '👥', permission: 'users:read' },
  { to: '/services', label: 'Serviços', icon: '🔧', permission: 'services:read' },
  { to: '/schedulings', label: 'Agendamentos', icon: '📅', permission: 'scheduling:read' },
  { to: '/payments', label: 'Pagamentos', icon: '💶', permission: 'payments:read' },
];

const Sidebar = () => {
  const { profile, user, can, signOut } = useAuth();

  const name = user?.name ?? profile?.name ?? profile?.preferred_username ?? 'Sessão';
  const email = user?.email ?? profile?.email ?? '';

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm">
            🌱
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Pistachio</p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.filter(({ permission }) => !permission || can(permission)).map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150
              ${isActive
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Utilizador */}
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-700 truncate">{name}</p>
        {email && <p className="text-xs text-gray-400 truncate">{email}</p>}
        <button
          onClick={signOut}
          className="text-xs text-gray-400 hover:text-gray-600 mt-1 cursor-pointer"
        >
          Sair →
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
