import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/client';
import DetailView from '../../components/ui/DetailView';

const RoleDetail = () => {
  const { id } = useParams();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/roles/${id}`)
      .then(setRole)
      .catch(() => setError('Não foi possível carregar o perfil.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-8 text-sm text-gray-400">A carregar…</p>;
  if (error || !role) return <p className="p-8 text-sm text-red-500">{error || 'Perfil não encontrado.'}</p>;

  return (
    <DetailView
      title={role.name}
      subtitle={`Perfil #${role.id}`}
      backTo="/roles"
      fields={[
        { label: 'Nome', value: role.name },
      ]}
    />
  );
};

export default RoleDetail;
