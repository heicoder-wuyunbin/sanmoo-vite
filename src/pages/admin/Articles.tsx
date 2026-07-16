import { PlusOutlined, ReloadOutlined, SearchOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
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
  theme as antTheme,
  Typography,
  Upload,
  Alert,
  Checkbox,
  Tag,
} from 'antd';
import React, { useEffect, useState } from 'react';
import AdminCard from '@/components/admin/AdminCard';
import {
  type ArticleDetail,
  type ArticleItem,
  type BlogSettings,
  batchDeleteArticles,
  batchRefreshArticleSlugs,
  batchUpdateArticleStatus,
  type CategoryItem,
  createArticle,
  deleteArticle,
  exportArticlesCSV,
  fetchAdminArticleDetail,
  fetchArticles,
  fetchCategories,
  fetchSettings,
  fetchTags,
  fetchTopics,
  refreshArticleSlug,
  type TagItem,
  type TopicItem,
  unwrapList,
  updateArticle,
  updateArticleStatus,
} from '@/services/blog/api';
import ArticleList from './components/ArticleList';
import ArticleEditorDrawer from './components/ArticleEditorDrawer';
import ArticleImportProgress from './components/ArticleImportProgress';
import type { ArticleImportItem } from '@/utils/articleImporter';

type FormValues = {
  title: string;
  titleImage?: string;
  description: string;
  content: string;
  categoryId?: number;
  tagIds?: number[];
  topicIds?: number[];
  isTop?: boolean;
  isPublished?: boolean;
};

const ArticlesPage: React.FC = () => {
  const { message, modal } = App.useApp();
  const { token } = antTheme.useToken();
  const [form] = Form.useForm<FormValues>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ArticleDetail>();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [draftState, setDraftState] = useState<FormValues | null>(null);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchCategoryId, setBatchCategoryId] = useState<number | undefined>();
  const [batchTagIds, setBatchTagIds] = useState<number[]>([]);
  // 批量导入 - 新版进度式导入
  const [importUploadOpen, setImportUploadOpen] = useState(false);
  const [importProgressOpen, setImportProgressOpen] = useState(false);
  const [importItems, setImportItems] = useState<ArticleImportItem[]>([]);

  const [articleList, setArticleList] = useState<{ list: ArticleItem[]; page: number; size: number; total: number }>({
    list: [],
    page: 1,
    size: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const load = async () => {
      const [catRes, tagRes, settingsRes, topicRes] = await Promise.all([
        fetchCategories(true),
        fetchTags(true),
        fetchSettings(true),
        fetchTopics(),
      ]);
      setCategories((catRes.data as { list?: CategoryItem[] }).list || []);
      setTags((tagRes.data as { list?: TagItem[] }).list || []);
      setSettings(settingsRes.data || null);
      setTopics(unwrapList(topicRes.data) || []);
    };
    load();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('article-draft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setDraftState(draft);
      } catch {
        localStorage.removeItem('article-draft');
      }
    }
  }, []);

  useEffect(() => {
    refreshArticles();
  }, []);

  const refreshArticles = async (page = 1, size = 10, filters?: { keyword?: string }) => {
    setLoading(true);
    try {
      const keyword = filters?.keyword || searchKeyword;
      const res = await fetchArticles({ page, size, admin: true, keyword });
      setArticleList({
        list: res.data.list || [],
        page: res.data.page || 1,
        size: res.data.size || 10,
        total: res.data.total || 0,
      });
    } catch (error) {
      message.error('加载文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteArticle(id);
      console.log('Delete response:', res);
      message.success('文章删除成功');
      refreshArticles();
    } catch (error) {
      console.error('Delete error:', error);
      message.error('删除失败');
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await updateArticleStatus(id, { isPublished: true });
      message.success('文章发布成功');
    } catch {
      message.error('发布失败');
    }
  };

  const handleHide = async (id: number) => {
    try {
      await updateArticleStatus(id, { isPublished: false });
      message.success('文章已隐藏');
    } catch {
      message.error('隐藏失败');
    }
  };

  const handleTop = async (id: number) => {
    const article = articleList.list.find((item) => item.id === id);
    if (!article) return;
    
    try {
      await updateArticleStatus(id, { isTop: !article.isTop });
      message.success(article.isTop ? '已取消置顶' : '置顶成功');
    } catch {
      message.error('操作失败');
    }
  };

  const handlePublishToggle = async (id: number) => {
    const article = articleList.list.find((item) => item.id === id);
    if (!article) return;
    
    if (article.isPublished) {
      await handleHide(id);
    } else {
      await handlePublish(id);
    }
  };

  const handleRefreshSlug = async (id: number) => {
    try {
      await refreshArticleSlug(id);
    } catch {
      message.error('Slug 刷新失败');
    }
  };

  const handleBatchRefreshSlugs = async () => {
    try {
      const res = await batchRefreshArticleSlugs();
      message.success(`已刷新 ${res.data?.count ?? 0} 篇文章的 Slug`);
      refreshArticles();
    } catch {
      message.error('批量刷新 Slug 失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的文章');
      return;
    }
    const publishedSelected = articleList.list.filter(
      (a) => selectedRowKeys.includes(a.id) && a.isPublished
    );
    if (publishedSelected.length > 0) {
      const titles = publishedSelected.map((a) => a.title).join('、');
      modal.warning({
        title: '无法批量删除',
        content: `选中的文章中有 ${publishedSelected.length} 篇未下架：${titles}。请先下架后再执行删除操作。`,
      });
      return;
    }
    try {
      await batchDeleteArticles(selectedRowKeys.map(Number));
      message.success(`成功删除 ${selectedRowKeys.length} 篇文章`);
      setSelectedRowKeys([]);
      refreshArticles();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const handleBatchUnpublish = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要下架的文章');
      return;
    }
    try {
      await batchUpdateArticleStatus(selectedRowKeys.map(Number), { isPublished: false });
      message.success(`成功下架 ${selectedRowKeys.length} 篇文章`);
      setSelectedRowKeys([]);
      refreshArticles();
    } catch (error) {
      message.error('批量下架失败');
    }
  };

  const handleBatchUpdate = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要修改的文章');
      return;
    }
    if (batchCategoryId === undefined && batchTagIds.length === 0) {
      message.warning('请选择要修改的分类或标签');
      return;
    }

    try {
      const updatePromises = selectedRowKeys.map(async (key) => {
        const id = Number(key);
        const article = articleList.list.find((a) => a.id === id);
        if (!article) return;

        const payload: { categoryId?: number; tagIds?: number[] } = {};
        if (batchCategoryId !== undefined) {
          payload.categoryId = batchCategoryId;
        }
        if (batchTagIds.length > 0) {
          const existingTagIds = (article.tags || []).map((t: { id: number }) => t.id);
          payload.tagIds = [...new Set([...existingTagIds, ...batchTagIds])];
        }

        await updateArticle(id, payload);
      });

      await Promise.all(updatePromises);
      message.success(`成功修改 ${selectedRowKeys.length} 篇文章`);
      setBatchModalOpen(false);
      setBatchCategoryId(undefined);
      setBatchTagIds([]);
      setSelectedRowKeys([]);
      refreshArticles();
    } catch (error) {
      message.error('批量修改失败');
    }
  };

  const handleResetForm = () => {
    form.resetFields();
    form.setFieldsValue({ isPublished: true, isTop: false, tagIds: [], topicIds: [] });
    setDraftState(null);
    localStorage.removeItem('article-draft');
    message.success('表单已重置');
  };

  const parseMarkdownContent = (content: string) => {
    const lines = content.split('\n');
    let title = '';
    let description = '';
    let body = '';
    let inDescription = false;
    let descriptionLines: string[] = [];
    let bodyStartIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!title && line.startsWith('## ')) {
        title = line.substring(3).trim();
        continue;
      }

      if (!title && line.startsWith('# ')) {
        title = line.substring(2).trim();
        continue;
      }

      if (!description && line.startsWith('>')) {
        inDescription = true;
        descriptionLines.push(line.substring(1).trim());
        continue;
      }

      if (inDescription) {
        if (line.startsWith('>')) {
          descriptionLines.push(line.substring(1).trim());
        } else if (line.trim() === '') {
          continue;
        } else {
          inDescription = false;
          bodyStartIndex = i;
          break;
        }
      } else if (!title) {
        bodyStartIndex = i;
        break;
      }
    }

    if (!description && descriptionLines.length > 0) {
      description = descriptionLines.join(' ');
    }

    if (!title) {
      title = '未命名文章';
    }

    if (bodyStartIndex === 0 && !inDescription) {
      body = content;
    } else if (bodyStartIndex > 0) {
      body = lines.slice(bodyStartIndex).join('\n').trim();
    } else {
      body = content;
    }

    if (!description) {
      const preview = body.replace(/[#*`>\-\[\]()]/g, '').substring(0, 150);
      description = preview.length >= 150 ? preview + '...' : preview;
    }

    return { title, description, content: body };
  };

  // 批量导入 CSV 解析
  const parseCSV = (text: string): Array<{
    title: string; description: string; content: string;
    category?: string; tags?: string; isPublished?: number;
  }> => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const titleIdx = headers.findIndex(h => h === '标题' || h === 'title');
    const descIdx = headers.findIndex(h => h === '描述' || h === 'description');
    const contentIdx = headers.findIndex(h => h === '内容' || h === 'content');
    const catIdx = headers.findIndex(h => h === '分类' || h === 'category');
    const tagsIdx = headers.findIndex(h => h === '标签' || h === 'tags');
    const pubIdx = headers.findIndex(h => h === '发布状态' || h === 'ispublished');
    if (titleIdx < 0 || contentIdx < 0) return [];

    const result: Array<{
      title: string; description: string; content: string;
      category?: string; tags?: string; isPublished?: number;
    }> = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < Math.max(titleIdx, contentIdx) + 1) continue;
      const pubVal = pubIdx >= 0 ? cols[pubIdx]?.trim() : '';
      result.push({
        title: cols[titleIdx]?.trim() || '',
        description: descIdx >= 0 ? cols[descIdx]?.trim() || '' : '',
        content: contentIdx >= 0 ? cols[contentIdx]?.trim() || '' : '',
        category: catIdx >= 0 ? cols[catIdx]?.trim() : undefined,
        tags: tagsIdx >= 0 ? cols[tagsIdx]?.trim() : undefined,
        isPublished: pubVal === '已发布' || pubVal === '1' ? 1 : 0,
      });
    }
    return result;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  };

  const handleBatchImport = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const parsedItems: ArticleImportItem[] = [];
    let idCounter = 0;

    for (const file of fileArray) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'md' || ext === 'markdown') {
        const text = await file.text();
        const { title, description, content: body } = parseMarkdownContent(text);
        parsedItems.push({
          id: idCounter++,
          title,
          description,
          content: body,
          isTop: 0,
          isPublished: 0,
          status: 'pending',
        });
      } else if (ext === 'csv') {
        const text = await file.text();
        const parsed = parseCSV(text);
        parsed.forEach((item) => {
          parsedItems.push({
            id: idCounter++,
            title: item.title,
            description: item.description,
            content: item.content,
            isTop: 0,
            isPublished: item.isPublished ?? 0,
            status: 'pending',
          });
        });
      } else {
        message.warning(`跳过不支持的文件类型: ${file.name}`);
      }
    }

    if (parsedItems.length === 0) {
      message.error('未解析到有效数据，请上传 CSV 或 Markdown 文件');
      return;
    }

    setImportItems(parsedItems);
    setImportProgressOpen(true);
  };

  const handleImportMarkdown = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const { title, description, content: body } = parseMarkdownContent(content);

        await createArticle({
          title,
          description,
          content: body,
          isTop: 0,
          isPublished: 1,
        });
        message.success(`文章 "${title}" 导入成功`);
        refreshArticles();
      } catch (error) {
        message.error('导入失败，文件格式不正确或保存失败');
      }
    };
    reader.onerror = () => {
      message.error('读取文件失败');
    };
    reader.readAsText(file);

    e.target.value = '';
  };

  const openCreate = () => {
    setEditing(undefined);
    if (draftState) {
      form.setFieldsValue(draftState);
    } else {
      form.setFieldsValue({ isPublished: true, isTop: false, tagIds: [], topicIds: [] });
    }
    setDrawerOpen(true);
  };

  const openEdit = async (id: number) => {
    const res = await fetchAdminArticleDetail(id);
    const detail = res.data?.article;
    if (!detail) {
      message.error('获取文章详情失败');
      return;
    }
    setEditing(detail);
    form.setFieldsValue({
      title: detail.title,
      titleImage: detail.titleImage,
      description: detail.description,
      content: detail.content,
      categoryId: detail.categoryId,
      tagIds: (detail.tags || []).map((item: { id: number }) => item.id),
      topicIds: (detail.topics || []).map((item: { id: number }) => item.id),
      isTop: Boolean(detail.isTop),
      isPublished: Boolean(detail.isPublished),
    });
    setDrawerOpen(true);
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        title: values.title,
        titleImage: values.titleImage,
        description: values.description,
        content: values.content,
        categoryId: values.categoryId,
        tagIds: values.tagIds,
        topicIds: values.topicIds,
        isTop: values.isTop ? 1 : 0,
        isPublished: values.isPublished ? 1 : 0,
      };

      if (editing) {
        await updateArticle(editing.id, payload);
        message.success('文章更新成功');
      } else {
        await createArticle(payload);
        message.success('文章创建成功');
      }

      localStorage.removeItem('article-draft');
      setDraftState(null);
      setDrawerOpen(false);
      form.resetFields();
      refreshArticles();
    } catch (error) {
      message.error('提交失败，请检查表单');
    }
  };



  const categoryOptions = categories.map((item) => ({ label: item.name, value: item.id }));
  const tagOptions = tags.map((item) => ({ label: item.name, value: item.id }));
  const topicOptions = topics.map((item) => ({ label: item.title, value: item.id }));

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/admin">管理后台</Link> },
          { title: '文章管理' },
        ]}
      />

      <AdminCard title="文章管理">
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建文章
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={() => {
              setImportUploadOpen(true);
            }}
          >
            批量导入
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={() => document.getElementById('markdown-import')?.click()}
          >
            导入文章
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => exportArticlesCSV()}
          >
            导出全部
          </Button>
          {selectedRowKeys.length > 0 && (
            <Button
              icon={<DownloadOutlined />}
              onClick={() => exportArticlesCSV(selectedRowKeys.map(Number))}
            >
              导出选中 ({selectedRowKeys.length})
            </Button>
          )}
          <Popconfirm
            title="确认刷新所有文章的 Slug？"
            onConfirm={handleBatchRefreshSlugs}
          >
            <Button icon={<ReloadOutlined />}>
              批量刷新Slug
            </Button>
          </Popconfirm>
          <input
            id="markdown-import"
            type="file"
            accept=".md,.markdown"
            style={{ display: 'none' }}
            onChange={handleImportMarkdown}
          />
          {draftState ? (
            <Button onClick={() => form.setFieldsValue(draftState)}>
              恢复草稿
            </Button>
          ) : null}
          <Popconfirm
            title={`确认下架选中的 ${selectedRowKeys.length} 篇文章？`}
            disabled={selectedRowKeys.length === 0}
            onConfirm={handleBatchUnpublish}
          >
            <Button disabled={selectedRowKeys.length === 0}>
              批量下架
            </Button>
          </Popconfirm>
          <Button
            onClick={() => setBatchModalOpen(true)}
            disabled={selectedRowKeys.length === 0}
          >
            批量修改分类/标签
          </Button>
          <Popconfirm
            title={`确认删除选中的 ${selectedRowKeys.length} 篇文章？`}
            disabled={selectedRowKeys.length === 0}
            onConfirm={handleBatchDelete}
          >
            <Button danger disabled={selectedRowKeys.length === 0}>
              批量删除
            </Button>
          </Popconfirm>
        </Space>

        <Space style={{ marginBottom: 16, float: 'right' }}>
          <Input
            placeholder="搜索文章标题"
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={() => refreshArticles(1, 10, { keyword: searchKeyword })}
            style={{ width: 250 }}
          />
          <Button onClick={() => refreshArticles(1, 10, { keyword: searchKeyword })}>
            搜索
          </Button>
        </Space>

        <ArticleList
          loading={loading}
          list={articleList.list}
          page={articleList.page}
          size={articleList.size}
          total={articleList.total}
          selectedRowKeys={selectedRowKeys}
          onRefresh={refreshArticles}
          onEdit={openEdit}
          onDelete={handleDelete}
          onSelectChange={setSelectedRowKeys}
          onPublish={handlePublishToggle}
          onTop={handleTop}
          onRefreshSlug={handleRefreshSlug}
        />
      </AdminCard>

      <ArticleEditorDrawer
        open={drawerOpen}
        editing={editing}
        categories={categoryOptions}
        tags={tagOptions}
        topics={topicOptions}
        settings={settings || undefined}
        form={form}
        draftState={draftState}
        onOpenChange={setDrawerOpen}
        onSubmit={submit}
        onReset={handleResetForm}
        onRefreshSlug={async () => {
          if (editing) {
            await handleRefreshSlug(editing.id);
          }
        }}
      />

      <Modal
        title="批量修改分类/标签"
        open={batchModalOpen}
        onCancel={() => {
          setBatchModalOpen(false);
          setBatchCategoryId(undefined);
          setBatchTagIds([]);
        }}
        onOk={handleBatchUpdate}
        width={500}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Form.Item label="分类">
            <select
              value={batchCategoryId ?? ''}
              onChange={(e) => setBatchCategoryId(e.target.value ? Number(e.target.value) : undefined)}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: `1px solid ${token.colorBorderSecondary}` }}
            >
              <option value="">不修改分类</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Form.Item>
          <Form.Item label="添加标签（多选）">
            <Checkbox.Group
              options={tags.map((item) => ({ label: item.name, value: item.id }))}
              value={batchTagIds}
              onChange={(checkedValues) => setBatchTagIds(checkedValues as number[])}
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              注：标签将追加到现有标签中，不会覆盖
            </Typography.Text>
          </Form.Item>
        </Space>
      </Modal>

      <Modal
        title="批量导入文章"
        open={importUploadOpen}
        onCancel={() => setImportUploadOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Alert
            message="支持批量导入"
            description={
              <div>
                <p>支持 <b>CSV</b> 和 <b>Markdown (.md)</b> 文件，可同时上传多个文件。</p>
                <p>CSV 首行表头：<b>标题</b>（必填）、<b>内容</b>（必填）、描述、分类、标签、发布状态</p>
                <p>Markdown 文件以 <Tag># 标题</Tag> 作为文章标题，<Tag>{'>'} 引用</Tag> 作为描述</p>
                <p>发布状态填写 <Tag>已发布</Tag> 或 <Tag>1</Tag> 表示发布，其他值或不填则为未发布。</p>
              </div>
            }
            type="info"
            showIcon
          />
          <Upload.Dragger
            accept=".csv,.md,.markdown"
            multiple
            beforeUpload={(_file, fileList) => {
              handleBatchImport(fileList);
              setImportUploadOpen(false);
              return false;
            }}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 32, color: token.colorPrimary }} />
            </p>
            <p>点击或拖拽 CSV / Markdown 文件到此区域上传</p>
            <p style={{ color: token.colorTextSecondary, fontSize: 12 }}>
              支持多文件批量导入，每个 .md 文件解析为一篇文章
            </p>
          </Upload.Dragger>
        </Space>
      </Modal>

      <ArticleImportProgress
        open={importProgressOpen}
        items={importItems}
        onClose={() => setImportProgressOpen(false)}
        onImportComplete={() => refreshArticles()}
      />
    </div>
  );
};

export default ArticlesPage;