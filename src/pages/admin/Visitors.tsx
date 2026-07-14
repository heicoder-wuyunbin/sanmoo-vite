import { DeleteOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { App, Breadcrumb, Button, Card, Drawer, Input, Modal, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import type { VisitorRecord } from '@/services/blog/api';
import { fetchVisitorRecords, deleteVisitorRecord, batchDeleteVisitorRecords, clearAllVisitorRecords } from '@/services/blog/api';

const VisitorsPage: React.FC = () => {
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<VisitorRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<VisitorRecord | null>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    loadRecords(pagination.current, pagination.pageSize, keyword);
  }, [pagination.current, pagination.pageSize, keyword]);

  const loadRecords = async (page: number, size: number, searchKeyword: string) => {
    setLoading(true);
    try {
      const res = await fetchVisitorRecords(page, size, searchKeyword);
      setRecords(res.data.list || []);
      setPagination({
        current: res.data.page || page,
        pageSize: res.data.size || size,
        total: res.data.total || 0,
      });
    } catch (error) {
      console.error('加载访问记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setKeyword('');
    setPagination({ ...pagination, current: 1 });
  };

  const handleClear = () => {
    modal.confirm({
      title: '确认清空所有记录',
      content: '此操作将删除所有访问记录，无法恢复。确定要继续吗？',
      okText: '确认清空',
      okType: 'danger',
      onOk: async () => {
        try {
          await clearAllVisitorRecords();
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

  const showDetail = (record: VisitorRecord) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '访问者',
      dataIndex: 'visitorName',
      width: 100,
      render: (text: string) => <Tag color={text === '游客' ? 'default' : 'purple'}>{text || '游客'}</Tag>,
    },
    {
      title: '请求',
      dataIndex: 'requestUrl',
      width: 360,
      ellipsis: true,
      render: (text: string, record: VisitorRecord) => (
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
      title: '来源',
      dataIndex: 'requestSource',
      width: 160,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'responseStatus',
      width: 110,
      render: (status: number, record: VisitorRecord) => (
        <Tag color={record.isError ? 'red' : status >= 400 ? 'orange' : 'green'}>
          {status || '-'}
        </Tag>
      ),
    },
    {
      title: '耗时',
      dataIndex: 'responseTime',
      width: 110,
      render: (time: number) => `${time || 0} ms`,
    },
    {
      title: 'Trace ID',
      dataIndex: 'traceId',
      width: 220,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '访问时间',
      dataIndex: 'visitTime',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      width: 160,
      fixed: 'right' as const,
      render: (_: unknown, record: VisitorRecord) => (
        <Space>
          <a onClick={() => showDetail(record)}>详情</a>
          <Popconfirm
            title="确认删除该访问记录？"
            onConfirm={async () => {
              await deleteVisitorRecord(record.id);
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
          { title: '访问记录' },
        ]}
      />

      <Card
        title="访问记录"
        extra={
          <Space>
            <Input
              placeholder="搜索URL/IP/访问者/TraceID"
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
            <Popconfirm
              title={`确认批量删除 ${selectedRowKeys.length} 条访问记录？`}
              disabled={selectedRowKeys.length === 0}
              onConfirm={async () => {
                await batchDeleteVisitorRecords(selectedRowKeys.map(Number));
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
        <Table<VisitorRecord>
          rowKey="id"
          loading={loading}
          dataSource={records}
          columns={columns}
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
        title="访问详情"
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
              <Typography.Text strong>访问者：</Typography.Text>
              <Tag color={currentRecord.visitorName === '游客' ? 'default' : 'purple'}>
                {currentRecord.visitorName || '游客'}
              </Tag>
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
              <Typography.Text strong>来源：</Typography.Text>
              {currentRecord.requestSource || '-'}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>响应状态：</Typography.Text>
              <Tag color={currentRecord.isError ? 'red' : currentRecord.responseStatus >= 400 ? 'orange' : 'green'}>
                {currentRecord.responseStatus || '-'}
              </Tag>
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>响应耗时：</Typography.Text>
              {currentRecord.responseTime || 0} ms
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>Trace ID：</Typography.Text>
              <Typography.Text copyable>{currentRecord.traceId || '-'}</Typography.Text>
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Typography.Text strong>访问时间：</Typography.Text>
              {dayjs(currentRecord.visitTime).format('YYYY-MM-DD HH:mm:ss')}
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
            {currentRecord.responseBody && (
              <Typography.Paragraph>
                <Typography.Text strong>响应内容：</Typography.Text>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#fff2f0', padding: 12, borderRadius: 4, maxHeight: 300, overflow: 'auto', fontSize: 12, border: '1px solid #ffccc7' }}>
                  {currentRecord.responseBody}
                </pre>
              </Typography.Paragraph>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default VisitorsPage;
