// 移动端页面类型定义

export type LayoutType = 'grid' | 'full' | 'three-column';
export type ModuleRegion = 'header' | 'content' | 'footer';

export interface PageModule {
  type: string;
  position: number;
  props: Record<string, unknown>;
  region?: ModuleRegion;
}

export interface GlobalStyles {
  backgroundColor: string;
  backgroundImage: string;
  textColor: string;
  fontFamily: string;
  borderColor: string;
  borderWidth: number;
}

export interface ModuleStyle {
  margin: string;
  padding: string;
  customCSS: string;
}

export interface PageStyles {
  global: GlobalStyles;
  modules: Record<string, ModuleStyle>;
}

export interface GlobalConfig {
  logoUrl?: string;
  slogan?: string;
  navItems?: NavItem[];
  footerLinks?: FooterLink[];
  floatingService?: {
    enabled: boolean;
  };
}

export interface NavItem {
  label: string;
  url: string;
  icon?: string;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface PageContent {
  modules: PageModule[];
  styles: PageStyles;
  global?: GlobalConfig;
}

// API 响应类型
export interface PageApiResponse {
  page: {
    id: string;
    title: string;
    slug: string;
    route: string;
    layout: LayoutType;
    status: string;
  };
  content: PageContent;
}
