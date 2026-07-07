import React, { Suspense, lazy, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntApp, ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import '@ant-design/v5-patch-for-react-19';
import '@/App.css';
import { lightTheme, darkTheme } from '@/styles/theme';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';

const Home = lazy(() => import('@/pages/web/Home'));
const ArticleDetail = lazy(() => import('@/pages/web/ArticleDetail'));
const Categories = lazy(() => import('@/pages/web/Categories'));
const Tags = lazy(() => import('@/pages/web/Tags'));
const Topics = lazy(() => import('@/pages/web/Topics'));
const Archives = lazy(() => import('@/pages/web/Archives'));
const About = lazy(() => import('@/pages/web/About'));
const Links = lazy(() => import('@/pages/web/Links'));
const PrivacyPolicy = lazy(() => import('@/pages/web/PrivacyPolicy'));
const Search = lazy(() => import('@/pages/web/Search'));
const Favorites = lazy(() => import('@/pages/web/Favorites'));
const History = lazy(() => import('@/pages/web/History'));
const Admin = lazy(() => import('@/pages/Admin'));
const Login = lazy(() => import('@/pages/user/login'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const Articles = lazy(() => import('@/pages/admin/Articles'));
const CategoriesAdmin = lazy(() => import('@/pages/admin/Categories'));
const TagsAdmin = lazy(() => import('@/pages/admin/Tags'));
const TopicsAdmin = lazy(() => import('@/pages/admin/Topics'));
const LinksAdmin = lazy(() => import('@/pages/admin/Links'));
const Files = lazy(() => import('@/pages/admin/Files'));
const Users = lazy(() => import('@/pages/admin/Users'));
const VisitorsPage = lazy(() => import('@/pages/admin/Visitors'));
const ErrorLogsPage = lazy(() => import('@/pages/admin/ErrorLogs'));
const MPUsers = lazy(() => import('@/pages/admin/MPUsers'));
const Settings = lazy(() => import('@/pages/admin/Settings'));
const CoreSettings = lazy(() => import('@/pages/admin/settings/CoreSettings'));
const PrivacySettings = lazy(() => import('@/pages/admin/settings/PrivacySettings'));
const SocialSettings = lazy(() => import('@/pages/admin/settings/SocialSettings'));
const SearchSettings = lazy(() => import('@/pages/admin/settings/SearchSettings'));
const StorageSettings = lazy(() => import('@/pages/admin/settings/StorageSettings'));
const EmailSettings = lazy(() => import('@/pages/admin/settings/EmailSettings'));
const CacheSettings = lazy(() => import('@/pages/admin/settings/CacheSettings'));
const MaintenanceSettings = lazy(() => import('@/pages/admin/settings/MaintenanceSettings'));
const Roles = lazy(() => import('@/pages/admin/Roles'));
const Permissions = lazy(() => import('@/pages/admin/Permissions'));
const NotFound = lazy(() => import('@/pages/404'));

import { getAccessToken, isTokenExpired } from '@/utils/auth';

/**
 * 根据 useTheme() 的状态，动态选择 AntD 的 ConfigProvider theme。
 */
const ThemeAwareConfig: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark } = useTheme();
  const themeConfig = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);
  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      {children}
    </ConfigProvider>
  );
};

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = getAccessToken();
  if (!token || isTokenExpired(token)) {
    return <Navigate to="/user/login" replace />;
  }
  return <>{children}</>;
};

const routeFallback = (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--web-page-bg)',
    }}
  >
    <Spin size="large" />
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <AntApp>
      <Router>
        <Suspense fallback={routeFallback}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:id" element={<Categories />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/tags/:id" element={<Tags />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/topics/:id" element={<Topics />} />
            <Route path="/archives" element={<Archives />} />
            <Route path="/about" element={<About />} />
            <Route path="/links" element={<Links />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/search" element={<Search />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/history" element={<History />} />

            <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>}>
              <Route index element={<Dashboard />} />
              <Route path="articles" element={<Articles />} />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="tags" element={<TagsAdmin />} />
              <Route path="topics" element={<TopicsAdmin />} />
              <Route path="links" element={<LinksAdmin />} />
              <Route path="files" element={<Files />} />
              <Route path="users" element={<Users />} />
              <Route path="visitors" element={<VisitorsPage />} />
              <Route path="errors" element={<ErrorLogsPage />} />
              <Route path="mp-users" element={<MPUsers />} />
              <Route path="settings" element={<Settings />}>
                <Route index element={<Navigate to="core" replace />} />
                <Route path="core" element={<CoreSettings />} />
                <Route path="privacy" element={<PrivacySettings />} />
                <Route path="social" element={<SocialSettings />} />
                <Route path="search" element={<SearchSettings />} />
                <Route path="storage" element={<StorageSettings />} />
                <Route path="email" element={<EmailSettings />} />
                <Route path="cache" element={<CacheSettings />} />
                <Route path="maintenance" element={<MaintenanceSettings />} />
              </Route>
              <Route path="roles" element={<Roles />} />
              <Route path="permissions" element={<Permissions />} />
            </Route>

            <Route path="/user/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </AntApp>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ThemeAwareConfig>
        <AppRoutes />
      </ThemeAwareConfig>
    </ThemeProvider>
  );
};

export default App;
