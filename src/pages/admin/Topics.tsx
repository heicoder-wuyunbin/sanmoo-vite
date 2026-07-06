import {
  DeleteOutlined,
  EditOutlined,
  HolderOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Form,
  Image,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  batchDeleteTopics,
  createTopic,
  deleteTopic,
  fetchTopics,
  fetchTopicArticles,
  fetchPublishedArticleOptions,
  type TopicItem,
  type ArticleOption,
  unwrapList,
  updateTopic,
} from '@/services/blog/api';
import { queryKeys } from '@/services/blog/queryKeys';
import AdminCard from '@/components/admin/AdminCard';

// ---------- 可拖拽排序的文章条目 ----------

interface SortableArticleItemProps {
  id: number;
  title: string;
  onRemove: (id: number) => void;
}

const SortableArticleItem: React.FC<SortableArticleItemProps> = ({ id, title, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    marginBottom: 4,
    background: isDragging ? '#e6f4ff' : '#fafafa',
    borderRadius: 6,
    border: '1px solid #f0f0f0',
    cursor: 'grab',
    zIndex: isDragging ? 1 : undefined,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <HolderOutlined style={{ color: '#999', flexShrink: 0 }} />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {title}
      </span>
      <Button
        type="text"
        size="small"
        danger
        icon={<MinusCircleOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        style={{ flexShrink: 0 }}
      />
    </div>
  );
};

// ---------- 可拖拽文章列表 ----------

interface DraggableArticleListProps {
  articleIds: number[];
  articleOptions: ArticleOption[];
  onReorder: (ids: number[]) => void;
}

const DraggableArticleList: React.FC<DraggableArticleListProps> = ({
  articleIds,
  articleOptions,
  onReorder,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = articleIds.indexOf(active.id as number);
      const newIndex = articleIds.indexOf(over.id as number);
      onReorder(arrayMove(articleIds, oldIndex, newIndex));
    }
  };

  const getTitle = (id: number) => {
    const opt = articleOptions.find((o) => o.id === id);
    return opt ? opt.title : `文章 #${id}`;
  };

  const handleRemove = (id: number) => {
    onReorder(articleIds.filter((aid) => aid !== id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={articleIds} strategy={verticalListSortingStrategy}>
        <div style={{ maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
          {articleIds.length === 0 ? (
            <Typography.Text type="secondary" style={{ padding: '8px 0', display: 'block' }}>
              暂未关联文章
            </Typography.Text>
          ) : (
            articleIds.map((id) => (
              <SortableArticleItem key={id} id={id} title={getTitle(id)} onRemove={handleRemove} />
            ))
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
};

// ---------- 专题管理页面 ----------

const TopicsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TopicItem>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm<{ name: string; description: string; coverImage: string }>();
  const [searchText, setSearchText] = useState('');
  const [selectedArticleIds, setSelectedArticleIds] = useState<number[]>([]);
  const [articleOptions, setArticleOptions] = useState<ArticleOption[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const topicsQuery = useQuery({
    queryKey: queryKeys.topics(),
    queryFn: () => fetchTopics().then((res) => unwrapList(res.data)),
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: queryKeys.topics() });

  const createMutation = useMutation({
    mutationFn: createTopic,
    onSuccess: () => { message.success('创建成功'); setOpen(false); setEditing(undefined); form.resetFields(); setSelectedArticleIds([]); invalidate(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateTopic>[1] }) => updateTopic(id, data),
    onSuccess: () => { message.success('更新成功'); setOpen(false); setEditing(undefined); form.resetFields(); setSelectedArticleIds([]); invalidate(); },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => { message.success('删除成功'); invalidate(); },
  });
  const batchDeleteMutation = useMutation({
    mutationFn: batchDeleteTopics,
    onSuccess: () => { message.success('批量删除成功'); setSelectedRowKeys([]); invalidate(); },
  });

  const allList = topicsQuery.data || [];
  const loading = topicsQuery.isLoading;
  const filtered = searchText
    ? allList.filter((item) => item.title.toLowerCase().includes(searchText.toLowerCase()))
    : allList;
  const list = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openModal = async (record?: TopicItem) => {
    try {
      const [articlesRes] = await Promise.all([fetchPublishedArticleOptions()]);
      const options = articlesRes.data?.list || [];
      setArticleOptions(options);

      if (record) {
        setEditing(record);
        form.setFieldsValue({
          name: record.title,
          description: record.description || '',
          coverImage: record.cover || '',
        });
        const res = await fetchTopicArticles(record.id);
        setSelectedArticleIds(res.data.articleIds || []);
      } else {
        setEditing(undefined);
        form.resetFields();
        setSelectedArticleIds([]);
      }
      setOpen(true);
    } catch {
      message.error('加载文章选项失败');
    }
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    const payload = { ...values, articleIds: selectedArticleIds };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // 已选文章对应的 option（用于下拉排除）
  const selectedOptionIds = new Set(selectedArticleIds);
  const availableOptions = articleOptions.filter((opt) => !selectedOptionIds.has(opt.id));

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            {
              title: <Link to="/admin">首页</Link>,
            },
            {
              title: '专题管理',
            },
          ]}
        />
      </div>
      <AdminCard>
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                专题管理
              </Typography.Title>
              <Typography.Text type="secondary">
                创建和维护内容专题，组织系列文章形成知识体系。
              </Typography.Text>
            </div>
            <Space wrap>
              <Input
                placeholder="搜索专题名称"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
                style={{ width: 220 }}
                allowClear
              />
              <Popconfirm
                title={`确认批量删除 ${selectedRowKeys.length} 个专题？`}
                disabled={selectedRowKeys.length === 0}
                onConfirm={() => batchDeleteMutation.mutate(selectedRowKeys.map(Number) as number[])}
              >
                <Button danger disabled={selectedRowKeys.length === 0} loading={batchDeleteMutation.isPending}>
                  批量删除
                </Button>
              </Popconfirm>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openModal()}
              >
                新建专题
              </Button>
            </Space>
          </Space>

          <Table<TopicItem>
            rowKey="id"
            loading={loading}
            dataSource={list}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
            }}
            pagination={{
              current: page,
              pageSize,
              total: filtered.length,
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (p, s) => { setPage(p); setPageSize(s); },
            }}
            columns={[
              { title: 'ID', dataIndex: 'id', width: 80 },
              {
                title: '封面',
                dataIndex: 'cover',
                width: 80,
                render: (cover: string) =>
                  cover ? (
                    <Image src={cover} width={48} height={48} style={{ borderRadius: 6, objectFit: 'cover' }} />
                  ) : (
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 6,
                        background: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#bbb',
                        fontSize: 12,
                      }}
                    >
                      无
                    </div>
                  ),
              },
              { title: '名称', dataIndex: 'title' },
              {
                title: '描述',
                dataIndex: 'description',
                ellipsis: true,
                render: (desc: string) => desc || '-',
              },
              { title: '文章数', dataIndex: 'articleCount', width: 100 },
              {
                title: '操作',
                width: 160,
                render: (_, record) => (
                  <Space>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => openModal(record)}
                    >
                      编辑
                    </Button>
                    <Popconfirm
                      title="确认删除该专题？"
                      disabled={record.articleCount > 0}
                      onConfirm={() => deleteMutation.mutate(record.id)}
                    >
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        disabled={record.articleCount > 0}
                        loading={deleteMutation.isPending}
                        title={record.articleCount > 0 ? '该专题有关联文章，无法删除' : '删除'}
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
        title={editing ? '编辑专题' : '新建专题'}
        open={open}
        onOk={onSubmit}
        onCancel={() => {
          setOpen(false);
          setEditing(undefined);
        }}
        width={640}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="专题名称"
            rules={[{ required: true, message: '请输入专题名称' }]}
          >
            <Input placeholder="请输入专题名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="专题描述"
          >
            <Input.TextArea placeholder="请输入专题描述（可选）" rows={3} />
          </Form.Item>
          <Form.Item
            name="coverImage"
            label="封面图片地址"
          >
            <Input placeholder="请输入封面图片 URL（可选）" />
          </Form.Item>
          <Form.Item label="关联文章">
            <DraggableArticleList
              articleIds={selectedArticleIds}
              articleOptions={articleOptions}
              onReorder={setSelectedArticleIds}
            />
            <Select
              style={{ marginTop: 8 }}
              placeholder="添加文章（可多选）"
              mode="multiple"
              value={undefined}
              onChange={(val: number[]) => {
                if (val && val.length > 0) {
                  setSelectedArticleIds((prev) => {
                    const currentSet = new Set(prev);
                    const newIds = val.filter((v) => !currentSet.has(v));
                    if (newIds.length > 0) {
                      return [...prev, ...newIds];
                    }
                    return prev;
                  });
                }
              }}
              options={availableOptions.map((opt) => ({
                value: opt.id,
                label: `${opt.title} (ID: ${opt.id})`,
              }))}
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              showSearch
              loading={false}
              disabled={availableOptions.length === 0}
              maxTagCount="responsive"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default TopicsPage;