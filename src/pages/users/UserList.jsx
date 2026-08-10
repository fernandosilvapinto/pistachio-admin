import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';

const EMPTY_FORM = { name: '', email: '', password: '', roleId: '' };

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | { type: 'edit', user }
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([
        api.get('/users').catch(() => []),
        api.get('/roles').catch(() => []),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setRoles(Array.isArray(r) ? r : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, roleId: roles[0]?.id ?? '' });
    setError('');
    setModal('create');
  };

  const openEdit = (user) => {
    const role = roles.find(r => r.name === user.role);
    setForm({
      name: user.name ?? '',
      email: user.email,
      password: '',
      roleId: role?.id ?? '',
    });
    setError('');
    setModal({ type: 'edit', user });
  };

  const handleSave = async () => {
    if (!form.email) { setError('O email é obrigatório.'); return; }
    if (modal === 'create' && !form.password) { setError('A password é obrigatória.'); return; }

    setSaving(true);
    setError('');
    try {
      if (modal === 'create') {
        await api.post('/users', form);
        showToast('Utilizador criado com sucesso.');
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${modal.user.id}`, payload);
        showToast('Utilizador atualizado com sucesso.');
      }
      setModal(null);
      load();
    } catch (e) {
      setError(e.message ?? 'Erro ao guardar.');
      showToast('Erro ao guardar utilizador.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tens a certeza que queres eliminar este utilizador?')) return;
    try {
      await api.delete(`/users/${id}`);
      showToast('Utilizador eliminado.');
      load();
    } catch {
      showToast('Erro ao eliminar utilizador.', 'error');
    }
  };

  const getRoleName = (roleId) => roles.find(r => r.id === roleId)?.name ?? '—';

  const cols = [
    { key: 'email', label: 'Email' },
    { key: 'name', label: 'Nome', render: r => r.name ?? '—' },
    { key: 'role', label: 'Perfil', render: r => <Badge label={r.role ?? '—'} /> },
    {
      key: 'actions', label: '', render: r => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate(`/users/${r.id}`)}>Ver</Button>
          <Button size="sm" onClick={() => openEdit(r)}>Editar</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>Eliminar</Button>
        </div>
      )
    },
  ];

  return (
    <div className="p-8 max-w-5xl flex flex-col gap-6">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Utilizadores</h1>
          <p className="text-sm text-gray-400 mt-1">{users.length} registados</p>
        </div>
        <Button variant="primary" onClick={openCreate}>+ Novo utilizador</Button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200">
        {loading
          ? <p className="p-8 text-sm text-gray-400 text-center">A carregar…</p>
          : <Table cols={cols} rows={users} empty="Nenhum utilizador encontrado." />
        }
      </div>

      {/* Modal criar / editar */}
      {modal && (
        <Modal
          title={modal === 'create' ? 'Novo utilizador' : 'Editar utilizador'}
          onClose={() => setModal(null)}
        >
          <div className="flex flex-col gap-3">
            <Input
              label="Nome"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nome completo"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="email@exemplo.com"
            />
            <Input
              label={modal === 'create' ? 'Password' : 'Nova password (deixa vazio para manter)'}
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
            />
            <Select
              label="Perfil"
              value={form.roleId}
              onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}
            >
              <option value="">— sem perfil —</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
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

export default UserList;