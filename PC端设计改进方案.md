# Sanmoo Blog PC 端设计改进方案

> 基于对现有代码的全面审查，以下是按优先级排序的具体改进方案。

---

## 一、品牌视觉辨识度提升（优先级：高）

### 1.1 定制品牌色

**现状问题：** 主色 `#1677ff` 是 Ant Design 默认蓝，与大量使用 Ant Design 的项目雷同，无法形成品牌记忆。

**改进方案：**

从以下方向中选择一个符合博客调性的品牌色，替代 `#1677ff`：

| 方案 | 主色 | 色值 | 适用风格 |
|------|------|------|----------|
| A - 靛蓝深邃 | Indigo | `#4F46E5` | 技术/专业感，适合后端技术博客 |
| B - 翡翠科技 | Teal | `#0D9488` | 清新/现代感，适合全栈技术博客 |
| C - 琥珀暖光 | Amber | `#D97706` | 温暖/人文感，适合偏文章型的博客 |
| D - 墨绿沉稳 | Forest | `#16A34A` | 自然/沉稳感，适合长期写作型博客 |

**推荐方案 A（靛蓝深邃）**，理由：
- 与技术博客调性高度匹配
- 与深色侧边栏 `#001529` 搭配和谐
- 在深色模式下表现优秀（可调整为 `#818CF8`）

**涉及修改的文件：**
- `src/styles/theme.ts` — `PRIMARY_COLOR`、`lightTokens.colorPrimary`、`darkTokens.colorPrimary`
- `src/index.css` — 所有 `--web-primary` 相关变量
- `src/App.css` — Pagination 等组件中的主色引用

```typescript
// theme.ts 修改示例（方案 A）
export const PRIMARY_COLOR = '#4F46E5';

// lightTokens
colorPrimary: '#4F46E5',
colorInfo: '#4F46E5',

// darkTokens
colorPrimary: '#818CF8',
colorInfo: '#818CF8',
```

```css
/* index.css 修改示例（方案 A） */
:root {
  --web-primary: #4F46E5;
  --web-primary-hover: #6366F1;
  --web-primary-active: #4338CA;
  --web-primary-soft: rgba(79, 70, 229, 0.08);
}

html[data-theme='dark'] {
  --web-primary: #818CF8;
  --web-primary-hover: #A5B4FC;
  --web-primary-active: #6366F1;
  --web-primary-soft: rgba(129, 140, 248, 0.15);
}
```

### 1.2 品牌化关键触点

**Header Logo 区改造：**

当前 Header 的 Logo 仅取博客名首字放入一个蓝色 Avatar，过于简陋。

```tsx
// WebHeader.tsx Logo 区改进
<Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
  {/* 替换为 SVG Logo 或品牌化 Avatar */}
  <div style={{
    width: 36,
    height: 36,
    borderRadius: 10,
    background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimary}CC 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 2px 8px ${token.colorPrimary}30`,
  }}>
    <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>S</span>
  </div>
  <div style={{ lineHeight: 1.2 }}>
    <div style={{ fontWeight: 700, color: token.colorText, fontSize: 16, letterSpacing: '-0.3px' }}>
      {blogName}
    </div>
    {isDesktop ? (
      <div style={{ color: token.colorTextTertiary, fontSize: 11, marginTop: 2 }}>
        Backend Art · 个人原创内容站
      </div>
    ) : null}
  </div>
</Link>
```

**侧边栏 Logo 区改造（Admin）：**

当前 `pro-sider-logo` 用纯文字 + 浅蓝副标题。建议加入渐变背景或图标：

```css
.pro-sider-logo {
  /* 保持现有布局 */
  background: linear-gradient(180deg, #002140 0%, #001529 100%);
}

/* 在 Logo 文字前加一个小图标或品牌标记 */
.pro-sider-logo .brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4F46E5, #6366F1);
  margin-right: 10px;
  font-weight: 800;
  font-size: 14px;
  color: #fff;
}
```

---

## 二、首页 Hero 区视觉升级（优先级：高）

### 2.1 增加 Hero 区视觉层次

**现状问题：** Hero 区是一张带渐变背景的 Card，视觉冲击力不足。

**改进方案：**

```tsx
// Home.tsx Hero 区改进
<Card
  style={{
    ...heroStyle,
    position: 'relative',
    overflow: 'hidden',
    padding: 0,
  }}
  styles={{ body: { padding: 0, position: 'relative', zIndex: 1 } }}
>
  {/* 装饰性背景元素 */}
  <div style={{
    position: 'absolute',
    top: -60,
    right: -40,
    width: 280,
    height: 280,
    borderRadius: '50%',
    background: `${token.colorPrimary}10`,
    filter: 'blur(60px)',
    zIndex: 0,
  }} />
  <div style={{
    position: 'absolute',
    bottom: -40,
    left: '40%',
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: `${token.colorWarningBg}80`,
    filter: 'blur(50px)',
    zIndex: 0,
  }} />

  <div style={{ padding: '40px 40px 36px', maxWidth: 720, position: 'relative', zIndex: 1 }}>
    <Space direction="vertical" size={20}>
      {/* Tag 保持不变 */}
      <div>
        <Tag ...>Backend Art · 个人原创</Tag>
      </div>

      {/* 标题：增大字号 + 字重对比 */}
      <div>
        <Typography.Title
          level={1}
          style={{
            margin: 0,
            color: token.colorTextHeading,
            fontSize: 44,        // 从 40 增大到 44
            lineHeight: 1.12,    // 收紧行高
            fontWeight: 800,     // 从 700 提升到 800
            letterSpacing: '-0.5px',
            textWrap: 'balance',
          }}
        >
          {blogName}
        </Typography.Title>
        <Typography.Paragraph
          style={{
            margin: '18px 0 0',  // 增加间距
            color: token.colorTextSecondary,
            fontSize: 17,         // 从 16 增大到 17
            lineHeight: 1.75,
            maxWidth: 560,       // 限制宽度提升阅读节奏
          }}
        >
          {introduction}
        </Typography.Paragraph>
      </div>

      {/* 统计信息 + CTA 按钮组：保持不变 */}
      ...
    </Space>
  </div>
</Card>
```

### 2.2 首页信息架构优化

**现状：** featured -> spotlight -> feed 三级瀑布，但视觉区分度不够。

**改进建议：**

- **featured 文章卡：** 增加 `borderLeft: 4px solid ${token.colorPrimary}` 或顶部渐变条，强化"推荐"视觉权重
- **spotlight 区域：** 将 "推荐延伸" 改为更具体的标题（如基于文章分类名），减少抽象描述
- **增加"最新动态"时间线条：** 在 feed 列表左侧加入日期分隔线（今天 / 昨天 / 更早），增强时间感

```tsx
// 日期分组示例
const groupedArticles = useMemo(() => {
  const groups: { label: string; articles: ArticleItem[] }[] = [];
  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

  const todayArticles = feedArticles.filter(a => dayjs(a.createTime).format('YYYY-MM-DD') === today);
  const yesterdayArticles = feedArticles.filter(a => dayjs(a.createTime).format('YYYY-MM-DD') === yesterday);
  const olderArticles = feedArticles.filter(a => {
    const d = dayjs(a.createTime).format('YYYY-MM-DD');
    return d !== today && d !== yesterday;
  });

  if (todayArticles.length) groups.push({ label: '今天', articles: todayArticles });
  if (yesterdayArticles.length) groups.push({ label: '昨天', articles: yesterdayArticles });
  if (olderArticles.length) groups.push({ label: '更早', articles: olderArticles });
  return groups;
}, [feedArticles]);
```

---

## 三、代码质量与主题一致性修复（优先级：中）

### 3.1 消除硬编码颜色

**现状问题：** `ArticleDetail.tsx` 中 meta tag 颜色全部硬编码，`SearchModal.tsx` 同样存在此问题。

**改进方案 — 提取为 CSS 变量：**

在 `index.css` 中新增：

```css
:root {
  /* 文章 Meta 标签颜色 */
  --tag-time-bg: #E6F7FF;
  --tag-time-border: #91D5FF;
  --tag-time-text: #1890FF;
  --tag-read-bg: #F6FFED;
  --tag-read-border: #B7EB8F;
  --tag-read-text: #52C41A;
  --tag-duration-bg: #F9F0FF;
  --tag-duration-border: #D3ADF7;
  --tag-duration-text: #722ED1;
  --tag-words-bg: #FFF0F6;
  --tag-words-border: #FFB3C1;
  --tag-words-text: #EB2F96;
  --tag-category-bg: #FFF7E6;
  --tag-category-border: #FFD666;
  --tag-category-text: #FA8C16;

  /* 搜索弹窗颜色 */
  --search-text: #333333;
  --search-text-secondary: #999999;
  --search-border: #f0f0f0;
  --search-item-hover: #f5f5f5;
}

html[data-theme='dark'] {
  --tag-time-bg: rgba(22, 119, 255, 0.12);
  --tag-time-border: rgba(22, 119, 255, 0.3);
  --tag-time-text: #4096FF;
  --tag-read-bg: rgba(82, 196, 26, 0.12);
  --tag-read-border: rgba(82, 196, 26, 0.3);
  --tag-read-text: #73D13D;
  --tag-duration-bg: rgba(114, 46, 209, 0.12);
  --tag-duration-border: rgba(114, 46, 209, 0.3);
  --tag-duration-text: #B37FEB;
  --tag-words-bg: rgba(235, 47, 150, 0.12);
  --tag-words-border: rgba(235, 47, 150, 0.3);
  --tag-words-text: #FF85C0;
  --tag-category-bg: rgba(250, 140, 22, 0.12);
  --tag-category-border: rgba(250, 140, 22, 0.3);
  --tag-category-text: #FFC53D;

  --search-text: #e2e8f0;
  --search-text-secondary: #94a3b8;
  --search-border: #334155;
  --search-item-hover: #1e293b;
}
```

在 `ArticleDetail.tsx` 中替换：

```tsx
// 之前
style={{
  backgroundColor: '#E6F7FF',
  borderColor: '#91D5FF',
  color: '#1890FF',
  ...
}}

// 之后
style={{
  backgroundColor: 'var(--tag-time-bg)',
  borderColor: 'var(--tag-time-border)',
  color: 'var(--tag-time-text)',
  ...
}}
```

在 `SearchModal.tsx` 中替换所有硬编码颜色：

```tsx
// 之前
style={{ color: '#8c8c8c', fontSize: 20 }}
style={{ color: '#1f1f1f', fontSize: 14 }}
style={{ color: '#999', fontSize: 12 }}

// 之后
style={{ color: 'var(--search-text-secondary)', fontSize: 20 }}
style={{ color: 'var(--search-text)', fontSize: 14 }}
style={{ color: 'var(--search-text-secondary)', fontSize: 12 }}
```

### 3.2 减少内联样式，迁移至 CSS Module

**现状问题：** 大量 `useMemo` + 内联 `CSSProperties`，代码冗长且难以维护。

**改进策略（渐进式，不必一次完成）：**

1. 将 `cardStyle`、`titleStyle` 等高频复用的样式提取为 CSS class
2. 优先处理 `ArticleDetail.tsx`（最长的文件）和 `Home.tsx`

```css
/* 新建 src/pages/web/article-detail.module.css */
.card {
  border-radius: var(--web-radius-lg);
  border: 1px solid var(--web-border-soft);
  box-shadow: var(--web-shadow);
  background: var(--web-card);
}

.title {
  margin: 0;
  color: var(--web-title);
  transition: color 0.24s ease;
  text-wrap: balance;
}

.title:hover {
  color: var(--web-primary);
}
```

```tsx
// ArticleDetail.tsx
import styles from './article-detail.module.css';

// 之前
const cardStyle = useMemo<React.CSSProperties>(() => ({
  borderRadius: token.borderRadiusLG,
  border: `1px solid ${token.colorBorderSecondary}`,
  ...
}), [token]);

// 之后
<Card className={styles.card} ... />
```

---

## 四、关于页丰富化（优先级：中）

### 4.1 增加内容模块

**现状问题：** 关于页仅展示头像、介绍和几个外链，过于简陋。

**改进方案 — 增加四个模块：**

```tsx
<WebShell>
  <Space direction="vertical" size={20} style={{ width: '100%' }}>
    {/* 模块 1：个人简介 Hero（保留现有，微调） */}
    <Card ...>
      <Avatar size={128} ... />
      <Typography.Title level={2}>关于 {author}</Typography.Title>
      <Typography.Paragraph>{introduction}</Typography.Paragraph>
    </Card>

    {/* 模块 2：技能标签云 */}
    <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
      <Typography.Title level={4} style={{ margin: '0 0 16px' }}>
        <CodeOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
        技术栈
      </Typography.Title>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {['Go', 'Java', 'Spring Boot', 'MySQL', 'Redis', 'Docker', 'Kubernetes',
         'React', 'TypeScript', 'Nginx', 'Linux', 'Git'].map(skill => (
          <Tag
            key={skill}
            style={{
              borderRadius: 999,
              padding: '4px 14px',
              fontSize: 13,
              fontWeight: 500,
              background: `${token.colorPrimary}10`,
              borderColor: `${token.colorPrimary}30`,
              color: token.colorPrimary,
            }}
          >
            {skill}
          </Tag>
        ))}
      </div>
    </Card>

    {/* 模块 3：社交链接（增强现有） */}
    <Row gutter={[16, 16]}>
      {links.map((item) => (
        <Col xs={24} md={12} key={item.label}>
          <Card style={cardStyle} hoverable styles={{ body: { padding: 22 } }}>
            <Space direction="vertical" size={10}>
              <Typography.Title level={4}>{item.label}</Typography.Title>
              <Typography.Text type="secondary">{item.desc}</Typography.Text>
              <a href={item.value} target="_blank" rel="noopener noreferrer">
                {item.value}
              </a>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>

    {/* 模块 4：博客统计（可选） */}
    <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
      <Typography.Title level={4} style={{ margin: '0 0 16px' }}>
        <BarChartOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
        博客数据
      </Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={8}>
          <Statistic title="文章总数" value={articleCount} />
        </Col>
        <Col xs={8}>
          <Statistic title="分类数" value={categories.length} />
        </Col>
        <Col xs={8}>
          <Statistic title="标签数" value={tags.length} />
        </Col>
      </Row>
    </Card>
  </Space>
</WebShell>
```

---

## 五、响应式体验优化（优先级：中）

### 5.1 平板端适配

**现状问题：** `lg`（992px）以下直接隐藏导航，无中间态。

**改进方案：**

```tsx
// WebHeader.tsx
const isTablet = !!screens.md && !screens.lg;
const isMobile = !screens.md;

// 平板端：显示图标导航（无文字）
{isTablet ? (
  <Menu
    mode="horizontal"
    selectedKeys={[location.pathname]}
    items={navItems.map((item) => ({
      key: item.key,
      icon: item.icon,  // 只显示图标
      label: <Link to={item.key}>{item.label}</Link>,
    }))}
    style={{
      background: 'transparent',
      borderBottom: 'none',
      flex: 1,
    }}
  />
) : null}

// 仅移动端显示 Dropdown
{isMobile ? (
  <Dropdown menu={{ items: mobileMenuItems }} placement="bottomRight">
    <Button type="text" icon={<AppstoreOutlined />} aria-label="导航菜单" />
  </Dropdown>
) : null}
```

### 5.2 文章 TOC 移动端替代方案

**现状问题：** 1024px 以下 TOC 直接隐藏，无替代入口。

**改进方案：**

在文章详情页添加一个悬浮按钮，点击后弹出 TOC 抽屉：

```tsx
// ArticleDetail.tsx
import { FloatButton, Drawer } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';

// 在 return 中添加
<FloatButton
  icon={<UnorderedListOutlined />}
  tooltip="文章目录"
  style={{
    position: 'fixed',
    bottom: 88,
    right: 32,
    zIndex: 999,
    display: toc.length > 0 ? 'block' : 'none',
  }}
  onClick={() => setTocDrawerVisible(true)}
/>

<Drawer
  title="文章目录"
  placement="right"
  onClose={() => setTocDrawerVisible(false)}
  open={tocDrawerVisible}
  width={280}
>
  <TableOfContents toc={toc} />
</Drawer>
```

```css
/* 仅在 TOC 侧边栏隐藏时显示 FloatButton */
@media (max-width: 1024px) {
  .toc-float-btn { display: block; }
}
@media (min-width: 1025px) {
  .toc-float-btn { display: none; }
}
```

---

## 六、细节打磨（优先级：低）

### 6.1 Header 搜索框交互优化

当前搜索框 `onClick` 直接打开弹窗，用户无法在输入框中打字。建议改为：

```tsx
{isDesktop ? (
  <Input
    placeholder="搜索文章…"
    prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    onFocus={onSearchClick}      // 聚焦时打开弹窗
    style={{ width: 220 }}
    suffix={searchText ? (
      <CloseCircleOutlined
        style={{ color: token.colorTextTertiary, cursor: 'pointer' }}
        onClick={() => setSearchText('')}
      />
    ) : null}
  />
) : null}
```

### 6.2 文章卡片 normal 样式左边框优化

```tsx
// 当前
borderLeft: `4px solid ${isHovered ? token.colorPrimary : `color-mix(in srgb, ${token.colorPrimary} 85%, transparent)`}`

// 优化：用 CSS transition 替代 color-mix（兼容性更好）
borderLeft: `4px solid ${isHovered ? token.colorPrimary : `${token.colorPrimary}20`}`
```

### 6.3 字体加载策略优化

```css
/* 当前：从阿里 CDN 加载 */
@font-face {
  font-family: 'AlibabaSans';
  src: url('//mdn.alipayobjects.com/huamei_iwk9zp/afts/file/...');
}

/* 建议增加本地 fallback + preload */
<link rel="preload" href="/fonts/AlibabaSans-Regular.woff2" as="font" type="font/woff2" crossorigin />

/* 同时在 font-family 栈中确保良好 fallback */
font-family: 'AlibabaSans', 'PingFang SC', 'Microsoft YaHei', -apple-system, ...;
```

### 6.4 Footer 样式微调

当前 Footer 备案号区域的链接颜色使用了 `token.colorTextTertiary`，在浅色模式下对比度偏低。建议：

```tsx
style={{ color: token.colorTextSecondary, marginRight: 12 }}
// 从 tertiary 改为 secondary，提升可读性
```

---

## 七、实施路线图

| 阶段 | 内容 | 预估工作量 | 文件影响范围 |
|------|------|-----------|-------------|
| **Phase 1** | 品牌色替换 + Header/Logo 微调 | 0.5 天 | `theme.ts`、`index.css`、`WebHeader.tsx`、`Admin.tsx` |
| **Phase 2** | 首页 Hero 区视觉升级 | 0.5 天 | `Home.tsx` |
| **Phase 3** | 硬编码颜色修复（articleDetail + searchModal） | 0.5 天 | `ArticleDetail.tsx`、`SearchModal.tsx`、`index.css` |
| **Phase 4** | 关于页丰富化 | 0.3 天 | `About.tsx` |
| **Phase 5** | 响应式优化（平板导航 + TOC 抽屉） | 0.5 天 | `WebHeader.tsx`、`ArticleDetail.tsx`、`articleDetail.css` |
| **Phase 6** | 细节打磨（搜索交互、字体、Footer） | 0.3 天 | 多文件微调 |
| **Phase 7** | 内联样式迁移 CSS Module（渐进式） | 1-2 天 | `ArticleDetail.tsx`、`Home.tsx` 等 |

**总预估：** 3-4 天可完成 Phase 1-6 的全部改进，Phase 7 可作为长期重构任务逐步推进。

---

*文档生成时间：2026-07-17*
