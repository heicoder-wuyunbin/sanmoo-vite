import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import {
  App,
  Breadcrumb,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';
import {
  createPermission,
  deletePermission,
  fetchPermissions,
  updatePermission,
} from '@/services/blog/permission-api';
import type { PermissionItem } from '@/services/blog/types';
import AdminCard from '@/components/admin/AdminCard';

type PermForm = {
  permKey: string;
  name: string;
  module: string;
  type: 'api' | 'menu' | 'button';
  description?: string;
  sortOrder?: number;
  status?: number;
};

const PermissionsPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<PermForm>();
  const [filterModule, setFilterModule] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  const [list, setList] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PermissionItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPermissions({
        page: current,
        size: pageSize,
        keyword: searchText,
        module: filterModule || undefined,
        type: filterType || undefined,
      });
      setList(res.data.list || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [current, pageSize, searchText, filterModule, filterType]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (val: string) => {
    setCurrent(1);
    setSearchText(val);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editing) {
      setIsUpdating(true);
      try {
        await updatePermission(editing.id, values);
        message.success('更新成功');
        setModalOpen(false);
        loadData();
      } catch (e) {
        message.error('更新失败');
      } finally {
        setIsUpdating(false);
      }
    } else {
      setIsCreating(true);
      try {
        await createPermission(values);
        message.success('创建成功');
        setModalOpen(false);
        loadData();
      } catch (e) {
        message.error('创建失败');
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleOpenEdit = (record: PermissionItem) => {
    form.setFieldsValue({
      permKey: record.permKey,
      name: record.name,
      module: record.module,
      type: record.type,
      description: record.description,
      sortOrder: record.sortOrder,
      status: record.status,
    });
    setEditing(record);
    setModalOpen(true);
  };

  const handleOpenCreate = () => {
    form.resetFields();
    setEditing(null);
    setModalOpen(true);
  };

  const handleClose = () => {
    form.resetFields();
    setEditing(null);
    setModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await deletePermission(id);
      message.success('删除成功');
      loadData();
    } catch (e) {
      message.error('删除失败');
    } finally {
      setIsDeleting(null);
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'api':
        return 'blue';
      case 'menu':
        return 'green';
      case 'button':
        return 'orange';
      default:
        return 'default';
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            { title: <Link to="/admin">首页</Link> },
            { title: '权限列表' },
          ]}
        />
      </div>
      <AdminCard>
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                权限列表
              </Typography.Title>
              <Typography.Text type="secondary">
                查看和管理系统所有权限点，按模块和类型分类。
              </Typography.Text>
            </div>
            <Space wrap>
              <Input
                placeholder="搜索权限名"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={(e) => handleSearch(e.currentTarget.value)}
                style={{ width: 200 }}
                allowClear
              />
              <Select
                placeholder="按模块筛选"
                value={filterModule || undefined}
                onChange={(v) => {
                  setFilterModule(v || '');
                  setCurrent(1);
                }}
                style={{ width: 140 }}
                allowClear
                options={[
                  { value: 'article', label: '文章' },
                  { value: 'category', label: '分类' },
                  { value: 'tag', label: '标签' },
                  { value: 'topic', label: '专题' },
                  { value: 'user', label: '用户' },
                  { value: 'role', label: '角色' },
                  { value: 'permission', label: '权限' },
                  { value: 'setting', label: '设置' },
                  { value: 'dashboard', label: '仪表盘' },
                  { value: 'file', label: '文件' },
                  { value: 'link', label: '友链' },
                  { value: 'backup', label: '备份' },
                  { value: 'cache', label: '缓存' },
                  { value: 'mpuser', label: '小程序用户' },
                ]}
              />
              <Select
                placeholder="按类型筛选"
                value={filterType || undefined}
                onChange={(v) => {
                  setFilterType(v || '');
                  setCurrent(1);
                }}
                style={{ width: 120 }}
                allowClear
                options={[
                  { value: 'api', label: 'API' },
                  { value: 'menu', label: '菜单' },
                  { value: 'button', label: '按钮' },
                ]}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
                新建权限
              </Button>
            </Space>
          </Space>

          <Table<PermissionItem>
            rowKey="id"
            loading={loading}
            dataSource={list}
            pagination={{
              current,
              pageSize,
              total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (value) => `共 ${value} 条权限`,
              onChange: (page, size) => {
                setCurrent(page);
                setPageSize(size);
              },
            }}
            columns={[
              { title: 'ID', dataIndex: 'id', width: 80 },
              { title: '权限标识', dataIndex: 'permKey', width: 220 },
              { title: '权限名称', dataIndex: 'name', width: 160 },
              { title: '所属模块', dataIndex: 'module', width: 120 },
              {
                title: '类型',
                dataIndex: 'type',
                width: 100,
                render: (val) => <Tag color={typeColor(val)}>{val}</Tag>,
              },
              { title: '描述', dataIndex: 'description' },
              { title: '排序', dataIndex: 'sortOrder', width: 80 },
              {
                title: '状态',
                dataIndex: 'status',
                width: 80,
                render: (val) => (
                  <Tag color={val === 1 ? 'green' : 'red'}>{val === 1 ? '启用' : '禁用'}</Tag>
                ),
              },
              {
                title: '创建时间',
                dataIndex: 'createTime',
                width: 160,
                render: (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
              },
              {
                title: '操作',
                width: 160,
                fixed: 'right',
                render: (_, record) => (
                  <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)}>
                      编辑
                    </Button>
                    <Popconfirm title="确认删除该权限？" onConfirm={() => handleDelete(record.id)}>
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        loading={isDeleting === record.id}
                      >
                        删除
                      </Button>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
            scroll={{ x: 1200 }}
          />
        </Space>
      </AdminCard>

      <Modal
        title={editing ? '编辑权限' : '新建权限'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={handleClose}
        confirmLoading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="permKey" label="权限标识" rules={[{ required: true, message: '请输入权限标识' }]}>
            <Input placeholder="如：article:create" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="name" label="权限名称" rules={[{ required: true, message: '请输入权限名称' }]}>
            <Input placeholder="如：创建文章" />
          </Form.Item>
          <Form.Item name="module" label="所属模块" rules={[{ required: true, message: '请输入所属模块' }]}>
            <Input placeholder="如：article" />
          </Form.Item>
          <Form.Item name="type" label="权限类型" rules={[{ required: true, message: '请选择权限类型' }]}>
            <Select
              options={[
                { value: 'api', label: 'API' },
                { value: 'menu', label: '菜单' },
                { value: 'button', label: '按钮' },
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="权限描述" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <InputNumber style={{ width: '100%' }} placeholder="数字越小越靠前" />
          </Form.Item>
          {editing && (
            <Form.Item name="status" label="状态">
              <Select
                options={[
                  { value: 1, label: '启用' },
                  { value: 0, label: '禁用' },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Space>
  );
};

export default PermissionsPage;
