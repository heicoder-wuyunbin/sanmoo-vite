/**
 * 文章元信息标签组
 * 统一渲染日期、阅读量、分类、置顶、标签等 Tag 组件。
 */
import { ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { Space, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

const TAG_COLORS = [
  { bg: '#FFF0F6', border: '#FFB3C1', text: '#EB2F96' },
  { bg: '#F9F0FF', border: '#D3ADF7', text: '#722ED1' },
  { bg: '#E6FFFB', border: '#87E8DE', text: '#13C2C2' },
  { bg: '#FFF7E6', border: '#FFD666', text: '#FA8C16' },
  { bg: '#F6FFED', border: '#B7EB8F', text: '#52C41A' },
  { bg: '#E6F7FF', border: '#91D5FF', text: '#1890FF' },
];

const pillStyle: React.CSSProperties = {
  borderRadius: 999,
  paddingInline: 10,
  lineHeight: '26px',
  marginInlineEnd: 0,
};

interface MetaInfo {
  createTime: string;
  readNum: number;
  categoryName?: string;
  isTop?: boolean;
  tags: { id: number; name: string }[];
}

interface Props {
  meta: MetaInfo;
  maxTags?: number;
}

const ArticleMetaTags: React.FC<Props> = ({ meta, maxTags = 4 }) => (
  <Space wrap size={[8, 8]}>
    <Tag icon={<ClockCircleOutlined aria-hidden="true" />} style={{
      ...pillStyle, backgroundColor: '#E6F7FF', borderColor: '#91D5FF', color: '#1890FF',
    }}>
      {dayjs(meta.createTime).format('YYYY-MM-DD')}
    </Tag>
    <Tag icon={<EyeOutlined aria-hidden="true" />} style={{
      ...pillStyle, backgroundColor: '#F6FFED', borderColor: '#B7EB8F', color: '#52C41A',
    }}>
      阅读 {meta.readNum}
    </Tag>
    {meta.categoryName && (
      <Tag style={{ ...pillStyle, backgroundColor: '#FFF7E6', borderColor: '#FFD666', color: '#FA8C16' }}>
        {meta.categoryName}
      </Tag>
    )}
    {meta.isTop && (
      <Tag style={{ ...pillStyle, backgroundColor: '#FFF1B8', borderColor: '#FFE066', color: '#FA8C16' }}>
        置顶
      </Tag>
    )}
    {meta.tags?.slice(0, maxTags).map((tag, index) => {
      const color = TAG_COLORS[index % TAG_COLORS.length];
      return (
        <Tag key={`${meta.createTime}-${tag.id}`} style={{
          ...pillStyle, backgroundColor: color.bg, borderColor: color.border, color: color.text,
        }}>
          {tag.name}
        </Tag>
      );
    })}
  </Space>
);

export { pillStyle as metaPillStyle };
export default ArticleMetaTags;
