import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/client';
import DetailView from '../../components/ui/DetailView';
import Badge from '../../components/ui/Badge';

const fmtEur = (n) => `€${Number(n ?? 0).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-PT') : '—';

const PaymentDetail = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/payments/${id}`)
      .then(setPayment)
      .catch(() => setError('Não foi possível carregar o pagamento.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-8 text-sm text-gray-400">A carregar…</p>;
  if (error || !payment) return <p className="p-8 text-sm text-red-500">{error || 'Pagamento não encontrado.'}</p>;

  return (
    <DetailView
      title={`Pagamento #${payment.id}`}
      subtitle={fmtEur(payment.amount)}
      backTo="/payments"
      fields={[
        { label: 'Valor', value: payment.amount, render: fmtEur },
        { label: 'Estado', value: payment.status, render: v => v ? <Badge label={v} /> : '—' },
        { label: 'Data', value: payment.paymentDate, render: fmtDate },
        { label: 'Utilizador', value: payment.user?.name || `#${payment.userId}` },
        { label: 'Serviço', value: payment.service?.name || `#${payment.serviceId}` },
        { label: 'Agendamento', value: payment.schedulingId ? `#${payment.schedulingId}` : '—' },
      ]}
    />
  );
};

export default PaymentDetail;
