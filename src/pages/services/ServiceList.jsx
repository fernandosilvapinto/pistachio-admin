import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const EMPTY_FORM = { name: '', description: '', price: '', isActive: true, isFeatured: false };

const fmtEur = (n) => `€${Number(n ?? 0).toFixed(2)}`;

const ServiceList = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const s = await api.get('/services').catch(() => []);
    setServices(Array.isArray(s) ? s : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal('create'); };
  const openEdit = (s) => {
    setForm({
      name:        s.name,
      description: s.description ?? '',
      price:       String(s.price),
      isActive:    s.isActive,
      isFeatured:  s.isFeatured,
    });
    setError('');
    setModal({ type: 'edit', service: s });
  };

  const handleSave = async () => {
    if (!form.name) { setError('O nome é obrigatório.'); return; }
    if (!form.price) { setError('O preço é obrigatório.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (modal === 'create') {
        await api.post('/services', payload);
      } else {
        await api.put(`/services/${modal.service.id}`, payload);
      }
      setModal(null); load();
    } catch (e) {
      setError(e.message ?? 'Erro ao guardar.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tens a certeza que queres eliminar este serviço?')) return;
    await api.delete(`/services/${id}`).catch(() => {});
    load();
  };

  const cols = [
    { key: 'name',        label: 'Nome' },
    { key: 'description', label: 'Descrição',  render: r => r.description ?? '—' },
    { key: 'price',       label: 'Preço',      render: r => fmtEur(r.price) },
    { key: 'isActive',    label: 'Estado',     render: r => <Badge label={r.isActive ? 'Active' : 'Inactive'} /> },
    { key: 'isFeatured',  label: 'Destaque',   render: r => r.isFeatured ? '⭐' : '—' },
    { key: 'actions', label: '', render: r => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => navigate(`/services/${r.id}`)}>Ver</Button>
        <Button size="sm" onClick={() => openEdit(r)}>Editar</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>Eliminar</Button>
      </div>
    )},
  ];

  return (
    <div className="p-8 max-w-5xl flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Serviços</h1>
          <p className="text-sm text-gray-400 mt-1">{services.length} serviços</p>
        </div>
        <Button variant="primary" onClick={openCreate}>+ Novo serviço</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading
          ? <p className="p-8 text-sm text-gray-400 text-center">A carregar…</p>
          : <Table cols={cols} rows={services} empty="Nenhum serviço encontrado." />
        }
      </div>

      {modal && (
        <Modal
          title={modal === 'create' ? 'Novo serviço' : 'Editar serviço'}
          onClose={() => setModal(null)}
        >
          <div className="flex flex-col gap-3">
            <Input
              label="Nome"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="ex: Mudança de óleo"
            />
            <Input
              label="Descrição"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descrição opcional"
            />
            <Input
              label="Preço (€)"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="0.00"
            />
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                />
                Serviço activo
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                />
                Em destaque
              </label>
            </div>
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

export default ServiceList;