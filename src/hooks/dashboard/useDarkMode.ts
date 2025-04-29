import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { handleDarkMode } from '@/store/layoutReducer';

// Definição de tipo para o state do Redux
interface RootState {
  layout: {
    darkMode: boolean;
    [key: string]: any;
  };
}

/**
 * Hook para gerenciar o modo escuro da aplicação
 * @returns [isDark, setDarkMode] - Estado atual do modo escuro e função para alterá-lo
 */
const useDarkMode = (): [boolean, (mode: boolean) => void] => {
  const dispatch = useDispatch();
  const isDark = useSelector((state: RootState) => state.layout.darkMode);

  const setDarkMode = (mode: boolean): void => {
    dispatch(handleDarkMode(mode));
    localStorage.setItem('darkMode', JSON.stringify(mode));
  };

  useEffect(() => {
    // Verifica se está executando no cliente (browser)
    if (typeof window !== 'undefined') {
      const storedDarkMode = localStorage.getItem('darkMode');
      if (storedDarkMode !== null) {
        dispatch(handleDarkMode(JSON.parse(storedDarkMode)));
      }
    }
  }, [dispatch]);

  return [isDark, setDarkMode];
};

export default useDarkMode;
