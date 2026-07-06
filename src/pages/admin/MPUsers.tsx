import { RadarChartOutlined, ReloadOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import {
  Avatar,
  Breadcrumb,
  Button,
  Input,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchMPUsers,
  unwrapPagedList,
  type MPUserSummary,
} from '@/services/blog/api';
import { queryKeys } from '@/services/blog/queryKeys';
import MPUserDetailDrawer from './components/MPUserDetailDrawer';
import AdminCard from '@/components/admin/AdminCard';

const MPUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOpenid, setSelectedOpenid] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: queryKeys.mpUserList({ page, size: pageSize, keyword: searchText }),
    queryFn: () =>
      fetchMPUsers({ page, size: pageSize, keyword: searchText }).then((res) =>
        unwrapPagedList(res.data, page, pageSize),
      ),
  });

  const list = listQuery.data?.list || [];
  const total = listQuery.data?.total || 0;
  const loading = listQuery.isLoading;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.mpUsers() });
  };

  const openDetail = (openid: string) => {
    setSelectedOpenid(openid);
    setDrawerOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(1);
  };

  const handleRefresh = () => {
    setSearchText('');
    setPage(1);
    invalidate();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    {
      title: '用户', dataIndex: 'nickname', width: 200,
      render: (text: string, record: MPUserSummary) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} size="small" />
          <Typography.Text style={{ color: 'var(--ant-color-primary)', cursor: 'pointer' }}
            onClick={() => openDetail(record.openid)}>{text || '未知用户'}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'OpenID', dataIndex: 'openid', width: 220, ellipsis: true,
      render: (text: string) => (
        <Typography.Text copyable={{ text }} style={{ fontSize: 12 }}>{text}</Typography.Text>
      ),
    },
    { title: '标签数', dataIndex: 'tagCount', width: 90, align: 'center' as const, render: (count: number) => <Tag color="blue">{count}</Tag> },
    { title: '浏览数', dataIndex: 'viewCount', width: 90, align: 'center' as const },
    { title: '收藏数', dataIndex: 'favoriteCount', width: 90, align: 'center' as const },
    { title: '最近登录', dataIndex: 'lastLoginTime', width: 170, render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm') },
    {
      title: '操作', key: 'action', width: 100, fixed: 'right' as const,
      render: (_: unknown, record: MPUserSummary) => (
        <Button type="link" size="small" icon={<RadarChartOutlined />} onClick={() => openDetail(record.openid)}>
          画像
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ title: '首页' }, { title: '微信用户管理' }]} style={{ marginBottom: 16 }} />
      <AdminCard>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input placeholder="搜索昵称或OpenID" prefix={<SearchOutlined />} value={searchText}
            onChange={(e) => handleSearch(e.target.value)} onPressEnter={() => handleSearch(searchText)}
            style={{ width: 240 }} allowClear />
          <Button type="primary" icon={<SearchOutlined />} onClick={() => handleSearch(searchText)}>搜索</Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>刷新</Button>
        </Space>
        <Table rowKey="id" loading={loading} dataSource={list} columns={columns}
          pagination={{
            current: page, pageSize, total, showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, s) => { setPage(p); setPageSize(s); },
          }}
          scroll={{ x: 1100 }} />
      </AdminCard>
      <MPUserDetailDrawer
        open={drawerOpen}
        openid={selectedOpenid}
        onClose={() => setDrawerOpen(false)}
        onRefreshList={invalidate}
      />
    </div>
  );
};

export default MPUsersPage;
