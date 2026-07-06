import React, { useEffect, useState } from 'react';
import { type TOCItem } from '@/services/blog/api';

interface TableOfContentsProps {
  toc: TOCItem[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ toc }) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('.md-h');
      let currentHeadingId = '';

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          currentHeadingId = heading.id;
        }
      });

      setActiveId(currentHeadingId);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  const getIndentStyle = (level: number) => {
    switch (level) {
      case 1:
        return { paddingLeft: 0 };
      case 2:
        return { paddingLeft: 12 };
      case 3:
        return { paddingLeft: 24 };
      case 4:
        return { paddingLeft: 36 };
      case 5:
        return { paddingLeft: 48 };
      case 6:
        return { paddingLeft: 60 };
      default:
        return { paddingLeft: 0 };
    }
  };

  const getFontSize = (level: number) => {
    switch (level) {
      case 1:
        return 15;
      case 2:
        return 14;
      case 3:
        return 13;
      default:
        return 12;
    }
  };

  if (!toc || toc.length === 0) {
    return null;
  }

  return (
    <div className="toc-container">
      <div className="toc-header">
        <span className="toc-icon">📋</span>
        <span className="toc-title">文章目录</span>
      </div>
      <div className="toc-content">
        {toc.map((item) => (
          <div
            key={item.id}
            className={`toc-item ${activeId === item.id ? 'toc-item-active' : ''}`}
            style={{ ...getIndentStyle(item.level), fontSize: getFontSize(item.level) }}
            onClick={() => scrollToHeading(item.id)}
          >
            <span className="toc-bullet">{item.level <= 2 ? '•' : '○'}</span>
            <span className="toc-text">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOfContents;
