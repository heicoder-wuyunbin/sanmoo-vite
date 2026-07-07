import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import {
  App,
  Breadcrumb,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { useCrudTable } from '@/hooks/useCrudTable';
import {
  batchDeleteUsers,
  createUser,
  deleteUser,
  downloadUsersCSV,
  fetchUsers,
  toggleUserStatus,
  type UserItem,
  updateUser,
  updateUserPassword,
  fetchAllRoles,
  assignUserRoles,
  type RoleItem,
} from '@/services/blog/api';
import { queryKeys } from '@/services/blog/queryKeys';
import AdminCard from '@/components/admin/AdminCard';

type UserForm = { username: string; password?: string; email?: string };

const UsersPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<UserForm>();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [allRoles, setAllRoles] = useState<RoleItem[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);

  const crud = useCrudTable<UserItem, { username: string; password: string; email?: string }, Partial<UserForm>>({
    queryKey: queryKeys.userList({}),
    fetchList: (params) => fetchUsers(params),
    createItem: (data) => createUser(data),
    updateItem: (id, data) => updateUser(id, data),
    deleteItem: deleteUser,
    batchDelete: batchDeleteUsers,
    entityName: '用户',
  });

  useEffect(() => {
    fetchAllRoles()
      .then((res) => setAllRoles(res.data.list || []))
      .catch((e) => console.error('加载角色列表失败', e));
  }, []);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (crud.editing) {
      if (values.password) {
        await updateUserPassword(crud.editing.id, values.password);
      }
      const payload: { username?: string; email?: string } = {};
      if (values.username !== crud.editing.username) {
        payload.username = values.username;
      }
      if ((values.email || '') !== (crud.editing.email || '')) {
        payload.email = values.email || '';
      }
      if (Object.keys(payload).length > 0) {
        crud.update({ id: crud.editing.id, data: payload });
      } else {
        message.success('更新成功');
        crud.closeModal();
      }
    } else {
      crud.create({
        username: values.username,
        password: values.password || '',
        email: values.email || '',
      });
    }
  };

  const handleOpenEdit = useCallback((record: UserItem) => {
    form.setFieldsValue({
      username: record.username,
      password: '',
      email: record.email,
    });
    crud.openEditModal(record);
  }, [form, crud]);

  const handleCloseModal = () => {
    form.resetFields();
    crud.closeModal();
  };

  const handleToggleStatus = async (record: UserItem) => {
    const isEnabled = record.status !== 'DISABLED';
    try {
      await toggleUserStatus(record.id);
      message.success(isEnabled ? '用户已禁用' : '用户已启用');
      await crud.invalidate?.();
    } catch (error: unknown) {
      const errMsg =
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        typeof (error as { data?: { errorMessage?: string } }).data?.errorMessage === 'string'
          ? (error as { data?: { errorMessage?: string } }).data?.errorMessage
          : '操作失败';
      message.error(errMsg);
    }
  };

  const handleOpenRoleModal = (record: UserItem) => {
    setCurrentUser(record);
    setSelectedRoleIds(record.roleId ? [record.roleId] : []);
    setRoleModalOpen(true);
  };

  const handleSaveRoles = async () => {
    if (!currentUser) return;
    setSavingRoles(true);
    try {
      await assignUserRoles(currentUser.id, selectedRoleIds);
      message.success('角色分配成功');
      setRoleModalOpen(false);
      await crud.invalidate?.();
    } catch (e) {
      message.error('角色分配失败');
    } finally {
      setSavingRoles(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            {
              title: <Link to="/admin">首页</Link>,
            },
            {
              title: '用户管理',
            },
          ]}
        />
      </div>
      <AdminCard>
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                用户管理
              </Typography.Title>
              <Typography.Text type="secondary">
                统一管理后台账号、启用状态与基础安全信息。
              </Typography.Text>
            </div>
            <Space wrap>
              <Input
                placeholder="搜索用户名"
                prefix={<SearchOutlined />}
                value={crud.searchText}
                onChange={(e) => crud.setSearchText(e.target.value)}
                onPressEnter={(e) => crud.handleSearch(e.currentTarget.value)}
                style={{ width: 220 }}
                allowClear
              />
              <Popconfirm
                title={`确认批量删除 ${crud.selectedRowKeys.length} 个用户？`}
                disabled={crud.selectedRowKeys.length === 0}
                onConfirm={() => crud.batchRemove(crud.selectedRowKeys.map(Number) as number[])}
              >
                <Button danger disabled={crud.selectedRowKeys.length === 0} loading={crud.isBatchDeleting}>
                  批量删除
                </Button>
              </Popconfirm>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => downloadUsersCSV(crud.searchText)}
              >
                导出CSV
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={crud.openCreateModal}
              >
                新建用户
              </Button>
            </Space>
          </Space>

          <Table<UserItem>
            rowKey="id"
            loading={crud.loading}
            dataSource={crud.list}
            rowSelection={{
              selectedRowKeys: crud.selectedRowKeys,
              onChange: (keys) => crud.setSelectedRowKeys(keys),
            }}
            pagination={{
              current: crud.current,
              pageSize: crud.pageSize,
              total: crud.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (value) => `共 ${value} 个用户`,
              onChange: crud.handlePageChange,
            }}
            columns={[
              { title: 'ID', dataIndex: 'id', width: 120 },
              { title: '用户名', dataIndex: 'username' },
              { title: '邮箱', dataIndex: 'email' },
              {
                title: '角色',
                dataIndex: 'roleName',
                width: 120,
                render: (val) => val ? <Tag color="blue">{val}</Tag> : <Tag color="default">未分配</Tag>,
              },
              {
                title: '状态',
                width: 100,
                render: (_, record) => {
                  const isEnabled = record.status !== 'DISABLED';
                  return <Tag color={isEnabled ? 'green' : 'red'}>{isEnabled ? '启用' : '禁用'}</Tag>;
                },
              },
              {
                title: '创建时间',
                dataIndex: 'createTime',
                render: (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
              },
              {
                title: '更新时间',
                dataIndex: 'updateTime',
                render: (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
              },
              {
                title: '操作',
                width: 320,
                render: (_, record) => {
                  const isEnabled = record.status !== 'DISABLED';
                  return (
                    <Space>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEdit(record)}
                      >
                        编辑
                      </Button>
                      <Button
                        size="small"
                        icon={<TeamOutlined />}
                        type="primary"
                        ghost
                        onClick={() => handleOpenRoleModal(record)}
                      >
                        分配角色
                      </Button>
                      <Button
                        size="small"
                        icon={isEnabled ? <CloseOutlined /> : <CheckOutlined />}
                        type={isEnabled ? 'default' : 'primary'}
                        disabled={record.roleName === 'admin'}
                        onClick={() => void handleToggleStatus(record)}
                      >
                        {isEnabled ? '禁用' : '启用'}
                      </Button>
                      <Popconfirm
                        title="确认删除该用户？"
                        onConfirm={() => crud.remove(record.id)}
                      >
                        <Button danger size="small" icon={<DeleteOutlined />} loading={crud.isDeleting}>
                          删除
                        </Button>
                      </Popconfirm>
                    </Space>
                  );
                },
              },
            ]}
          />
        </Space>
      </AdminCard>

      <Modal
        title={crud.editing ? '编辑用户' : '新建用户'}
        open={crud.modalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={crud.isCreating || crud.isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label={crud.editing ? '密码（留空不修改）' : '密码'}
            rules={!crud.editing ? [{ required: true, message: '请输入密码' }] : []}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" tooltip="用于接收登录验证码等邮件">
            <Input placeholder="例如: admin@example.com" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`分配角色 - ${currentUser?.username || ''}`}
        open={roleModalOpen}
        onOk={handleSaveRoles}
        onCancel={() => setRoleModalOpen(false)}
        confirmLoading={savingRoles}
        okText="保存角色"
      >
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="请选择角色"
          value={selectedRoleIds}
          onChange={setSelectedRoleIds}
          options={allRoles.map((r) => ({ value: r.id, label: r.name }))}
        />
      </Modal>
    </Space>
  );
};

export default UsersPage;
