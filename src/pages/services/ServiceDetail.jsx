import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/client';
import DetailView from '../../components/ui/DetailView';
import Badge from '../../components/ui/Badge';

const fmtEur = (n) => `€${Number(n ?? 0).toFixed(2)}`;

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/services/${id}`)
      .then(setService)
      .catch(() => setError('Não foi possível carregar o serviço.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-8 text-sm text-gray-400">A carregar…</p>;
  if (error || !service) return <p className="p-8 text-sm text-red-500">{error || 'Serviço não encontrado.'}</p>;

  return (
    <DetailView
      title={service.name}
      subtitle={`Serviço #${service.id}`}
      backTo="/services"
      fields={[
        { label: 'Nome', value: service.name },
        { label: 'Descrição', value: service.description },
        { label: 'Preço', value: service.price, render: fmtEur },
        { label: 'Estado', value: service.isActive ? 'Active' : 'Inactive', render: v => <Badge label={v} /> },
        { label: 'Destaque', value: service.isFeatured ? 'Sim' : 'Não' },
      ]}
    />
  );
};

export default ServiceDetail;
