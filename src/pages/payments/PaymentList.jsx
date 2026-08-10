import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const fmtEur  = (n) => `€${Number(n ?? 0).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-PT') : '—';

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
    <p className="text-2xl font-semibold text-gray-900">{value}</p>
  </div>
);

const PaymentList = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const p = await api.get('/payments').catch(() => []);
      setPayments(Array.isArray(p) ? p : []);
      setLoading(false);
    };
    load();
  }, []);

  const total   = payments.reduce((acc, p) => acc + (p.amount ?? 0), 0);
  const paid    = payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + (p.amount ?? 0), 0);
  const pending = total - paid;

  const cols = [
    { key: 'id',          label: 'ID',         render: r => `#${r.id}` },
    { key: 'amount',      label: 'Valor',       render: r => fmtEur(r.amount) },
    { key: 'status',      label: 'Estado',      render: r => r.status ? <Badge label={r.status} /> : '—' },
    { key: 'paymentDate', label: 'Data',        render: r => fmtDate(r.paymentDate) },
    { key: 'userId',      label: 'Utilizador',  render: r => r.user?.name ?? `#${r.userId}` },
    { key: 'serviceId',   label: 'Serviço',     render: r => r.service?.name ?? `#${r.serviceId}` },
    { key: 'actions',     label: '',            render: r => (
      <Button size="sm" onClick={() => navigate(`/payments/${r.id}`)}>Ver</Button>
    )},
  ];

  return (
    <div className="p-8 max-w-5xl flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Pagamentos</h1>
        <p className="text-sm text-gray-400 mt-1">{payments.length} registos</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total faturado"  value={fmtEur(total)}   />
        <StatCard label="Total recebido"  value={fmtEur(paid)}    />
        <StatCard label="Pendente"        value={fmtEur(pending)} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading
          ? <p className="p-8 text-sm text-gray-400 text-center">A carregar…</p>
          : <Table cols={cols} rows={payments} empty="Nenhum pagamento encontrado." />
        }
      </div>

    </div>
  );
};

export default PaymentList;