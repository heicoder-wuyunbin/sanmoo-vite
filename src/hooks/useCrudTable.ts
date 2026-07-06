import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { unwrapPagedList } from '@/services/blog/helpers';
import type { ListResponse } from '@/services/blog/types';
import type { Result } from '@/services/request';

type FetchListParams = {
  page: number;
  size: number;
  keyword?: string;
};

type UseCrudTableOptions<TItem extends { id: number | string }, TCreate, TUpdate> = {
  queryKey: readonly unknown[];
  fetchList: (params: FetchListParams) => Promise<Result<ListResponse<TItem> | { list: TItem[] }>>;
  createItem?: (data: TCreate) => Promise<Result<unknown>>;
  updateItem?: (id: TItem['id'], data: TUpdate) => Promise<Result<unknown>>;
  deleteItem?: (id: TItem['id']) => Promise<Result<unknown>>;
  batchDelete?: (ids: TItem['id'][]) => Promise<Result<unknown>>;
  defaultPageSize?: number;
  entityName?: string;
};

export function useCrudTable<TItem extends { id: number | string }, TCreate, TUpdate>(
  options: UseCrudTableOptions<TItem, TCreate, TUpdate>,
) {
  const {
    queryKey,
    fetchList,
    createItem,
    updateItem,
    deleteItem,
    batchDelete,
    defaultPageSize = 10,
    entityName = '记录',
  } = options;

  const queryClient = useQueryClient();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TItem | undefined>();

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [...queryKey] });
  }, [queryClient, queryKey]);

  const listQuery = useQuery({
    queryKey: [...queryKey, current, pageSize, searchText],
    queryFn: () =>
      fetchList({
        page: current,
        size: pageSize,
        keyword: searchText || undefined,
      }).then((res) => unwrapPagedList(res.data, current, pageSize)),
  });

  const createMutation = useMutation({
    mutationFn: createItem!,
    onSuccess: () => {
      message.success(`创建${entityName}成功`);
      setModalOpen(false);
      setEditing(undefined);
      void invalidate();
    },
    onError: () => {
      message.error(`创建${entityName}失败`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: TItem['id']; data: TUpdate }) => updateItem!(id, data),
    onSuccess: () => {
      message.success(`更新${entityName}成功`);
      setModalOpen(false);
      setEditing(undefined);
      void invalidate();
    },
    onError: () => {
      message.error(`更新${entityName}失败`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem!,
    onSuccess: () => {
      message.success('删除成功');
      setSelectedRowKeys([]);
      void invalidate();
    },
    onError: () => {
      message.error('删除失败');
    },
  });

  const batchDeleteMutation = useMutation({
    mutationFn: batchDelete!,
    onSuccess: () => {
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      void invalidate();
    },
    onError: () => {
      message.error('批量删除失败');
    },
  });

  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    setCurrent(1);
  }, []);

  const handlePageChange = useCallback((page: number, size: number) => {
    setCurrent(page);
    setPageSize(size);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditing(undefined);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((record: TItem) => {
    setEditing(record);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditing(undefined);
  }, []);

  return {
    list: listQuery.data?.list || [],
    loading: listQuery.isLoading,
    total: listQuery.data?.total || 0,
    current,
    pageSize,
    searchText,
    selectedRowKeys,
    modalOpen,
    editing,
    setSearchText,
    setSelectedRowKeys,
    handleSearch,
    handlePageChange,
    openCreateModal,
    openEditModal,
    closeModal,
    invalidate,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    remove: deleteMutation.mutate,
    batchRemove: batchDeleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBatchDeleting: batchDeleteMutation.isPending,
  };
}
