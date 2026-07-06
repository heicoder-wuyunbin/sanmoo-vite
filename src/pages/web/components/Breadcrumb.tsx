import { HomeOutlined, RightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import React from 'react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 4 }}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <RightOutlined style={{ fontSize: 12, color: '#999' }} />}
          {index === 0 ? (
            <Link
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: '#666',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#1890FF';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#666';
              }}
            >
              <HomeOutlined style={{ fontSize: 14 }} />
              <span>{item.label}</span>
            </Link>
          ) : index === items.length - 1 ? (
            <span style={{ color: '#999' }}>{item.label}</span>
          ) : (
            <Link
              to={item.path}
              style={{
                color: '#666',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#1890FF';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#666';
              }}
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;
