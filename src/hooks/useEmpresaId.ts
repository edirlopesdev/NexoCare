import { useAuth } from '../contexts/AuthContext';

export function useEmpresaId() {
  const { empresaId } = useAuth();
  return empresaId;
}
