import { useNavigate } from 'react-router-dom';
import Button from './Button';

/**
 * Layout reutilizável para páginas de detalhe de um registo.
 *
 * Props:
 * - title: título principal (ex: nome do utilizador)
 * - subtitle: linha secundária, opcional (ex: "Utilizador #4")
 * - fields: array de { label, value, render? } — render(value) é opcional, para valores custom (Badge, links, etc.)
 * - actions: nós React opcionais (ex: botão Editar), mostrados no cabeçalho
 * - backTo: caminho para o botão "Voltar" (ex: "/users")
 */
const DetailView = ({ title, subtitle, fields = [], actions, backTo }) => {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-3xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Button size="sm" variant="ghost" onClick={() => (backTo ? navigate(backTo) : navigate(-1))}>
            ← Voltar
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {fields.map((f, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-gray-500">{f.label}</span>
            <span className="text-sm text-gray-900 font-medium">
              {f.render ? f.render(f.value) : (f.value ?? '—')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailView;
