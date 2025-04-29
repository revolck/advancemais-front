import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { handleSkin } from '@/store/layoutReducer';
import { RootState, AppDispatch } from '@/store';
import { ThemeConfig } from '@/configs/dashboard/themeConfig';

type UseSkinReturn = [ThemeConfig['layout']['skin'], (mode: ThemeConfig['layout']['skin']) => void];

const useSkin = (): UseSkinReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const skin = useSelector((state: RootState) => state.layout.skin);

  const setSkin = (mode: ThemeConfig['layout']['skin']) => {
    dispatch(handleSkin(mode));
    localStorage.setItem('skin', JSON.stringify(mode));
  };

  useEffect(() => {
    const storedMode = localStorage.getItem('skin');
    if (storedMode !== null) {
      dispatch(handleSkin(JSON.parse(storedMode)));
    }
  }, [dispatch]);

  return [skin, setSkin];
};

export default useSkin;
