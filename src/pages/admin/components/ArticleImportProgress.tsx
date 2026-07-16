import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Button, Modal, Progress, Space, Tag, theme as antTheme, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { ArticleImportItem, ArticleImportStatus } from '@/utils/articleImporter';
import { ArticleImporter } from '@/utils/articleImporter';

const { Text } = Typography;

interface ArticleImportProgressProps {
  open: boolean;
  items: ArticleImportItem[];
  onClose: () => void;
  onImportComplete: () => void;
}

/** 状态图标映射 */
const statusIcon: Record<ArticleImportStatus, React.ReactNode> = {
  pending: <ClockCircleOutlined style={{ color: '#d9d9d9', fontSize: 18 }} />,
  importing: <LoadingOutlined style={{ color: '#1677ff', fontSize: 18 }} />,
  success: <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />,
  failed: <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />,
  skipped: <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 18 }} />,
};

/** 状态中文映射 */
const statusLabel: Record<ArticleImportStatus, string> = {
  pending: '等待中',
  importing: '导入中',
  success: '成功',
  failed: '失败',
  skipped: '已跳过',
};

const ArticleImportProgress: React.FC<ArticleImportProgressProps> = ({
  open,
  items: initialItems,
  onClose,
  onImportComplete,
}) => {
  const { token } = antTheme.useToken();
  const [items, setItems] = useState<ArticleImportItem[]>(initialItems);
  const [completed, setCompleted] = useState(false);
  const importerRef = useRef<ArticleImporter | null>(null);

  useEffect(() => {
    if (!open) return;

    setItems(initialItems);
    setCompleted(false);

    const importer = new ArticleImporter(initialItems, (updatedItems) => {
      setItems(updatedItems);

      // 检查是否全部完成
      const hasActive = updatedItems.some(
        (item) => item.status === 'pending' || item.status === 'importing',
      );
      if (!hasActive) {
        setCompleted(true);
      }
    });

    importerRef.current = importer;
    importer.start().then(() => {
      setCompleted(true);
    });

    return () => {
      importer.abort();
    };
  }, [open]);

  const handleRetry = async (itemId: number) => {
    setCompleted(false);
    await importerRef.current?.retry(itemId);
  };

  const handleClose = () => {
    importerRef.current?.abort();
    onClose();
    if (completed || items.some((item) => item.status === 'success')) {
      onImportComplete();
    }
  };

  const summary = (() => {
    const s = { success: 0, failed: 0, skipped: 0, pending: 0, importing: 0 };
    for (const item of items) {
      switch (item.status) {
        case 'success': s.success++; break;
        case 'failed': s.failed++; break;
        case 'skipped': s.skipped++; break;
        case 'pending': s.pending++; break;
        case 'importing': s.importing++; break;
      }
    }
    return s;
  })();

  const total = items.length;
  const done = summary.success + summary.failed + summary.skipped;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Modal
      title="文章导入进度"
      open={open}
      onCancel={handleClose}
      footer={[
        <Button key="close" type="primary" onClick={handleClose}>
          {completed ? '完成' : '取消导入'}
        </Button>,
      ]}
      width={560}
      destroyOnClose
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {/* 进度条与汇总 */}
        <div style={{ textAlign: 'center' }}>
          <Progress
            percent={percent}
            status={completed && summary.failed === 0 ? 'success' : 'active'}
            size="small"
          />
          <Text type="secondary" style={{ fontSize: 13 }}>
            {summary.importing > 0 && `正在导入 ${summary.importing} 篇，`}
            成功 {summary.success} 篇
            {summary.failed > 0 && `，失败 ${summary.failed} 篇`}
            {summary.skipped > 0 && `，跳过 ${summary.skipped} 篇`}
            {summary.pending > 0 && `，等待 ${summary.pending} 篇`}
          </Text>
        </div>

        {/* 文章列表 */}
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: token.colorFillSecondary,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <Space size={8}>
                  {statusIcon[item.status]}
                  <Text
                    style={{
                      maxWidth: 300,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    delete={item.status === 'failed' || item.status === 'skipped'}
                  >
                    {item.title}
                  </Text>
                  <Tag
                    color={
                      item.status === 'success'
                        ? 'success'
                        : item.status === 'failed'
                          ? 'error'
                          : item.status === 'skipped'
                            ? 'warning'
                            : item.status === 'importing'
                              ? 'processing'
                              : 'default'
                    }
                  >
                    {statusLabel[item.status]}
                  </Tag>
                </Space>
                {(item.status === 'failed' || item.status === 'skipped') && (
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={() => handleRetry(item.id)}
                    disabled={!completed}
                  >
                    重试
                  </Button>
                )}
              </div>
            ))}
          </Space>
        </div>

        {/* 失败详情 */}
        {items.filter((item) => item.status === 'failed' || item.status === 'skipped').length > 0 && completed && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              background: token.colorWarningBg,
              border: `1px solid ${token.colorWarningBorder}`,
            }}
          >
            <Text type="warning" style={{ fontSize: 12 }}>
              失败/跳过的文章可以点击「重试」按钮重新导入
            </Text>
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default ArticleImportProgress;