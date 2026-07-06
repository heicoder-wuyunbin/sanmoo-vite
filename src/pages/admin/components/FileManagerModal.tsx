import { Modal, Table, Typography, Space, Divider, Button } from 'antd';
import React from 'react';
import type { BlogSettings, FileItem } from '@/services/blog/api';

type FileManagerModalProps = {
  open: boolean;
  fileList: FileItem[];
  filePage: number;
  fileSize: number;
  fileTotal: number;
  fileLoading: boolean;
  pickerTarget: 'titleImage' | 'content';
  settings?: BlogSettings;
  onOpenChange: (open: boolean) => void;
  onLoadFileList: (page?: number, size?: number) => void;
  onInsert: (filename: string, target: 'titleImage' | 'content') => void;
};

const FileManagerModal: React.FC<FileManagerModalProps> = ({
  open,
  fileList,
  filePage,
  fileSize,
  fileTotal,
  fileLoading,
  pickerTarget,
  settings,
  onOpenChange,
  onLoadFileList,
  onInsert,
}) => {
  const resolveFileUrl = (name: string) => {
    const prefix = settings?.storageConfig?.uploadLocalUrlPrefix || '/uploads/';
    return `${prefix.endsWith('/') ? prefix : prefix + '/'}${name}`;
  };

  const handleInsert = (filename: string) => {
    onInsert(filename, pickerTarget);
  };

  return (
    <Modal
      title="文件库"
      open={open}
      width={820}
      footer={null}
      onCancel={() => onOpenChange(false)}
      styles={{
        content: {
          borderRadius: 24,
          border: '1px solid var(--web-border)',
          boxShadow: 'var(--web-shadow-strong)',
        },
        header: {
          borderBottom: '1px solid var(--web-border-soft)',
          marginBottom: 0,
          paddingBottom: 16,
        },
        body: {
          paddingTop: 18,
        },
      }}
    >
      <Space
        style={{
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Typography.Text type="secondary">
          选择后将
          {pickerTarget === 'titleImage'
            ? '填充标题图 URL'
            : '插入正文 Markdown'}
        </Typography.Text>
      </Space>
      <Divider style={{ margin: '8px 0 16px' }} />
      <Table<FileItem>
        rowKey="id"
        loading={fileLoading}
        dataSource={fileList}
        size="middle"
        pagination={{
          current: filePage,
          pageSize: fileSize,
          total: fileTotal,
          showSizeChanger: true,
          onChange: (nextPage, nextSize) =>
            onLoadFileList(nextPage, nextSize),
        }}
        columns={[
          { title: '文件名', dataIndex: 'filename' },
          {
            title: 'URL',
            dataIndex: 'filename',
            render: (value: string) => (
              <Typography.Text copyable={{ text: resolveFileUrl(value) }}>
                {resolveFileUrl(value)}
              </Typography.Text>
            ),
          },
          {
            title: '操作',
            width: 110,
            render: (_, record) => (
              <Button
                size="small"
                type="primary"
                onClick={() => handleInsert(record.filename)}
              >
                插入
              </Button>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default FileManagerModal;
