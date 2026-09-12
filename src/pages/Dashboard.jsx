import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
    <p className="text-3xl font-semibold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const Dashboard = () => {
  // Um cartão com um traço é uma pergunta sem resposta: não se sabe se não há
  // dados ou se não há permissão. Só se pede o que o token permite, e só se
  // mostra o que se pediu.
  const { can } = useAuth();
  const [stats, setStats] = useState({
    users: null,
    schedulings: null,
    services: null,
    payments: null,
  });
  const [recentSchedulings, setRecentSchedulings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const ask = (permission, path) =>
          can(permission) ? api.get(path).catch(() => null) : Promise.resolve(null);

        const [users, schedulings, services, payments] = await Promise.all([
          ask('users:read', '/users'),
          ask('scheduling:read', '/schedulings'),
          ask('services:read', '/services'),
          ask('payments:read', '/payments'),
        ]);
        setStats({
          users:       Array.isArray(users)       ? users.length       : null,
          schedulings: Array.isArray(schedulings) ? schedulings.length : null,
          services:    Array.isArray(services)    ? services.length    : null,
          payments:    Array.isArray(payments)    ? payments.length    : null,
        });
        if (Array.isArray(schedulings)) {
          setRecentSchedulings(schedulings.slice(0, 5));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [can]);

  return (
    <div className="p-8 max-w-5xl flex flex-col gap-8">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Visão geral do sistema</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.users !== null && (
          <StatCard label="Utilizadores"  value={stats.users}       sub="registados"   />
        )}
        {stats.schedulings !== null && (
          <StatCard label="Agendamentos"  value={stats.schedulings} sub="total"        />
        )}
        {stats.services !== null && (
          <StatCard label="Serviços"      value={stats.services}    sub="disponíveis"  />
        )}
        {stats.payments !== null && (
          <StatCard label="Pagamentos"    value={stats.payments}    sub="registados"   />
        )}
      </div>

      {/* Agendamentos recentes */}
      {!loading && recentSchedulings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-700">Agendamentos recentes</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentSchedulings.map((s, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between text-sm">
                <span className="text-gray-500 font-mono text-xs">
                  #{String(s.id).slice(0, 8)}
                </span>
                <span className="text-gray-700">
                  {s.scheduledAt
                    ? new Date(s.scheduledAt).toLocaleDateString('pt-PT')
                    : '—'}
                </span>
                <span className="text-gray-400">{s.notes ?? '—'}</span>
                <span className={`
                  text-xs px-2 py-0.5 rounded-full border font-medium
                  ${s.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                  ${s.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200'   : ''}
                  ${s.status === 'Pending'   ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                  ${s.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200'      : ''}
                `}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <p className="text-sm text-gray-400">A carregar dados…</p>
      )}

    </div>
  );
};

export default Dashboard;