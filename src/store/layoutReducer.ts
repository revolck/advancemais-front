import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// theme config import
import themeConfig, { ThemeConfig } from '@/configs/dashboard/themeConfig';

export interface LayoutState {
  isRTL: boolean;
  darkMode: boolean;
  isCollapsed: boolean;
  customizer: boolean;
  semiDarkMode: boolean;
  skin: ThemeConfig['layout']['skin'];
  contentWidth: ThemeConfig['layout']['contentWidth'];
  type: ThemeConfig['layout']['type'];
  menuHidden: boolean;
  navBarType: ThemeConfig['layout']['navBarType'];
  footerType: ThemeConfig['layout']['footerType'];
  mobileMenu: boolean;
  isMonochrome: boolean;
}

const initialState: LayoutState = {
  isRTL: themeConfig.layout.isRTL,
  darkMode: themeConfig.layout.darkMode,
  isCollapsed: themeConfig.layout.menu.isCollapsed,
  customizer: themeConfig.layout.customizer,
  semiDarkMode: themeConfig.layout.semiDarkMode,
  skin: themeConfig.layout.skin,
  contentWidth: themeConfig.layout.contentWidth,
  type: themeConfig.layout.type,
  menuHidden: themeConfig.layout.menu.isHidden,
  navBarType: themeConfig.layout.navBarType,
  footerType: themeConfig.layout.footerType,
  mobileMenu: themeConfig.layout.mobileMenu,
  isMonochrome: themeConfig.layout.isMonochrome,
};

export const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    // handle dark mode
    handleDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', String(action.payload));
      }
    },
    // handle sidebar collapsed
    handleSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isCollapsed = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarCollapsed', String(action.payload));
      }
    },
    // handle customizer
    handleCustomizer: (state, action: PayloadAction<boolean>) => {
      state.customizer = action.payload;
    },
    // handle semiDark
    handleSemiDarkMode: (state, action: PayloadAction<boolean>) => {
      state.semiDarkMode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('semiDarkMode', String(action.payload));
      }
    },
    // handle rtl
    handleRtl: (state, action: PayloadAction<boolean>) => {
      state.isRTL = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('direction', JSON.stringify(action.payload));
      }
    },
    // handle skin
    handleSkin: (state, action: PayloadAction<LayoutState['skin']>) => {
      state.skin = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('skin', JSON.stringify(action.payload));
      }
    },
    // handle content width
    handleContentWidth: (state, action: PayloadAction<LayoutState['contentWidth']>) => {
      state.contentWidth = action.payload;
    },
    // handle type
    handleType: (state, action: PayloadAction<LayoutState['type']>) => {
      state.type = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('type', JSON.stringify(action.payload));
      }
    },
    // handle menu hidden
    handleMenuHidden: (state, action: PayloadAction<boolean>) => {
      state.menuHidden = action.payload;
    },
    // handle navbar type
    handleNavBarType: (state, action: PayloadAction<LayoutState['navBarType']>) => {
      state.navBarType = action.payload;
    },
    // handle footer type
    handleFooterType: (state, action: PayloadAction<LayoutState['footerType']>) => {
      state.footerType = action.payload;
    },
    handleMobileMenu: (state, action: PayloadAction<boolean>) => {
      state.mobileMenu = action.payload;
    },
    handleMonoChrome: (state, action: PayloadAction<boolean>) => {
      state.isMonochrome = action.payload;

      if (typeof window !== 'undefined') {
        localStorage.setItem('monochrome', String(action.payload));
      }
    },
  },
});

export const {
  handleDarkMode,
  handleSidebarCollapsed,
  handleCustomizer,
  handleSemiDarkMode,
  handleRtl,
  handleSkin,
  handleContentWidth,
  handleType,
  handleMenuHidden,
  handleNavBarType,
  handleFooterType,
  handleMobileMenu,
  handleMonoChrome,
} = layoutSlice.actions;

export default layoutSlice.reducer;
