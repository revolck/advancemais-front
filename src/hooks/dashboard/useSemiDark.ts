import { useEffect } from 'react';
import { handleSemiDarkMode } from '@/store/layoutReducer';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';

type UseSemiDarkReturn = [boolean, (val: boolean) => void];

const useSemiDark = (): UseSemiDarkReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const isSemiDark = useSelector((state: RootState) => state.layout.semiDarkMode);

  const setSemiDark = (val: boolean) => {
    dispatch(handleSemiDarkMode(val));
    localStorage.setItem('semiDarkMode', JSON.stringify(val));
  };

  useEffect(() => {
    const storedMode = localStorage.getItem('semiDarkMode');
    if (storedMode !== null) {
      dispatch(handleSemiDarkMode(JSON.parse(storedMode)));
    }
  }, [dispatch]);

  return [isSemiDark, setSemiDark];
};

export default useSemiDark;
