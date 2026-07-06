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
  Modal,
  Pagination,
  Popconfirm,
  Space,
  Table,
  Typography,
} from 'antd';
import React from 'react';
import { useCrudTable } from '@/hooks/useCrudTable';
import {
  batchDeleteCategories,
  type CategoryItem,
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '@/services/blog/api';
import { queryKeys } from '@/services/blog/queryKeys';
import AdminCard from '@/components/admin/AdminCard';

type CategoryForm = { name: string };

const CategoriesPage: React.FC = () => {
  const [form] = Form.useForm<CategoryForm>();

  const crud = useCrudTable<CategoryItem, string, string>({
    queryKey: queryKeys.categoryList({}),
    fetchList: (params) => fetchCategories(true, params),
    createItem: (name) => createCategory(name),
    updateItem: (id, name) => updateCategory(id, name),
    deleteItem: deleteCategory,
    batchDelete: batchDeleteCategories,
    entityName: '分类',
  });

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (crud.editing) {
      crud.update({ id: crud.editing.id, data: values.name });
    } else {
      crud.create(values.name);
    }
  };

  const handleOpenEdit = (record: CategoryItem) => {
    form.setFieldsValue({ name: record.name });
    crud.openEditModal(record);
  };

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
            { title: '分类管理' },
          ]}
        />
      </div>
      <AdminCard>
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                分类管理
              </Typography.Title>
              <Typography.Text type="secondary">
                维护内容目录结构，强化主题分组与文章组织。
              </Typography.Text>
            </div>
            <Space wrap>
              <Input
                placeholder="搜索分类名称"
                prefix={<SearchOutlined />}
                value={crud.searchText}
                onChange={(e) => crud.setSearchText(e.target.value)}
                onPressEnter={(e) => crud.handleSearch(e.currentTarget.value)}
                style={{ width: 220 }}
                allowClear
              />
              <Popconfirm
                title={`确认批量删除 ${crud.selectedRowKeys.length} 个分类？`}
                disabled={crud.selectedRowKeys.length === 0}
                onConfirm={() =>
                  crud.batchRemove(crud.selectedRowKeys.map(Number) as number[])
                }
              >
                <Button
                  danger
                  disabled={crud.selectedRowKeys.length === 0}
                  loading={crud.isBatchDeleting}
                >
                  批量删除
                </Button>
              </Popconfirm>
              <Button type="primary" icon={<PlusOutlined />} onClick={crud.openCreateModal}>
                新建分类
              </Button>
            </Space>
          </Space>

          <Table<CategoryItem>
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
              { title: '文章数', dataIndex: 'articleCount', width: 140 },
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
                    <Popconfirm title="确认删除该分类？" onConfirm={() => crud.remove(record.id)}>
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        loading={crud.isDeleting}
                      >
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
            showTotal={(value) => `共 ${value} 个分类`}
            style={{ textAlign: 'right' }}
          />
        </Space>
      </AdminCard>

      <Modal
        title={crud.editing ? '编辑分类' : '新建分类'}
        open={crud.modalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={crud.isCreating || crud.isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default CategoriesPage;
