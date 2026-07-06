import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, Typography, theme as antTheme, Space } from 'antd';

type TaxonomyItem = {
  id: number;
  name: string;
  articleCount?: number;
};

type Props = {
  categories: TaxonomyItem[];
  selectedId?: number;
};

const CategorySidebar: React.FC<Props> = ({ categories, selectedId }) => {
  const { token } = antTheme.useToken();

  return (
    <div
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        padding: 16,
        boxShadow: token.boxShadowTertiary,
      }}
    >
      <Typography.Text strong style={{ color: token.colorText }}>
        分类导航
      </Typography.Text>
      <Space wrap size={[6, 8]} style={{ width: '100%', marginTop: 12 }}>
        <Link to="/categories" style={{ textDecoration: 'none' }}>
          <Tag
            color={!selectedId ? 'blue' : 'default'}
            style={{ cursor: 'pointer', paddingInline: 10, lineHeight: '26px' }}
          >
            全部
          </Tag>
        </Link>
        {categories.map((item) => (
          <Link key={item.id} to={`/categories/${item.id}`} style={{ textDecoration: 'none' }}>
            <Tag
              color={selectedId === item.id ? 'blue' : 'default'}
              style={{ cursor: 'pointer', paddingInline: 10, lineHeight: '26px' }}
            >
              {item.name}
              {typeof item.articleCount === 'number' ? ` · ${item.articleCount}` : ''}
            </Tag>
          </Link>
        ))}
      </Space>
    </div>
  );
};

export default CategorySidebar;