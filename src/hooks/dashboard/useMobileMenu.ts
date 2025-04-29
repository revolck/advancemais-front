import { useDispatch, useSelector } from 'react-redux';
import { handleMobileMenu } from '@/store/layoutReducer';

// Definição de tipo para o state do Redux
interface RootState {
  layout: {
    mobileMenu: boolean;
    [key: string]: any;
  };
}

/**
 * Hook para gerenciar o estado do menu mobile
 * @returns [mobileMenu, setMobileMenu] - Estado atual do menu mobile e função para alterá-lo
 */
const useMobileMenu = (): [boolean, (val: boolean) => void] => {
  const dispatch = useDispatch();
  const mobileMenu = useSelector((state: RootState) => state.layout.mobileMenu);

  // Função para alterar o estado do menu mobile
  const setMobileMenu = (val: boolean): void => {
    dispatch(handleMobileMenu(val));
  };

  return [mobileMenu, setMobileMenu];
};

export default useMobileMenu;
