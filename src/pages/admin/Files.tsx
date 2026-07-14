import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import {
  App,
  Breadcrumb,
  Button,
  Image,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import {
  deleteAdminFile,
  type FileItem,
  fetchAdminFiles,
  uploadAdminFile,
} from '@/services/blog/api';
import AdminCard from '@/components/admin/AdminCard';

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']);
const isImageFile = (name: string) => IMAGE_EXTS.has(name.substring(name.lastIndexOf('.')).toLowerCase());

const FilesPage: React.FC = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [list, setList] = useState<FileItem[]>([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');

  const load = useCallback(async (
    nextPage = page,
    nextSize = size,
    nextKeyword = keyword,
  ) => {
    setLoading(true);
    try {
      const listRes = await fetchAdminFiles({
        page: nextPage,
        size: nextSize,
        keyword: nextKeyword || undefined,
      });
      setList(listRes.data.list || []);
      setTotal(listRes.data.total || 0);
      setPage(nextPage);
      setSize(nextSize);
    } finally {
      setLoading(false);
    }
  }, [keyword, page, size]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            {
              title: <Link to="/admin">首页</Link>,
            },
            {
              title: '文件管理',
            },
          ]}
        />
      </div>
      <AdminCard>
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                文件管理
              </Typography.Title>
              <Typography.Text type="secondary">
                统一管理上传文件、访问地址与静态资源引用。
              </Typography.Text>
            </div>
            <Space wrap>
              <Input.Search
                placeholder="按文件名搜索"
                allowClear
                onSearch={(value) => {
                  setKeyword(value);
                  void load(1, size, value);
                }}
                style={{ width: 260 }}
              />
              <Upload
                showUploadList={false}
                customRequest={async ({ file, onSuccess, onError }) => {
                  setUploading(true);
                  try {
                    const res = await uploadAdminFile(file as File);
                    const name = res.data?.url || (file as File).name;
                    message.success(`上传成功：${name}`);
                    onSuccess?.({}, new XMLHttpRequest());
                    await load(1, size, keyword);
                  } catch (error) {
                    onError?.(error instanceof Error ? error : new Error('上传失败'));
                  } finally {
                    setUploading(false);
                  }
                }}
              >
                <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
                  上传文件
                </Button>
              </Upload>
            </Space>
          </Space>

          <Table<FileItem>
            rowKey="id"
            loading={loading}
            dataSource={list}
            pagination={{
              current: page,
              pageSize: size,
              total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (value) => `共 ${value} 个文件`,
              onChange: (nextPage, nextSize) => void load(nextPage, nextSize, keyword),
            }}
            columns={[
              { title: 'ID', dataIndex: 'id', width: 130 },
              {
                title: '文件名',
                dataIndex: 'name',
                render: (value: string) => value.split('/').pop() || value,
              },
              {
                title: '访问地址',
                dataIndex: 'url',
                render: (value: string, record: FileItem) => (
                  isImageFile(record.name) ? (
                    <Image
                      src={value}
                      alt={record.name}
                      style={{ maxWidth: 120, maxHeight: 80, objectFit: 'contain', borderRadius: 4 }}
                      preview={{ mask: '预览' }}
                    />
                  ) : (
                    <Typography.Text copyable={{ text: value }}>
                      {value}
                    </Typography.Text>
                  )
                ),
              },
              {
                title: '大小',
                dataIndex: 'size',
                width: 120,
                render: (value) => <Tag>{(value / 1024).toFixed(1)} KB</Tag>,
              },
              {
                title: '创建时间',
                dataIndex: 'createTime',
                width: 180,
                render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
              },
              {
                title: '操作',
                width: 100,
                render: (_, record) => (
                  <Popconfirm
                    title="确认删除该文件？"
                    onConfirm={async () => {
                      await deleteAdminFile(record.id);
                      message.success('删除成功');
                      await load(page, size, keyword);
                    }}
                  >
                    <Button danger size="small" icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>
                ),
              },
            ]}
          />
        </Space>
      </AdminCard>
    </Space>
  );
};

export default FilesPage;
