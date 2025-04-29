import { useSelector, useDispatch } from 'react-redux';
import { handleSidebarCollapsed } from '@/store/layoutReducer';
import { RootState, AppDispatch } from '@/store';

type UseSidebarReturn = [boolean, (val: boolean) => void];

const useSidebar = (): UseSidebarReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const collapsed = useSelector((state: RootState) => state.layout.isCollapsed);

  // ** Toggles Menu Collapsed
  const setMenuCollapsed = (val: boolean) => dispatch(handleSidebarCollapsed(val));

  return [collapsed, setMenuCollapsed];
};

export default useSidebar;
