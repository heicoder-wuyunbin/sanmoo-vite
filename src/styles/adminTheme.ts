import {
  lightTheme,
  darkTheme,
  lightTokens,
  darkTokens,
  proHeaderStyle,
  proSiderStyle,
  proContentStyle,
  PRIMARY_COLOR,
  PRO_SIDER_BG,
} from '@/styles/theme';
import type { ThemeConfig } from 'antd';

/**
 * 后台主题 - 直接复用 theme.ts 中的 Ant Design Pro 风格定义。
 * 保留此文件以兼容既有 `import { adminTheme } from '@/styles/adminTheme'` 的用法。
 */
export const adminTheme: ThemeConfig = lightTheme;
export const adminThemeTokens = lightTokens;

// 明/暗两套配置对外导出（便于 Admin 在切换主题时拿到对应 ThemeConfig）
export { lightTheme as adminLightTheme, darkTheme as adminDarkTheme };
export {
  proHeaderStyle,
  proSiderStyle,
  proContentStyle,
  PRIMARY_COLOR as PRO_PRIMARY,
  PRO_SIDER_BG,
  lightTokens as adminLightTokens,
  darkTokens as adminDarkTokens,
};

// 向后兼容的常量
export { PRIMARY_COLOR };
