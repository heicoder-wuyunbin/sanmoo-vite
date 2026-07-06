import type { ThemeConfig } from 'antd';
import { theme as antTheme } from 'antd';

/**
 * Ant Design Pro 风格 - 主题 token 定义
 * 前台（Web）和后台（Admin）共享同一套品牌/尺寸 token，
 * 仅在 Layout/Menu 等局部组件上做差异化覆盖。
 */

// ------- 共享常量 -------
export const PRIMARY_COLOR = '#1677ff';
export const SUCCESS_COLOR = '#52c41a';
export const WARNING_COLOR = '#faad14';
export const ERROR_COLOR = '#ff4d4f';

// Ant Design Pro 深色侧边栏
export const PRO_SIDER_BG = '#001529';

// 字体族
const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";

// ------- Light 主题 -------
export const lightTokens = {
  colorPrimary: PRIMARY_COLOR,
  colorInfo: PRIMARY_COLOR,
  colorSuccess: SUCCESS_COLOR,
  colorWarning: WARNING_COLOR,
  colorError: ERROR_COLOR,
  colorBgBase: '#ffffff',
  colorBgLayout: '#f5f7fa',
  colorBgContainer: '#ffffff',
  colorBgElevated: '#ffffff',
  colorText: 'rgba(0, 0, 0, 0.88)',
  colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
  colorTextTertiary: 'rgba(0, 0, 0, 0.45)',
  colorBorder: '#d9d9d9',
  colorBorderSecondary: '#f0f0f0',
  borderRadius: 6,
  borderRadiusSM: 4,
  borderRadiusLG: 8,
  controlHeight: 32,
  controlHeightSM: 24,
  controlHeightLG: 40,
  fontSize: 14,
  fontSizeSM: 12,
  fontSizeLG: 16,
  fontFamily: FONT_FAMILY,
  boxShadow:
    '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
  boxShadowSecondary:
    '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  wireframe: false,
} as const;

// ------- Dark 主题 -------
export const darkTokens = {
  colorPrimary: '#4096ff',
  colorInfo: '#4096ff',
  colorSuccess: '#49aa19',
  colorWarning: '#d89614',
  colorError: '#cf1322',
  colorBgBase: '#141414',
  colorBgLayout: '#0f172a',
  colorBgContainer: '#1f1f1f',
  colorBgElevated: '#1f1f1f',
  colorText: 'rgba(255, 255, 255, 0.88)',
  colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
  colorTextTertiary: 'rgba(255, 255, 255, 0.45)',
  colorBorder: '#424242',
  colorBorderSecondary: '#303030',
  borderRadius: 6,
  borderRadiusSM: 4,
  borderRadiusLG: 8,
  controlHeight: 32,
  controlHeightSM: 24,
  controlHeightLG: 40,
  fontSize: 14,
  fontSizeSM: 12,
  fontSizeLG: 16,
  fontFamily: FONT_FAMILY,
  boxShadow:
    '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
  boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.32)',
  wireframe: false,
} as const;

// ------- 最终导出的两套 ThemeConfig -------
// 注意：components 中只使用 Ant Design 5 明确支持的 token 名称，
// 其他视觉细节通过全局 CSS 变量 / token 派生值来覆盖。
export const lightTheme: ThemeConfig = {
  algorithm: antTheme.defaultAlgorithm,
  token: lightTokens,
  components: {
    Layout: {
      bodyBg: '#f5f7fa',
      headerBg: '#ffffff',
      footerBg: '#f5f7fa',
      siderBg: '#001529',
      triggerBg: '#002140',
      headerHeight: 56,
    },
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
      darkItemSelectedBg: '#1677ff',
      itemHeight: 40,
      itemBorderRadius: 4,
    },
    Card: {
      borderRadiusLG: 8,
      headerBg: 'transparent',
    },
    Table: {
      headerBg: '#fafafa',
      borderRadiusLG: 8,
    },
    Button: {
      controlHeight: 32,
      borderRadius: 6,
    },
    Input: {
      borderRadius: 6,
    },
    Modal: {
      borderRadiusLG: 8,
    },
    Statistic: {
      contentFontSize: 24,
    },
  },
};

export const darkTheme: ThemeConfig = {
  algorithm: antTheme.darkAlgorithm,
  token: darkTokens,
  components: {
    Layout: {
      bodyBg: '#0f172a',
      headerBg: '#1f1f1f',
      footerBg: '#0f172a',
      siderBg: '#001529',
      triggerBg: '#000c17',
      headerHeight: 56,
    },
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
      darkItemSelectedBg: '#1677ff',
      itemHeight: 40,
      itemBorderRadius: 4,
    },
    Card: {
      borderRadiusLG: 8,
      headerBg: 'transparent',
    },
    Table: {
      headerBg: '#141414',
      borderRadiusLG: 8,
    },
    Button: {
      controlHeight: 32,
      borderRadius: 6,
    },
    Input: {
      borderRadius: 6,
    },
    Modal: {
      borderRadiusLG: 8,
    },
    Statistic: {
      contentFontSize: 24,
    },
  },
};

// 默认向前兼容（外部历史代码仍引用 webTheme）
export const webTheme = lightTheme;
export const webThemeTokens = lightTokens;

// ------- Pro Header / Sider 样式常量（供 Admin/WebShell 直接使用）-------
export const proHeaderStyle = {
  background: '#ffffff',
  borderBottom: '1px solid #f0f0f0',
  boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
  height: 56,
  padding: '0 24px',
} as const;

export const proSiderStyle = {
  background: PRO_SIDER_BG,
  borderRight: 'none',
} as const;

export const proContentStyle = {
  margin: '16px',
  padding: 0,
  background: 'transparent',
  borderRadius: 8,
  minHeight: 280,
} as const;
