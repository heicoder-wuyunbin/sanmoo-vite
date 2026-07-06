import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
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
  Tree,
  Typography,
  Select,
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useState } from 'react';
import { useCrudTable } from '@/hooks/useCrudTable';
import {
  createRole,
  deleteRole,
  fetchRolePermissions,
  fetchRoles,
  assignRolePermissions,
  updateRole,
} from '@/services/blog/role-api';
import { fetchPermissionTree } from '@/services/blog/permission-api';
import type { PermissionTreeNode, RoleItem } from '@/services/blog/types';
import { queryKeys } from '@/services/blog/queryKeys';
import AdminCard from '@/components/admin/AdminCard';

type RoleForm = { name: string; description?: string; sortOrder?: number };

const RolesPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<RoleForm>();
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<RoleItem | null>(null);
  const [checkedPermKeys, setCheckedPermKeys] = useState<string[]>([]);
  const [permTreeData, setPermTreeData] = useState<DataNode[]>([]);
  const [savingPerms, setSavingPerms] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const crud = useCrudTable<RoleItem, RoleForm, Partial<RoleForm>>({
    queryKey: queryKeys.roleList({}),
    fetchList: (params) => fetchRoles(params),
    createItem: (data) => createRole(data),
    updateItem: (id, data) => updateRole(id, data),
    deleteItem: deleteRole,
    entityName: '角色',
  });

  const loadPermTree = useCallback(async () => {
    try {
      const res = await fetchPermissionTree();
      const tree = res.data.list || [];
      const data: DataNode[] = tree.map((mod: PermissionTreeNode) => ({
        key: mod.module,
        title: mod.moduleName || mod.module,
        selectable: false,
        children: mod.children.map((p) => ({
          key: p.permKey,
          title: (
            <Space size={8}>
              <span>{p.name}</span>
              <Tag color={p.type === 'api' ? 'blue' : p.type === 'menu' ? 'green' : 'orange'}>
                {p.type}
              </Tag>
            </Space>
          ),
        })),
      }));
      setPermTreeData(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleOpenPermModal = async (record: RoleItem) => {
    setCurrentRole(record);
    setPermModalOpen(true);
    if (permTreeData.length === 0) {
      await loadPermTree();
    }
    try {
      const res = await fetchRolePermissions(record.id);
      setCheckedPermKeys(res.data.permKeys || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePerms = async () => {
    if (!currentRole) return;
    setSavingPerms(true);
    try {
      await assignRolePermissions(currentRole.id, checkedPermKeys);
      message.success('权限分配成功');
      setPermModalOpen(false);
      await crud.invalidate?.();
    } catch (e) {
      message.error('权限分配失败');
    } finally {
      setSavingPerms(false);
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (crud.editing) {
      crud.update({ id: crud.editing.id, data: values });
    } else {
      crud.create(values);
    }
  };

  const handleOpenEdit = useCallback(
    (record: RoleItem) => {
      form.setFieldsValue({
        name: record.name,
        description: record.description,
        sortOrder: record.sortOrder,
      });
      crud.openEditModal(record);
    },
    [form, crud],
  );

  const handleCloseModal = () => {
    form.resetFields();
    crud.closeModal();
  };

  const isAdminRole = (name: string) => name === 'admin';

  const filteredPermTreeData = useMemo(() => {
    if (filterType === 'all') return permTreeData;
    return permTreeData.map((node) => ({
      ...node,
      children: (node.children as DataNode[])?.filter(() => true),
    }));
  }, [permTreeData, filterType]);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            { title: <Link to="/admin">首页</Link> },
            { title: '角色管理' },
          ]}
        />
      </div>
      <AdminCard>
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                角色管理
              </Typography.Title>
              <Typography.Text type="secondary">
                管理系统角色与权限分配，支持多角色与细粒度权限控制。
              </Typography.Text>
            </div>
            <Space wrap>
              <Input
                placeholder="搜索角色名"
                prefix={<SearchOutlined />}
                value={crud.searchText}
                onChange={(e) => crud.setSearchText(e.target.value)}
                onPressEnter={(e) => crud.handleSearch(e.currentTarget.value)}
                style={{ width: 220 }}
                allowClear
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={crud.openCreateModal}>
                新建角色
              </Button>
            </Space>
          </Space>

          <Table<RoleItem>
            rowKey="id"
            loading={crud.loading}
            dataSource={crud.list}
            pagination={{
              current: crud.current,
              pageSize: crud.pageSize,
              total: crud.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (value) => `共 ${value} 个角色`,
              onChange: crud.handlePageChange,
            }}
            columns={[
              { title: 'ID', dataIndex: 'id', width: 100 },
              { title: '角色名', dataIndex: 'name' },
              { title: '描述', dataIndex: 'description' },
              {
                title: '状态',
                width: 100,
                dataIndex: 'status',
                render: (val) => (
                  <Tag color={val === 1 ? 'green' : 'red'}>{val === 1 ? '启用' : '禁用'}</Tag>
                ),
              },
              { title: '排序', dataIndex: 'sortOrder', width: 80 },
              {
                title: '创建时间',
                dataIndex: 'createTime',
                render: (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
              },
              {
                title: '操作',
                width: 280,
                render: (_, record) => (
                  <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)}>
                      编辑
                    </Button>
                    <Button
                      size="small"
                      icon={<SettingOutlined />}
                      type="primary"
                      ghost
                      onClick={() => handleOpenPermModal(record)}
                    >
                      分配权限
                    </Button>
                    <Popconfirm
                      title="确认删除该角色？"
                      disabled={isAdminRole(record.name)}
                      onConfirm={() => crud.remove(record.id)}
                    >
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        loading={crud.isDeleting}
                        disabled={isAdminRole(record.name)}
                      >
                        删除
                      </Button>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </Space>
      </AdminCard>

      <Modal
        title={crud.editing ? '编辑角色' : '新建角色'}
        open={crud.modalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={crud.isCreating || crud.isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="角色名" rules={[{ required: true, message: '请输入角色名' }]}>
            <Input placeholder="请输入角色名，如 editor" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="角色描述" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <Input type="number" placeholder="数字越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`分配权限 - ${currentRole?.name || ''}`}
        open={permModalOpen}
        onOk={handleSavePerms}
        onCancel={() => setPermModalOpen(false)}
        confirmLoading={savingPerms}
        width={720}
        okText="保存权限"
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Space>
            <span>类型筛选：</span>
            <Select
              size="small"
              value={filterType}
              onChange={setFilterType}
              style={{ width: 120 }}
              options={[
                { value: 'all', label: '全部' },
                { value: 'api', label: 'API' },
                { value: 'menu', label: '菜单' },
                { value: 'button', label: '按钮' },
              ]}
            />
          </Space>
          <div
            style={{
              maxHeight: 480,
              overflowY: 'auto',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              padding: 12,
            }}
          >
            <Tree
              checkable
              treeData={filteredPermTreeData}
              checkedKeys={checkedPermKeys}
              onCheck={(keys) => setCheckedPermKeys(keys as string[])}
              defaultExpandAll
            />
          </div>
          <Typography.Text type="secondary">
            已选择 {checkedPermKeys.length} 项权限
          </Typography.Text>
        </Space>
      </Modal>
    </Space>
  );
};

export default RolesPage;
