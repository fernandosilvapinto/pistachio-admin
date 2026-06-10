import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center flex flex-col items-center gap-4">
        <p className="text-6xl font-bold text-gray-200">404</p>
        <h1 className="text-xl font-semibold text-gray-700">Página não encontrada</h1>
        <p className="text-sm text-gray-400">O endereço que tentaste aceder não existe.</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Voltar ao início
        </Button>
      </div>
    </div>
  );
};

export default NotFound;