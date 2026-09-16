import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('pt-PT') : '—');

/**
 * Listagem apenas de leitura.
 *
 * Criar, renomear, desativar ou repor a password de uma pessoa são operações de
 * identidade e acontecem no Anvil, que é a fonte de verdade. O que esta tabela
 * mostra são as linhas locais que o domínio precisa para ter chaves
 * estrangeiras — um agendamento tem de apontar para alguém. Duplicar aqui a
 * gestão de pessoas era exatamente o que esta migração veio acabar.
 */
const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/users')
      .then((u) => setUsers(Array.isArray(u) ? u : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const signedIn = users.filter((u) => u.hasSignedIn).length;

  const cols = [
    { key: 'name', label: 'Nome', render: (r) => r.name ?? '—' },
    { key: 'email', label: 'Email' },
    {
      key: 'hasSignedIn',
      label: 'Conta',
      render: (r) => <Badge label={r.hasSignedIn ? 'Ativa' : 'Por reclamar'} />,
    },
    { key: 'lastSeenAt', label: 'Último acesso', render: (r) => fmtDateTime(r.lastSeenAt) },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <Button size="sm" onClick={() => navigate(`/users/${r.id}`)}>Ver</Button>
      ),
    },
  ];

  return (
    <div className="p-8 max-w-5xl flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Utilizadores</h1>
        <p className="text-sm text-gray-400 mt-1">
          {users.length} registos · {signedIn} com conta ativa
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <p className="p-8 text-sm text-gray-400 text-center">A carregar…</p>
        ) : (
          <Table cols={cols} rows={users} empty="Nenhum utilizador encontrado." />
        )}
      </div>

      <p className="text-xs text-gray-400">
        As contas são geridas no Anvil. &ldquo;Por reclamar&rdquo; é uma linha criada pelo
        domínio para alguém que ainda não se autenticou nenhuma vez — fica ligada
        à conta no primeiro início de sessão com o mesmo email verificado.
      </p>

    </div>
  );
};

export default UserList;
