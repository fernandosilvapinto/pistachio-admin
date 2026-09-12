import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';

const EMPTY_FORM = { scheduledDate: '', serviceId: '', userId: '' };

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-PT') : '—';

const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

const STATUS_STYLES = {
  Pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const SchedulingList = () => {
  const navigate = useNavigate();
  // Uma permissão por operação, com os mesmos nomes que a API exige em cada
  // endpoint. É este espelho que torna o modelo legível: quem lê o ecrã percebe
  // o que o papel permite sem abrir o Keeper.
  const { can } = useAuth();
  const canWrite = can('scheduling:write');
  const canStatus = can('scheduling:status');
  const canAssign = can('scheduling:assign');
  const canDelete = can('scheduling:delete');
  const canSeePeople = can('users:read');
  const [schedulings, setSchedulings] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('Todos');

  const load = async () => {
    setLoading(true);
    const [s, sv, u] = await Promise.all([
      api.get('/schedulings').catch(() => []),
      api.get('/services').catch(() => []),
      canSeePeople ? api.get('/users').catch(() => []) : Promise.resolve([]),
    ]);
    setSchedulings(Array.isArray(s) ? s : []);
    setServices(Array.isArray(sv) ? sv : []);
    setUsers(Array.isArray(u) ? u : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal('create'); };
  const openEdit = (s) => {
    setForm({
      scheduledDate: s.scheduledDate?.slice(0, 16) ?? '',
      serviceId:     String(s.serviceId),
      userId:        String(s.userId),
    });
    setError('');
    setModal({ type: 'edit', scheduling: s });
  };

  const handleSave = async () => {
    if (!form.scheduledDate) { setError('A data é obrigatória.'); return; }
    if (!form.serviceId)     { setError('O serviço é obrigatório.'); return; }
    if (!form.userId)        { setError('O utilizador é obrigatório.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        scheduledDate: new Date(form.scheduledDate).toISOString(),
        serviceId:     parseInt(form.serviceId),
        userId:        parseInt(form.userId),
      };
      if (modal === 'create') {
        await api.post('/schedulings', payload);
      } else {
        await api.put(`/schedulings/${modal.scheduling.id}`, payload);
      }
      setModal(null); load();
    } catch (e) {
      setError(e.message ?? 'Erro ao guardar.');
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/schedulings/${id}/status`, { status });
      load();
    } catch (e) {
      setError(e.message ?? 'Erro ao alterar estado.');
    }
  };

  const handleAssigneeChange = async (id, assigneeId) => {
    try {
      await api.patch(`/schedulings/${id}/assignee`, {
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
      });
      load();
    } catch (e) {
      setError(e.message ?? 'Erro ao atribuir responsável.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tens a certeza que queres eliminar este agendamento?')) return;
    await api.delete(`/schedulings/${id}`).catch(() => {});
    load();
  };

  const getServiceName = (id) => services.find(s => s.id === id)?.name ?? '—';
  const getUserName    = (id) => users.find(u => u.id === id)?.name ?? '—';
  // Os papéis vivem no identity provider e não chegam nesta listagem,
  // por isso qualquer pessoa registada pode ser cliente ou responsável.
  const customers = users;
  const staff = users;

  const FILTERS = ['Todos', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];
  const filtered = filter === 'Todos'
    ? schedulings
    : schedulings.filter(s => s.status === filter);

  const cols = [
    { key: 'id',            label: 'ID',        render: r => `#${r.id}` },
    { key: 'scheduledDate', label: 'Data',       render: r => fmtDate(r.scheduledDate) },
    { key: 'userId',        label: 'Utilizador', render: r => getUserName(r.userId) },
    { key: 'serviceId',     label: 'Serviço',    render: r => getServiceName(r.serviceId) },
    { key: 'status',        label: 'Estado',     render: r => !canStatus ? (
      <span className={`text-xs font-medium rounded-full border px-2 py-0.5
        ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
        {r.status}
      </span>
    ) : (
      <select
        value={r.status}
        onChange={e => handleStatusChange(r.id, e.target.value)}
        onClick={e => e.stopPropagation()}
        className={`text-xs font-medium rounded-full border pl-2 pr-1 py-0.5 outline-none cursor-pointer
          ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}
      >
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    )},
    { key: 'assignee', label: 'Responsável', render: r => !canAssign ? (
      <span className="text-xs text-gray-500">{getUserName(r.assigneeId) }</span>
    ) : (
      <select
        value={r.assigneeId ?? ''}
        onChange={e => handleAssigneeChange(r.id, e.target.value)}
        onClick={e => e.stopPropagation()}
        className="text-xs rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 outline-none cursor-pointer focus:border-blue-400"
      >
        <option value="">— sem atribuição —</option>
        {staff.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    )},
    { key: 'actions', label: '', render: r => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => navigate(`/schedulings/${r.id}`)}>Ver</Button>
        {canWrite && <Button size="sm" onClick={() => openEdit(r)}>Editar</Button>}
        {canDelete && (
          <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>Eliminar</Button>
        )}
      </div>
    )},
  ];

  return (
    <div className="p-8 max-w-5xl flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Agendamentos</h1>
          <p className="text-sm text-gray-400 mt-1">{schedulings.length} total</p>
        </div>
        {canWrite && (
          <Button variant="primary" onClick={openCreate}>+ Novo agendamento</Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer
              ${filter === f
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading
          ? <p className="p-8 text-sm text-gray-400 text-center">A carregar…</p>
          : <Table cols={cols} rows={filtered} empty="Nenhum agendamento encontrado." />
        }
      </div>

      {modal && (
        <Modal
          title={modal === 'create' ? 'Novo agendamento' : 'Editar agendamento'}
          onClose={() => setModal(null)}
        >
          <div className="flex flex-col gap-3">
            <Input
              label="Data e hora"
              type="datetime-local"
              value={form.scheduledDate}
              onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
            />
            <Select
              label="Utilizador"
              value={form.userId}
              onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}
            >
              <option value="">— seleciona utilizador —</option>
              {customers.map(u => (
                <option key={u.id} value={u.id}>{u.name ?? u.email}</option>
              ))}
            </Select>
            <Select
              label="Serviço"
              value={form.serviceId}
              onChange={e => setForm(f => ({ ...f, serviceId: e.target.value }))}
            >
              <option value="">— seleciona serviço —</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2 justify-end pt-2">
              <Button onClick={() => setModal(null)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'A guardar…' : 'Guardar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default SchedulingList;