import { useState, useEffect, createContext, useContext } from "react";

const API_BASE = "http://localhost:5000/api";

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const api = async (path, options = {}, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("pt-PT") : "—";
const fmtEur = (n) => `€${Number(n ?? 0).toFixed(2)}`;

const STATUS_COLORS = {
  Pending: "var(--color-background-warning)",
  Confirmed: "var(--color-background-info)",
  Completed: "var(--color-background-success)",
  Cancelled: "var(--color-background-danger)",
  Paid: "var(--color-background-success)",
  Unpaid: "var(--color-background-warning)",
  Active: "var(--color-background-success)",
  Inactive: "var(--color-background-secondary)",
};
const STATUS_TEXT = {
  Pending: "var(--color-text-warning)",
  Confirmed: "var(--color-text-info)",
  Completed: "var(--color-text-success)",
  Cancelled: "var(--color-text-danger)",
  Paid: "var(--color-text-success)",
  Unpaid: "var(--color-text-warning)",
  Active: "var(--color-text-success)",
  Inactive: "var(--color-text-secondary)",
};

const Badge = ({ label }) => (
  <span style={{
    fontSize: 11, fontWeight: 500, padding: "2px 8px",
    borderRadius: 99,
    background: STATUS_COLORS[label] ?? "var(--color-background-secondary)",
    color: STATUS_TEXT[label] ?? "var(--color-text-secondary)",
  }}>{label}</span>
);

const Pill = ({ children, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: "4px 14px", borderRadius: 99, fontSize: 13, cursor: "pointer",
    border: "0.5px solid",
    borderColor: active ? "var(--color-border-info)" : "var(--color-border-tertiary)",
    background: active ? "var(--color-background-info)" : "transparent",
    color: active ? "var(--color-text-info)" : "var(--color-text-secondary)",
    transition: "all .15s",
  }}>{children}</button>
);

const Input = ({ label, ...props }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 500 }}>{label}</span>
    <input {...props} style={{
      padding: "7px 10px", borderRadius: "var(--border-radius-md)", fontSize: 13,
      border: "0.5px solid var(--color-border-secondary)",
      background: "var(--color-background-secondary)",
      color: "var(--color-text-primary)", outline: "none", width: "100%", boxSizing: "border-box",
    }} />
  </label>
);

const Select = ({ label, children, ...props }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 500 }}>{label}</span>
    <select {...props} style={{
      padding: "7px 10px", borderRadius: "var(--border-radius-md)", fontSize: 13,
      border: "0.5px solid var(--color-border-secondary)",
      background: "var(--color-background-secondary)",
      color: "var(--color-text-primary)", outline: "none", width: "100%", boxSizing: "border-box",
    }}>{children}</select>
  </label>
);

const Btn = ({ children, variant = "default", size = "md", onClick, disabled, style: s }) => {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    borderRadius: "var(--border-radius-md)", fontWeight: 500, transition: "all .15s",
    border: "0.5px solid", fontSize: size === "sm" ? 12 : 13,
    padding: size === "sm" ? "4px 10px" : "7px 14px",
  };
  const variants = {
    default: { background: "transparent", borderColor: "var(--color-border-secondary)", color: "var(--color-text-primary)" },
    primary: { background: "#1D4ED8", borderColor: "#1D4ED8", color: "#fff" },
    danger: { background: "var(--color-background-danger)", borderColor: "var(--color-border-danger)", color: "var(--color-text-danger)" },
    ghost: { background: "transparent", borderColor: "transparent", color: "var(--color-text-secondary)" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...s }}>{children}</button>;
};

const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
  }}>
    <div style={{
      background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)",
      border: "0.5px solid var(--color-border-tertiary)",
      padding: "1.5rem", width: "min(480px, 95vw)", maxHeight: "85vh",
      overflowY: "auto", display: "flex", flexDirection: "column", gap: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--color-text-secondary)" }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Table = ({ cols, rows, empty = "Sem dados" }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>{cols.map(c => (
          <th key={c.key} style={{ textAlign: "left", padding: "8px 12px", fontWeight: 500, fontSize: 12, color: "var(--color-text-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" }}>{c.label}</th>
        ))}</tr>
      </thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={cols.length} style={{ textAlign: "center", padding: 24, color: "var(--color-text-secondary)" }}>{empty}</td></tr>
          : rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              {cols.map(c => (
                <td key={c.key} style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                  {c.render ? c.render(row) : row[c.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))
        }
      </tbody>
    </table>
  </div>
);

const Stat = ({ label, value, sub }) => (
  <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem" }}>
    <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 500 }}>{label}</p>
    <p style={{ margin: "0 0 2px", fontSize: 24, fontWeight: 500 }}>{value}</p>
    {sub && <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>{sub}</p>}
  </div>
);

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("admin@pistachio.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true); setError("");
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onLogin(data.token, data.user ?? { email });
    } catch {
      setError("Credenciais inválidas. Tenta novamente.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-background-tertiary)" }}>
      <div style={{ width: "min(360px,95vw)", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: "var(--border-radius-lg)", background: "#1D4ED8", marginBottom: 12 }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#fff" /></svg>
          </div>
          <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 500 }}>Pistachio Admin</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>Área administrativa</p>
        </div>
        <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@pistachio.local" />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
          {error && <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-danger)" }}>{error}</p>}
          <Btn variant="primary" onClick={submit} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
            {loading ? "A entrar…" : "Entrar"}
          </Btn>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--color-text-secondary)", margin: 0 }}>
          Usa as credenciais do SeedData para testar.
        </p>
      </div>
    </div>
  );
}

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "users", label: "Utilizadores", icon: "👥" },
  { id: "roles", label: "Perfis", icon: "🔑" },
  { id: "services", label: "Serviços", icon: "🔧" },
  { id: "schedulings", label: "Agendamentos", icon: "📅" },
  { id: "payments", label: "Pagamentos", icon: "💶" },
];

function Sidebar({ active, onNav, onLogout, user }) {
  return (
    <aside style={{
      width: 220, minHeight: "100vh", background: "var(--color-background-primary)",
      borderRight: "0.5px solid var(--color-border-tertiary)",
      display: "flex", flexDirection: "column", padding: "1.5rem 0",
      position: "sticky", top: 0, flexShrink: 0,
    }}>
      <div style={{ padding: "0 1.25rem 1.5rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14 }}>🌱</span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Pistachio</p>
            <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)" }}>Admin</p>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => onNav(n.id)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
            borderRadius: "var(--border-radius-md)", border: "none", cursor: "pointer", fontSize: 13,
            background: active === n.id ? "var(--color-background-info)" : "transparent",
            color: active === n.id ? "var(--color-text-info)" : "var(--color-text-primary)",
            fontWeight: active === n.id ? 500 : 400, textAlign: "left", width: "100%",
          }}>
            <span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: "1rem 1.25rem", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 500 }}>{user?.email ?? "Admin"}</p>
        <button onClick={onLogout} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--color-text-secondary)", padding: 0 }}>Sair →</button>
      </div>
    </aside>
  );
}

function Dashboard({ token }) {
  const [stats, setStats] = useState({ users: 0, schedulings: 0, services: 0, payments: 0 });
  const [loading, setLoading] = useState(true);
  const [recentSchedulings, setRecentSchedulings] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [users, schedulings, services, payments] = await Promise.all([
          api("/users", {}, token).catch(() => []),
          api("/schedulings", {}, token).catch(() => []),
          api("/services", {}, token).catch(() => []),
          api("/payments", {}, token).catch(() => []),
        ]);
        setStats({
          users: Array.isArray(users) ? users.length : (users?.total ?? 0),
          schedulings: Array.isArray(schedulings) ? schedulings.length : (schedulings?.total ?? 0),
          services: Array.isArray(services) ? services.length : (services?.total ?? 0),
          payments: Array.isArray(payments) ? payments.length : (payments?.total ?? 0),
        });
        if (Array.isArray(schedulings)) setRecentSchedulings(schedulings.slice(0, 5));
      } finally { setLoading(false); }
    };
    load();
  }, [token]);

  if (loading) return <div style={{ padding: "2rem", color: "var(--color-text-secondary)" }}>A carregar…</div>;

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }}>
      <div>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 500 }}>Dashboard</h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>Visão geral do sistema</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <Stat label="Utilizadores" value={stats.users} sub="registados" />
        <Stat label="Agendamentos" value={stats.schedulings} sub="total" />
        <Stat label="Serviços" value={stats.services} sub="disponíveis" />
        <Stat label="Pagamentos" value={stats.payments} sub="registados" />
      </div>
      {recentSchedulings.length > 0 && (
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Agendamentos recentes</h3>
          </div>
          <Table
            cols={[
              { key: "id", label: "ID", render: r => `#${String(r.id).slice(0, 6)}` },
              { key: "scheduledAt", label: "Data", render: r => fmtDate(r.scheduledAt) },
              { key: "status", label: "Estado", render: r => <Badge label={r.status} /> },
              { key: "notes", label: "Notas", render: r => r.notes ?? "—" },
            ]}
            rows={recentSchedulings}
          />
        </div>
      )}
    </div>
  );
}

function UsersPage({ token }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", roleId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([
        api("/users", {}, token).catch(() => []),
        api("/roles", {}, token).catch(() => []),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setRoles(Array.isArray(r) ? r : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ name: "", email: "", password: "", roleId: roles[0]?.id ?? "" }); setError(""); setModal("create"); };
  const openEdit = (u) => { setForm({ name: u.name ?? "", email: u.email, password: "", roleId: u.roleId ?? "" }); setError(""); setModal({ type: "edit", id: u.id }); };

  const save = async () => {
    setSaving(true); setError("");
    try {
      if (modal === "create") {
        await api("/users", { method: "POST", body: JSON.stringify(form) }, token);
      } else {
        await api(`/users/${modal.id}`, { method: "PUT", body: JSON.stringify(form) }, token);
      }
      setModal(null); load();
    } catch (e) { setError("Erro ao guardar. Verifica os dados."); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Eliminar utilizador?")) return;
    await api(`/users/${id}`, { method: "DELETE" }, token).catch(() => {});
    load();
  };

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 500 }}>Utilizadores</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>{users.length} registados</p>
        </div>
        <Btn variant="primary" onClick={openCreate}>+ Novo utilizador</Btn>
      </div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
        {loading ? <div style={{ padding: 24, textAlign: "center", color: "var(--color-text-secondary)" }}>A carregar…</div> : (
          <Table
            cols={[
              { key: "email", label: "Email" },
              { key: "name", label: "Nome", render: r => r.name ?? "—" },
              { key: "role", label: "Perfil", render: r => { const role = roles.find(ro => ro.id === r.roleId); return role ? <Badge label={role.name} /> : "—"; } },
              { key: "actions", label: "", render: r => (
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn size="sm" onClick={() => openEdit(r)}>Editar</Btn>
                  <Btn size="sm" variant="danger" onClick={() => del(r.id)}>Eliminar</Btn>
                </div>
              )},
            ]}
            rows={users}
          />
        )}
      </div>
      {modal && (
        <Modal title={modal === "create" ? "Novo utilizador" : "Editar utilizador"} onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <Input label={modal === "create" ? "Password" : "Nova password (deixa vazio para manter)"} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            <Select label="Perfil" value={form.roleId} onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}>
              <option value="">— sem perfil —</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
            {error && <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-danger)" }}>{error}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn onClick={() => setModal(null)}>Cancelar</Btn>
              <Btn variant="primary" onClick={save} disabled={saving}>{saving ? "A guardar…" : "Guardar"}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function RolesPage({ token }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await api("/roles", {}, token).catch(() => []);
    setRoles(Array.isArray(r) ? r : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (!modal?.id) await api("/roles", { method: "POST", body: JSON.stringify(form) }, token);
      else await api(`/roles/${modal.id}`, { method: "PUT", body: JSON.stringify(form) }, token);
      setModal(null); load();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 500 }}>Perfis</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>Gestão de roles</p>
        </div>
        <Btn variant="primary" onClick={() => { setForm({ name: "", description: "" }); setModal({}); }}>+ Novo perfil</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {loading ? <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>A carregar…</p> : roles.map(r => (
          <div key={r.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{r.name}</p>
              <Btn size="sm" ghost onClick={() => { setForm({ name: r.name, description: r.description ?? "" }); setModal({ id: r.id }); }}>✏️</Btn>
            </div>
            {r.description && <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>{r.description}</p>}
          </div>
        ))}
      </div>
      {modal !== null && (
        <Modal title={modal?.id ? "Editar perfil" : "Novo perfil"} onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn onClick={() => setModal(null)}>Cancelar</Btn>
              <Btn variant="primary" onClick={save} disabled={saving}>{saving ? "A guardar…" : "Guardar"}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ServicesPage({ token }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", duration: "", isActive: true });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const s = await api("/services", {}, token).catch(() => []);
    setServices(Array.isArray(s) ? s : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), duration: parseInt(form.duration) };
      if (!modal?.id) await api("/services", { method: "POST", body: JSON.stringify(payload) }, token);
      else await api(`/services/${modal.id}`, { method: "PUT", body: JSON.stringify(payload) }, token);
      setModal(null); load();
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Eliminar serviço?")) return;
    await api(`/services/${id}`, { method: "DELETE" }, token).catch(() => {});
    load();
  };

  const openCreate = () => { setForm({ name: "", description: "", price: "", duration: "", isActive: true }); setModal({}); };
  const openEdit = (s) => { setForm({ name: s.name, description: s.description ?? "", price: String(s.price), duration: String(s.duration ?? ""), isActive: s.isActive ?? true }); setModal({ id: s.id }); };

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 500 }}>Serviços</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>{services.length} serviços</p>
        </div>
        <Btn variant="primary" onClick={openCreate}>+ Novo serviço</Btn>
      </div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
        {loading ? <div style={{ padding: 24, textAlign: "center", color: "var(--color-text-secondary)" }}>A carregar…</div> : (
          <Table
            cols={[
              { key: "name", label: "Nome" },
              { key: "price", label: "Preço", render: r => fmtEur(r.price) },
              { key: "duration", label: "Duração", render: r => r.duration ? `${r.duration} min` : "—" },
              { key: "isActive", label: "Estado", render: r => <Badge label={r.isActive ? "Active" : "Inactive"} /> },
              { key: "actions", label: "", render: r => (
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn size="sm" onClick={() => openEdit(r)}>Editar</Btn>
                  <Btn size="sm" variant="danger" onClick={() => del(r.id)}>Eliminar</Btn>
                </div>
              )},
            ]}
            rows={services}
          />
        )}
      </div>
      {modal !== null && (
        <Modal title={modal?.id ? "Editar serviço" : "Novo serviço"} onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Preço (€)" type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              <Input label="Duração (min)" type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
              Serviço activo
            </label>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn onClick={() => setModal(null)}>Cancelar</Btn>
              <Btn variant="primary" onClick={save} disabled={saving}>{saving ? "A guardar…" : "Guardar"}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function SchedulingsPage({ token }) {
  const [schedulings, setSchedulings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const load = async () => {
    setLoading(true);
    const s = await api("/schedulings", {}, token).catch(() => []);
    setSchedulings(Array.isArray(s) ? s : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const statuses = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];
  const filtered = filter === "All" ? schedulings : schedulings.filter(s => s.status === filter);

  const update = async (id, status) => {
    await api(`/schedulings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, token).catch(() => {});
    load();
  };

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
      <div>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 500 }}>Agendamentos</h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>{schedulings.length} total</p>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {statuses.map(s => <Pill key={s} active={filter === s} onClick={() => setFilter(s)}>{s}</Pill>)}
      </div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
        {loading ? <div style={{ padding: 24, textAlign: "center", color: "var(--color-text-secondary)" }}>A carregar…</div> : (
          <Table
            cols={[
              { key: "id", label: "ID", render: r => `#${String(r.id).slice(0, 8)}` },
              { key: "scheduledAt", label: "Data", render: r => fmtDate(r.scheduledAt) },
              { key: "status", label: "Estado", render: r => <Badge label={r.status} /> },
              { key: "notes", label: "Notas", render: r => r.notes ?? "—" },
              { key: "actions", label: "", render: r => (
                <div style={{ display: "flex", gap: 4 }}>
                  {r.status === "Pending" && <Btn size="sm" onClick={() => update(r.id, "Confirmed")}>Confirmar</Btn>}
                  {r.status === "Confirmed" && <Btn size="sm" onClick={() => update(r.id, "Completed")}>Concluir</Btn>}
                  {!["Cancelled", "Completed"].includes(r.status) && <Btn size="sm" variant="danger" onClick={() => update(r.id, "Cancelled")}>Cancelar</Btn>}
                </div>
              )},
            ]}
            rows={filtered}
          />
        )}
      </div>
    </div>
  );
}

function PaymentsPage({ token }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const p = await api("/payments", {}, token).catch(() => []);
      setPayments(Array.isArray(p) ? p : []);
      setLoading(false);
    };
    load();
  }, []);

  const total = payments.reduce((acc, p) => acc + (p.amount ?? 0), 0);
  const paid = payments.filter(p => p.status === "Paid").reduce((acc, p) => acc + (p.amount ?? 0), 0);

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
      <div>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 500 }}>Pagamentos</h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>{payments.length} registos</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <Stat label="Total faturado" value={fmtEur(total)} />
        <Stat label="Total recebido" value={fmtEur(paid)} />
        <Stat label="Pendente" value={fmtEur(total - paid)} />
      </div>
      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
        {loading ? <div style={{ padding: 24, textAlign: "center", color: "var(--color-text-secondary)" }}>A carregar…</div> : (
          <Table
            cols={[
              { key: "id", label: "ID", render: r => `#${String(r.id).slice(0, 8)}` },
              { key: "amount", label: "Valor", render: r => fmtEur(r.amount) },
              { key: "status", label: "Estado", render: r => <Badge label={r.status} /> },
              { key: "paidAt", label: "Pago em", render: r => fmtDate(r.paidAt) },
              { key: "method", label: "Método", render: r => r.method ?? "—" },
            ]}
            rows={payments}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem("pstk") ?? null);
  const [user, setUser] = useState(() => { try { return JSON.parse(sessionStorage.getItem("psusr")); } catch { return null; } });
  const [page, setPage] = useState("dashboard");

  const login = (tok, usr) => {
    setToken(tok); setUser(usr);
    sessionStorage.setItem("pstk", tok);
    sessionStorage.setItem("psusr", JSON.stringify(usr));
  };
  const logout = () => {
    setToken(null); setUser(null);
    sessionStorage.removeItem("pstk"); sessionStorage.removeItem("psusr");
  };

  if (!token) return <LoginPage onLogin={login} />;

  const pages = {
    dashboard: <Dashboard token={token} />,
    users: <UsersPage token={token} />,
    roles: <RolesPage token={token} />,
    services: <ServicesPage token={token} />,
    schedulings: <SchedulingsPage token={token} />,
    payments: <PaymentsPage token={token} />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
      <Sidebar active={page} onNav={setPage} onLogout={logout} user={user} />
      <main style={{ flex: 1, overflowY: "auto" }}>
        {pages[page] ?? <Dashboard token={token} />}
      </main>
    </div>
  );
}
