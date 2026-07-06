import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import {
  App,
  Button,
  Drawer,
  Form,
  type FormInstance,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  theme as antTheme,
  Typography,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import {
  type ArticleDetail,
  type BlogSettings,
  type FileItem,
  fetchAdminFiles,
  uploadAdminFile,
} from '@/services/blog/api';
import FileManagerModal from './FileManagerModal';
import { marked } from 'marked';

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

type ArticleEditorDrawerProps = {
  open: boolean;
  editing?: ArticleDetail;
  categories: { label: string; value: number }[];
  tags: { label: string; value: number }[];
  topics: { label: string; value: number }[];
  settings?: BlogSettings;
  form: FormInstance<FormValues>;
  draftState: FormValues | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => Promise<void>;
  onReset: () => void;
};

const ArticleEditorDrawer: React.FC<ArticleEditorDrawerProps> = ({
  open,
  editing,
  categories,
  tags,
  topics,
  settings,
  form,
  draftState,
  onOpenChange,
  onSubmit,
  onReset,
}) => {
  const { message } = App.useApp();
  const { token } = antTheme.useToken();

  const [lastSavedTime, setLastSavedTime] = React.useState<number | null>(null);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');

  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [pickerTarget, setPickerTarget] = React.useState<'titleImage' | 'content'>(
    'content',
  );
  const [fileList, setFileList] = React.useState<FileItem[]>([]);
  const [filePage, setFilePage] = React.useState(1);
  const [fileSize, setFileSize] = React.useState(8);
  const [fileTotal, setFileTotal] = React.useState(0);
  const [fileLoading, setFileLoading] = React.useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');

  const contentValue = Form.useWatch('content', form);
  const titleImageValue = Form.useWatch('titleImage', form);

  const categoryOptions = useMemo(
    () => categories.map((item) => ({ label: item.label, value: item.value })),
    [categories],
  );
  const tagOptions = useMemo(
    () => tags.map((item) => ({ label: item.label, value: item.value })),
    [tags],
  );
  const topicOptions = useMemo(
    () => topics.map((item) => ({ label: item.label, value: item.value })),
    [topics],
  );
  const editorId = useMemo(
    () => `article-editor-${editing?.id ?? 'create'}`,
    [editing?.id],
  );

  const resolveFileUrl = (name: string) => {
    const prefix = settings?.storageConfig?.uploadLocalUrlPrefix || '/uploads/';
    return `${prefix.endsWith('/') ? prefix : prefix + '/'}${name}`;
  };

  const loadFileList = async (
    nextPage = filePage,
    nextSize = fileSize,
  ) => {
    setFileLoading(true);
    try {
      const res = await fetchAdminFiles({
        page: nextPage,
        size: nextSize,
      });
      setFileList(res.data.list || []);
      setFileTotal(res.data.total || 0);
      setFilePage(nextPage);
      setFileSize(nextSize);
    } finally {
      setFileLoading(false);
    }
  };

  const openFilePicker = (target: 'titleImage' | 'content') => {
    setPickerTarget(target);
    setPickerOpen(true);
    loadFileList(1, fileSize);
  };

  const insertFromFile = (filename: string) => {
    const url = resolveFileUrl(filename);
    if (pickerTarget === 'titleImage') {
      form.setFieldValue('titleImage', url);
      message.success('已设置标题图');
    } else {
      const content = form.getFieldValue('content') || '';
      const next = `${content}\n![image](${url})\n`;
      form.setFieldValue('content', next);
      message.success('已插入正文');
    }
    setPickerOpen(false);
  };

  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({
          title: editing.title,
          titleImage: editing.titleImage,
          description: editing.description,
          content: editing.content,
          categoryId: editing.categoryId,
          tagIds: (editing.tags || []).map((item) => item.id),
          topicIds: (editing.topics || []).map((item) => item.id),
          isTop: Boolean(editing.isTop),
          isPublished: Boolean(editing.isPublished),
        });
      } else {
        form.resetFields();
        if (draftState) {
          form.setFieldsValue({
            ...draftState,
            isPublished:
              draftState.isPublished !== undefined ? Boolean(draftState.isPublished) : true,
            isTop: draftState.isTop !== undefined ? Boolean(draftState.isTop) : false,
            tagIds: draftState.tagIds || [],
            topicIds: draftState.topicIds || [],
          });
        } else {
          form.setFieldsValue({
            isPublished: true,
            isTop: false,
            tagIds: [],
            topicIds: [],
          });
        }
      }
    }
  }, [open, editing, draftState, form]);

  const saveDraft = React.useCallback(() => {
    if (!open || editing) return;
    const values = form.getFieldsValue() as FormValues;
    if (!values.title && !values.content && !values.description) return;
    setSaveStatus('saving');
    try {
      localStorage.setItem('article-draft', JSON.stringify(values));
      setLastSavedTime(Date.now());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('idle');
    }
  }, [open, editing, form]);

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(saveDraft, 30000);
    return () => clearInterval(timer);
  }, [open, saveDraft]);

  useEffect(() => {
    if (open && !editing) {
      saveDraft();
    }
  }, [contentValue, open, editing, saveDraft]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) {
        const content = form.getFieldValue('content') || '';
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const selectedText = content.substring(start, end);

        if (e.ctrlKey || e.metaKey) {
          switch (e.key.toLowerCase()) {
            case 'b':
              e.preventDefault();
              const boldText = selectedText ? `**${selectedText}**` : '**加粗文本**';
              form.setFieldValue('content', content.substring(0, start) + boldText + content.substring(end));
              break;
            case 'i':
              e.preventDefault();
              const italicText = selectedText ? `*${selectedText}*` : '*斜体文本*';
              form.setFieldValue('content', content.substring(0, start) + italicText + content.substring(end));
              break;
            case 'k':
              e.preventDefault();
              const linkText = selectedText ? `[${selectedText}](https://)` : '[链接文本](https://)';
              form.setFieldValue('content', content.substring(0, start) + linkText + content.substring(end));
              break;
            case 'h':
              e.preventDefault();
              form.setFieldValue('content', content.substring(0, start) + '### ' + selectedText + content.substring(end));
              break;
            case 'l':
              e.preventDefault();
              const listText = selectedText ? selectedText.split('\n').map((line: string) => `- ${line}`).join('\n') : '- 列表项';
              form.setFieldValue('content', content.substring(0, start) + listText + content.substring(end));
              break;
            case 'c':
              if (e.shiftKey) {
                e.preventDefault();
                const codeText = selectedText ? `\`\`\`\n${selectedText}\n\`\`\`` : '```\n代码块\n```';
                form.setFieldValue('content', content.substring(0, start) + codeText + content.substring(end));
              }
              break;
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, form]);

  const handleSubmit = async () => {
    await onSubmit();
    onOpenChange(false);
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <>
      <Drawer
        title={editing ? '编辑文章' : '新建文章'}
        open={open}
        width={1120}
        destroyOnClose
        onClose={() => onOpenChange(false)}
        styles={{
          header: {
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            paddingBottom: 16,
          },
          body: {
            background: token.colorBgContainer,
          },
        }}
        extra={
          <Space>
            {!editing && (
              <Typography.Text type={saveStatus === 'saved' ? 'success' : 'secondary'}>
                {saveStatus === 'saving' ? '保存中...' : saveStatus === 'saved' ? '已自动保存' : lastSavedTime ? `上次保存: ${dayjs(lastSavedTime).format('HH:mm:ss')}` : ''}
              </Typography.Text>
            )}
            <Button onClick={() => setPreviewOpen(true)}>预览</Button>
            <Button
              onClick={() => {
                onOpenChange(false);
              }}
            >
              取消
            </Button>
            <Button onClick={handleReset}>重置</Button>
            <Button type="primary" onClick={handleSubmit}>
              保存
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>
          <Form.Item name="titleImage" label="标题图 URL">
            <Space.Compact style={{ width: '100%' }}>
              <Input placeholder="请输入图片 URL" />
              <Upload
                showUploadList={false}
                customRequest={async ({ file, onSuccess, onError }) => {
                  try {
                    const res = await uploadAdminFile(file as File);
                    const prefix =
                      settings?.storageConfig?.uploadLocalUrlPrefix ||
                      '/uploads/';
                    const url = `${prefix.endsWith('/') ? prefix : prefix + '/'}${res.data.filename}`;
                    form.setFieldValue('titleImage', url);
                    message.success('标题图上传成功');
                    onSuccess?.({}, new XMLHttpRequest());
                  } catch (error) {
                    onError?.(error as Error);
                  }
                }}
              >
                <Button>上传</Button>
              </Upload>
              <Button onClick={() => openFilePicker('titleImage')}>
                从文件库选择
              </Button>
            </Space.Compact>
          </Form.Item>
          {titleImageValue && titleImageValue !== '' ? (
            <>
              <Typography.Text type="secondary">标题图预览</Typography.Text>
              <img
                src={titleImageValue}
                alt="title"
                style={{
                  maxWidth: '100%',
                  borderRadius: token.borderRadiusLG,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  boxShadow: token.boxShadow,
                }}
              />
            </>
          ) : null}
          <Form.Item
            name="description"
            label="摘要"
            rules={[{ required: true, message: '请输入摘要' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="content"
            label="正文编辑"
            rules={[{ required: true, message: '请输入正文' }]}
          >
            <div
              style={{
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
                overflow: 'hidden',
                boxShadow: token.boxShadow,
              }}
            >
              <MdEditor
                id={editorId}
                value={contentValue || ''}
                onChange={(value) => form.setFieldValue('content', value)}
                autoFocus={false}
                language="zh-CN"
                theme="light"
                previewTheme="github"
                codeTheme="atom"
                noUploadImg
                showCodeRowNumber
                style={{ height: 860 }}
              />
            </div>
          </Form.Item>
          <Form.Item name="categoryId" label="分类">
            <Select
              allowClear
              options={categoryOptions}
              placeholder="请选择分类"
            />
          </Form.Item>
          <Form.Item name="tagIds" label="标签">
            <Select
              mode="multiple"
              allowClear
              options={tagOptions}
              placeholder="请选择标签"
            />
          </Form.Item>
          <Form.Item name="topicIds" label="专题">
            <Select
              mode="multiple"
              allowClear
              options={topicOptions}
              placeholder="请选择专题"
            />
          </Form.Item>
          <Space size={24}>
            <Form.Item name="isPublished" label="发布" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isTop" label="置顶" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Drawer>

      <FileManagerModal
        open={pickerOpen}
        fileList={fileList}
        filePage={filePage}
        fileSize={fileSize}
        fileTotal={fileTotal}
        fileLoading={fileLoading}
        pickerTarget={pickerTarget}
        settings={settings}
        onOpenChange={setPickerOpen}
        onLoadFileList={loadFileList}
        onInsert={insertFromFile}
      />

      <Modal
        title="文章预览"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={
          <Space>
            <Typography.Text type="secondary">主题:</Typography.Text>
            <Button
              type={previewTheme === 'light' ? 'primary' : 'default'}
              onClick={() => setPreviewTheme('light')}
            >
              浅色
            </Button>
            <Button
              type={previewTheme === 'dark' ? 'primary' : 'default'}
              onClick={() => setPreviewTheme('dark')}
            >
              深色
            </Button>
          </Space>
        }
        width={900}
        styles={{
          body: {
            background: previewTheme === 'dark' ? '#1f1f1f' : token.colorBgContainer,
            padding: 0,
          },
        }}
      >
        <div
          style={{
            padding: 24,
            maxHeight: '70vh',
            overflowY: 'auto',
            background: previewTheme === 'dark' ? '#1f1f1f' : token.colorBgContainer,
            color: previewTheme === 'dark' ? '#ffffff' : token.colorText,
          }}
          className={`article-preview-content ${previewTheme === 'dark' ? 'dark' : ''}`}
        >
          {form.getFieldValue('titleImage') && (
            <img
              src={form.getFieldValue('titleImage')}
              alt=""
              style={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'cover',
                borderRadius: token.borderRadiusLG,
                marginBottom: 16,
              }}
            />
          )}
          <Typography.Title
            level={1}
            style={{
              marginBottom: 8,
              color: previewTheme === 'dark' ? '#ffffff' : token.colorText,
            }}
          >
            {form.getFieldValue('title') || '未输入标题'}
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{
              fontSize: 14,
              color: previewTheme === 'dark' ? '#999999' : token.colorTextSecondary,
            }}
          >
            {dayjs().format('YYYY-MM-DD HH:mm')}
          </Typography.Text>
          {form.getFieldValue('description') && (
            <Typography.Paragraph
              style={{
                marginTop: 16,
                padding: 12,
                background: previewTheme === 'dark' ? '#2d2d2d' : '#f5f5f5',
                borderRadius: token.borderRadiusSM,
                color: previewTheme === 'dark' ? '#cccccc' : token.colorTextSecondary,
              }}
            >
              {form.getFieldValue('description')}
            </Typography.Paragraph>
          )}
          <div
            className="article-body"
            style={{
              marginTop: 24,
              fontSize: 16,
              lineHeight: 1.8,
              color: previewTheme === 'dark' ? '#e8e8e8' : token.colorText,
            }}
            dangerouslySetInnerHTML={{
              __html: marked(form.getFieldValue('content') || '') as string,
            }}
          />
        </div>
      </Modal>
    </>
  );
};

export default ArticleEditorDrawer;
