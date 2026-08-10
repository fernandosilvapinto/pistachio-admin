import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/client';
import DetailView from '../../components/ui/DetailView';

const STATUS_STYLES = {
  Pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const fmtDateTime = (d) => d ? new Date(d).toLocaleString('pt-PT') : '—';

const SchedulingDetail = () => {
  const { id } = useParams();
  const [scheduling, setScheduling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/schedulings/${id}`)
      .then(setScheduling)
      .catch(() => setError('Não foi possível carregar o agendamento.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-8 text-sm text-gray-400">A carregar…</p>;
  if (error || !scheduling) return <p className="p-8 text-sm text-red-500">{error || 'Agendamento não encontrado.'}</p>;

  return (
    <DetailView
      title={`Agendamento #${scheduling.id}`}
      subtitle={scheduling.serviceName}
      backTo="/schedulings"
      fields={[
        { label: 'Data e hora', value: scheduling.scheduledDate, render: fmtDateTime },
        { label: 'Cliente', value: scheduling.userName || `#${scheduling.userId}` },
        { label: 'Serviço', value: scheduling.serviceDescription || scheduling.serviceName },
        {
          label: 'Estado', value: scheduling.status,
          render: v => (
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_STYLES[v] ?? ''}`}>
              {v}
            </span>
          ),
        },
        { label: 'Mecânico atribuído', value: scheduling.assignedMechanicName || 'Sem atribuição' },
      ]}
    />
  );
};

export default SchedulingDetail;
