import { DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { ArticleItem } from '@/services/blog/api';

type ArticleListFilters = {
  keyword?: string;
  categoryId?: number;
  tagId?: number;
  isPublished?: number;
};

type ArticleListProps = {
  loading: boolean;
  list: ArticleItem[];
  page: number;
  size: number;
  total: number;
  selectedRowKeys: React.Key[];
  onRefresh: (page?: number, size?: number, filters?: ArticleListFilters) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => Promise<void>;
  onSelectChange: (keys: React.Key[]) => void;
  onPublish: (id: number) => Promise<void>;
  onTop: (id: number) => Promise<void>;
  onRefreshSlug: (id: number) => Promise<void>;
};

const ArticleList: React.FC<ArticleListProps> = ({
  loading,
  list,
  page,
  size,
  total,
  selectedRowKeys,
  onRefresh,
  onEdit,
  onDelete,
  onSelectChange,
  onPublish,
  onTop,
  onRefreshSlug,
}) => {
  return (
    <Table<ArticleItem>
      rowKey="id"
      loading={loading}
      dataSource={list}
      rowSelection={{
        selectedRowKeys,
        onChange: (keys) => onSelectChange(keys),
      }}
      pagination={{
        current: page,
        pageSize: size,
        total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 篇文章`,
        onChange: (nextPage, nextSize) =>
          onRefresh(nextPage, nextSize),
      }}
      scroll={{ x: 'max-content' }}
      columns={[
        { title: 'ID', dataIndex: 'id', width: 100, fixed: 'left' },
        { title: '标题', dataIndex: 'title', ellipsis: true, width: 300 },
        {
          title: 'Slug',
          dataIndex: 'slug',
          width: 200,
          ellipsis: true,
          render: (v: string) => (
            <Tooltip title={v}>
              <span style={{ color: '#888', fontSize: '12px' }}>{v || '-'}</span>
            </Tooltip>
          ),
        },
        {
          title: '分类',
          dataIndex: 'categoryName',
          width: 140,
          render: (v) => v || '-',
        },
        {
          title: '标签',
          dataIndex: 'tags',
          width: 200,
          render: (value: Array<{ id: number; name: string }>) =>
            value?.map((item, index) => (
              <Tag key={`${item.id ?? item.name ?? 'tag'}-${index}`}>{item.name}</Tag>
            )) || '-',
        },
        { title: '阅读量', dataIndex: 'readNum', width: 100 },
        {
          title: '状态',
          width: 160,
          render: (_, record) => (
            <Space>
              {record.isPublished ? (
                <Tag color="green">已发布</Tag>
              ) : (
                <Tag>草稿</Tag>
              )}
              {record.isTop ? <Tag color="gold">置顶</Tag> : null}
            </Space>
          ),
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          width: 180,
          render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm'),
        },
        {
          title: '操作',
          width: 340,
          fixed: 'right',
          render: (_, record) => (
            <Space size="small">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(record.id)}
              >
                编辑
              </Button>
              <Button
                size="small"
                type={record.isPublished ? 'default' : 'primary'}
                onClick={async () => {
                  await onPublish(record.id);
                  onRefresh(page, size);
                }}
              >
                {record.isPublished ? '隐藏' : '发布'}
              </Button>
              <Button
                size="small"
                type={record.isTop ? 'primary' : 'default'}
                onClick={async () => {
                  await onTop(record.id);
                  onRefresh(page, size);
                }}
              >
                {record.isTop ? '取消置顶' : '置顶'}
              </Button>
              <Popconfirm
                title={record.isPublished ? '请先隐藏文章后再删除' : '确认删除该文章？'}
                disabled={record.isPublished}
                onConfirm={async () => {
                  await onDelete(record.id);
                  onRefresh(page, size);
                }}
              >
                <Button danger size="small" icon={<DeleteOutlined />} disabled={record.isPublished}>
                  删除
                </Button>
              </Popconfirm>
              <Tooltip title="刷新Slug">
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={async () => {
                    await onRefreshSlug(record.id);
                    onRefresh(page, size);
                  }}
                />
              </Tooltip>
            </Space>
          ),
        },
      ]}
    />
  );
};

export default ArticleList;