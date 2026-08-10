import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/client';
import DetailView from '../../components/ui/DetailView';
import Badge from '../../components/ui/Badge';

const fmtDateTime = (d) => d ? new Date(d).toLocaleString('pt-PT') : '—';

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${id}`)
      .then(setUser)
      .catch(() => setError('Não foi possível carregar o utilizador.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="p-8 text-sm text-gray-400">A carregar…</p>;
  }

  if (error || !user) {
    return <p className="p-8 text-sm text-red-500">{error || 'Utilizador não encontrado.'}</p>;
  }

  return (
    <DetailView
      title={user.name || user.email}
      subtitle={`Utilizador #${user.id}`}
      backTo="/users"
      fields={[
        { label: 'Nome', value: user.name },
        { label: 'Email', value: user.email },
        { label: 'Perfil', value: user.role, render: v => <Badge label={v} /> },
        { label: 'Criado em', value: user.createdAt, render: fmtDateTime },
      ]}
    />
  );
};

export default UserDetail;
