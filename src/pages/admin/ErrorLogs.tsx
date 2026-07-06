import { DeleteOutlined, DownloadOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { App, Breadcrumb, Button, Card, Input, Modal, Popconfirm, Space, Table, Tag, Typography, Drawer } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import type { ErrorLogRecord } from '@/services/blog/api';
import { fetchErrorLogs, deleteErrorLog, batchDeleteErrorLogs, exportErrorLogs, clearAllErrorLogs } from '@/services/blog/api';

const ErrorLogsPage: React.FC = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<ErrorLogRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ErrorLogRecord | null>(null);
  const [exporting, setExporting] = useState(false);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    loadRecords(pagination.current, pagination.pageSize, keyword);
  }, [pagination.current, pagination.pageSize, keyword]);

  const loadRecords = async (page: number, size: number, searchKeyword: string) => {
    setLoading(true);
    try {
      const res = await fetchErrorLogs(page, size, searchKeyword);
      setRecords(res.data.list || []);
      setPagination({
        current: res.data.page || page,
        pageSize: res.data.size || size,
        total: res.data.total || 0,
      });
    } catch (error) {
      console.error('加载错误日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setKeyword('');
    setPagination({ ...pagination, current: 1 });
  };

  const handleClear = () => {
    Modal.confirm({
      title: '确认清空所有记录',
      content: '此操作将删除所有错误日志，无法恢复。确定要继续吗？',
      okText: '确认清空',
      okType: 'danger',
      onOk: async () => {
        try {
          await clearAllErrorLogs();
          message.success('清空成功');
          setKeyword('');
          setSelectedRowKeys([]);
          loadRecords(1, pagination.pageSize, '');
        } catch (error) {
          message.error('清空失败');
        }
      },
    });
  };

  const showDetail = (record: ErrorLogRecord) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportErrorLogs();
      const data = res.data;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `error-logs-${dayjs().format('YYYYMMDD-HHmmss')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success(`成功导出 ${data?.length ?? 0} 条错误日志`);
    } catch (error) {
      console.error('导出错误日志失败:', error);
      message.error('导出失败');
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '错误码',
      dataIndex: 'errorCode',
      width: 140,
      render: (text: string) => <Tag color="red">{text || '-'}</Tag>,
    },
    {
      title: '错误信息',
      dataIndex: 'errorMessage',
      width: 260,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '请求',
      dataIndex: 'requestUrl',
      width: 280,
      ellipsis: true,
      render: (text: string, record: ErrorLogRecord) => (
        <>
          <Tag color="blue">{record.requestMethod || '-'}</Tag>
          {text || '-'}
        </>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      width: 150,
      render: (text: string) => <Tag color="geekblue">{text || '-'}</Tag>,
    },
    {
      title: 'Trace ID',
      dataIndex: 'traceId',
      width: 220,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '发生时间',
      dataIndex: 'createTime',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      width: 160,
      fixed: 'right',
      render: (_: unknown, record: ErrorLogRecord) => (
        <Space>
          <a onClick={() => showDetail(record)}>详情</a>
          <Popconfirm
            title="确认删除该错误日志？"
            onConfirm={async () => {
              await deleteErrorLog(record.id);
              message.success('删除成功');
              setSelectedRowKeys((prev) => prev.filter((k) => k !== record.id));
              loadRecords(pagination.current, pagination.pageSize, keyword);
            }}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: '管理后台' },
          { title: '错误日志' },
        ]}
      />

      <Card
        title="错误日志"
        extra={
          <Space>
            <Input
              placeholder="搜索错误码/错误信息/URL/IP/TraceID"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPagination({ ...pagination, current: 1 });
              }}
              style={{ width: 280 }}
              allowClear
              onClear={handleClearSearch}
            />
            <Button icon={<ClearOutlined />} onClick={handleClear}>
              清空
            </Button>
            <Button icon={<DownloadOutlined />} loading={exporting} onClick={handleExport}>
              导出错误日志
            </Button>
            <Popconfirm
              title={`确认批量删除 ${selectedRowKeys.length} 条错误日志？`}
              disabled={selectedRowKeys.length === 0}
              onConfirm={async () => {
                await batchDeleteErrorLogs(selectedRowKeys.map(Number));
                message.success('批量删除成功');
                setSelectedRowKeys([]);
                loadRecords(pagination.current, pagination.pageSize, keyword);
              }}
            >
              <Button danger disabled={selectedRowKeys.length === 0}>
                批量删除
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        <Table<ErrorLogRecord>
          rowKey="id"
          loading={loading}
          dataSource={records}
          columns={columns as any}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
            columnWidth: 48,
            fixed: true,
          }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Drawer
        title="错误详情"
        placement="right"
        width={600}
        open={detailVisible}
        onClose={() => {
          setDetailVisible(false);
          setCurrentRecord(null);
        }}
      >
        {currentRecord && (
          <div>
            <Typography.Paragraph>
              <Typography.Text strong>错误码：</Typography.Text>
              <Tag color="red">{currentRecord.errorCode || '-'}</Tag>
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>错误信息：</Typography.Text>
              {currentRecord.errorMessage || '-'}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>请求URL：</Typography.Text>
              <Tag color="blue">{currentRecord.requestMethod || '-'}</Tag> {currentRecord.requestUrl || '-'}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>IP地址：</Typography.Text>
              {currentRecord.ipAddress || '-'}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>User Agent：</Typography.Text>
              {currentRecord.userAgent || '-'}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Trace ID：</Typography.Text>
              <Typography.Text copyable>{currentRecord.traceId || '-'}</Typography.Text>
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>发生时间：</Typography.Text>
              {dayjs(currentRecord.createTime).format('YYYY-MM-DD HH:mm:ss')}
            </Typography.Paragraph>
            {currentRecord.requestParams && (
              <Typography.Paragraph>
                <Typography.Text strong>请求参数：</Typography.Text>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 200, overflow: 'auto', fontSize: 12 }}>
                  {currentRecord.requestParams}
                </pre>
              </Typography.Paragraph>
            )}
            {currentRecord.requestBody && (
              <Typography.Paragraph>
                <Typography.Text strong>请求体：</Typography.Text>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 200, overflow: 'auto', fontSize: 12 }}>
                  {currentRecord.requestBody}
                </pre>
              </Typography.Paragraph>
            )}
            {currentRecord.errorDetail && (
              <Typography.Paragraph>
                <Typography.Text strong>错误原因：</Typography.Text>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#fff2f0', padding: 12, borderRadius: 4, maxHeight: 300, overflow: 'auto', border: '1px solid #ffccc7' }}>
                  {currentRecord.errorDetail}
                </pre>
              </Typography.Paragraph>
            )}
            {currentRecord.responseBody && (
              <Typography.Paragraph>
                <Typography.Text strong>原始响应内容：</Typography.Text>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 300, overflow: 'auto', fontSize: 12 }}>
                  {currentRecord.responseBody}
                </pre>
              </Typography.Paragraph>
            )}
            {currentRecord.stackTrace && (
              <Typography.Paragraph>
                <Typography.Text strong>堆栈信息：</Typography.Text>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 400, overflow: 'auto', fontSize: 12 }}>
                  {currentRecord.stackTrace}
                </pre>
              </Typography.Paragraph>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ErrorLogsPage;