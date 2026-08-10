import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const EMPTY_FORM = { name: '' };

const RoleList = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const r = await api.get('/roles').catch(() => []);
    setRoles(Array.isArray(r) ? r : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal('create'); };
  const openEdit = (role) => { setForm({ name: role.name }); setError(''); setModal({ type: 'edit', role }); };

  const handleSave = async () => {
    if (!form.name) { setError('O nome é obrigatório.'); return; }
    setSaving(true); setError('');
    try {
      if (modal === 'create') {
        await api.post('/roles', form);
      } else {
        await api.put(`/roles/${modal.role.id}`, form);
      }
      setModal(null); load();
    } catch (e) {
      setError(e.message ?? 'Erro ao guardar.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tens a certeza que queres eliminar este perfil?')) return;
    await api.delete(`/roles/${id}`).catch(() => {});
    load();
  };

  const cols = [
    { key: 'id',      label: 'ID' },
    { key: 'name',    label: 'Nome' },
    { key: 'actions', label: '', render: r => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => navigate(`/roles/${r.id}`)}>Ver</Button>
        <Button size="sm" onClick={() => openEdit(r)}>Editar</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>Eliminar</Button>
      </div>
    )},
  ];

  return (
    <div className="p-8 max-w-5xl flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Perfis</h1>
          <p className="text-sm text-gray-400 mt-1">{roles.length} perfis</p>
        </div>
        <Button variant="primary" onClick={openCreate}>+ Novo perfil</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading
          ? <p className="p-8 text-sm text-gray-400 text-center">A carregar…</p>
          : <Table cols={cols} rows={roles} empty="Nenhum perfil encontrado." />
        }
      </div>

      {modal && (
        <Modal
          title={modal === 'create' ? 'Novo perfil' : 'Editar perfil'}
          onClose={() => setModal(null)}
        >
          <div className="flex flex-col gap-3">
            <Input
              label="Nome"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="ex: Manager"
            />
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

export default RoleList;