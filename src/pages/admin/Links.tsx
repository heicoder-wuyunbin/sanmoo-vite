import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Pagination,
  Popconfirm,
  Space,
  Switch,
  Table,
  Typography,
} from 'antd';
import React, { useCallback, useState } from 'react';
import { useCrudTable } from '@/hooks/useCrudTable';
import {
  batchDeleteLinks,
  type LinkItem,
  createLink,
  deleteLink,
  fetchLinks,
  updateLink,
} from '@/services/blog/api';
import { queryKeys } from '@/services/blog/queryKeys';
import AdminCard from '@/components/admin/AdminCard';

type LinkForm = {
  name: string;
  url: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
};

const LinksPage: React.FC = () => {
  const [form] = Form.useForm<LinkForm>();
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  const crud = useCrudTable<LinkItem, LinkForm, LinkForm>({
    queryKey: queryKeys.linkList({}),
    fetchList: fetchLinks,
    createItem: createLink,
    updateItem: updateLink,
    deleteItem: deleteLink,
    batchDelete: batchDeleteLinks,
    entityName: '友情链接',
  });

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (crud.editing) {
      crud.update({ id: crud.editing.id, data: values });
    } else {
      crud.create(values);
    }
  };

  const handleOpenEdit = (record: LinkItem) => {
    form.setFieldsValue({
      name: record.name,
      url: record.url,
      description: record.description,
      icon: record.icon,
      sortOrder: record.sortOrder,
      isActive: record.isActive,
    });
    crud.openEditModal(record);
  };

  const handleToggleActive = useCallback(async (record: LinkItem, checked: boolean) => {
    setTogglingIds((prev) => new Set(prev).add(record.id));
    try {
      await updateLink(record.id, {
        name: record.name,
        url: record.url,
        description: record.description,
        icon: record.icon,
        sortOrder: record.sortOrder,
        isActive: checked,
      });
      message.success(checked ? '已启用' : '已禁用');
      await crud.invalidate?.();
    } catch {
      message.error('操作失败，请重试');
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(record.id);
        return next;
      });
    }
  }, [crud]);

  const handleCloseModal = () => {
    form.resetFields();
    crud.closeModal();
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            { title: <Link to="/admin">首页</Link> },
            { title: '友情链接' },
          ]}
        />
      </div>
      <AdminCard>
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                友情链接
              </Typography.Title>
              <Typography.Text type="secondary">
                管理友情链接，展示合作伙伴与推荐站点。
              </Typography.Text>
            </div>
            <Space wrap>
              <Input
                placeholder="搜索链接名称或描述"
                prefix={<SearchOutlined />}
                value={crud.searchText}
                onChange={(e) => crud.setSearchText(e.target.value)}
                onPressEnter={(e) => crud.handleSearch(e.currentTarget.value)}
                style={{ width: 220 }}
                allowClear
              />
              <Popconfirm
                title={`确认批量删除 ${crud.selectedRowKeys.length} 个链接？`}
                disabled={crud.selectedRowKeys.length === 0}
                onConfirm={() => crud.batchRemove(crud.selectedRowKeys.map(Number) as number[])}
              >
                <Button danger disabled={crud.selectedRowKeys.length === 0} loading={crud.isBatchDeleting}>
                  批量删除
                </Button>
              </Popconfirm>
              <Button type="primary" icon={<PlusOutlined />} onClick={crud.openCreateModal}>
                新建链接
              </Button>
            </Space>
          </Space>

          <Table<LinkItem>
            rowKey="id"
            loading={crud.loading}
            dataSource={crud.list}
            rowSelection={{
              selectedRowKeys: crud.selectedRowKeys,
              onChange: (keys) => crud.setSelectedRowKeys(keys),
            }}
            pagination={false}
            columns={[
              { title: 'ID', dataIndex: 'id', width: 120 },
              { title: '名称', dataIndex: 'name' },
              { title: '链接', dataIndex: 'url', ellipsis: true },
              { title: '描述', dataIndex: 'description', ellipsis: true },
              {
                title: '状态',
                width: 140,
                render: (_, record) => (
                  <Switch
                    checked={record.isActive}
                    loading={togglingIds.has(record.id)}
                    onChange={(checked) => void handleToggleActive(record, checked)}
                  />
                ),
              },
              { title: '排序', dataIndex: 'sortOrder', width: 100 },
              {
                title: '操作',
                width: 160,
                render: (_, record) => (
                  <Space>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleOpenEdit(record)}
                    >
                      编辑
                    </Button>
                    <Popconfirm title="确认删除该链接？" onConfirm={() => crud.remove(record.id)}>
                      <Button danger size="small" icon={<DeleteOutlined />} loading={crud.isDeleting}>
                        删除
                      </Button>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />

          <Pagination
            current={crud.current}
            pageSize={crud.pageSize}
            total={crud.total}
            onChange={crud.handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(value) => `共 ${value} 个链接`}
            style={{ textAlign: 'right' }}
          />
        </Space>
      </AdminCard>

      <Modal
        title={crud.editing ? '编辑友情链接' : '新建友情链接'}
        open={crud.modalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={crud.isCreating || crud.isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="链接名称"
            rules={[{ required: true, message: '请输入链接名称' }]}
          >
            <Input placeholder="请输入链接名称" />
          </Form.Item>
          <Form.Item
            name="url"
            label="链接地址"
            rules={[{ required: true, message: '请输入链接地址' }]}
          >
            <Input placeholder="请输入链接地址" />
          </Form.Item>
          <Form.Item name="description" label="链接描述">
            <Input.TextArea placeholder="请输入链接描述" rows={3} />
          </Form.Item>
          <Form.Item name="icon" label="图标URL">
            <Input placeholder="请输入图标URL（可选）" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序值" initialValue={0}>
            <InputNumber style={{ width: '100%' }} placeholder="排序值" />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="是否启用"
            initialValue={true}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default LinksPage;
