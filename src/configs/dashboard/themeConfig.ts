export interface ThemeConfig {
  app: {
    name: string;
  };
  layout: {
    isRTL: boolean;
    darkMode: boolean;
    semiDarkMode: boolean;
    skin: 'default' | 'bordered';
    contentWidth: 'full' | 'boxed';
    type: 'vertical' | 'horizontal';
    navBarType: 'sticky' | 'static' | 'floating';
    footerType: 'static' | 'sticky';
    isMonochrome: boolean;
    menu: {
      isCollapsed: boolean;
      isHidden: boolean;
    };
    mobileMenu: boolean;
    customizer: boolean;
  };
}

const themeConfig: ThemeConfig = {
  app: {
    name: 'Dashcode React',
  },
  // layout
  layout: {
    isRTL: false,
    darkMode: false,
    semiDarkMode: false,
    skin: 'default',
    contentWidth: 'full',
    type: 'vertical',
    navBarType: 'sticky',
    footerType: 'static',
    isMonochrome: false,
    menu: {
      isCollapsed: false,
      isHidden: false,
    },
    mobileMenu: false,
    customizer: false,
  },
};

export default themeConfig;
