import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Input, Tag, List, Button, Spin, Empty, type InputRef } from 'antd';
import { SearchOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchArticles, fetchHotSearches } from '@/services/blog/api';
import type { ArticleItem } from '@/services/blog/api';

const SEARCH_HISTORY_KEY = 'sanmoo_search_history';

type Props = {
  visible: boolean;
  onCancel: () => void;
};

const SearchModal: React.FC<Props> = ({ visible, onCancel }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [hotSearches, setHotSearches] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (visible) {
      loadHotSearches();
      loadSearchHistory();
      setTimeout(() => {
        inputRef.current?.input?.focus();
      }, 300);
    } else {
      setSearchText('');
      setSearchResults([]);
      setShowResults(false);
    }
  }, [visible]);

  const loadHotSearches = async () => {
    try {
      const res = await fetchHotSearches();
      setHotSearches(res.data || []);
    } catch (error) {
      console.error('加载热门搜索失败:', error);
    }
  };

  const loadSearchHistory = () => {
    try {
      const history = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('加载搜索历史失败:', error);
    }
  };

  const saveSearchHistory = (keyword: string) => {
    try {
      let history = searchHistory.filter((item) => item !== keyword);
      history = [keyword, ...history].slice(0, 10);
      setSearchHistory(history);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  const handleSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetchArticles({ keyword: keyword.trim(), page: 1, size: 10 });
      setSearchResults(res.data.list || []);
      saveSearchHistory(keyword.trim());
      setShowResults(true);
    } catch (error) {
      console.error('搜索失败:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchText);
    }
  };

  const handleHotSearchClick = (word: string) => {
    setSearchText(word);
    handleSearch(word);
  };

  const handleHistoryClick = (word: string) => {
    setSearchText(word);
    handleSearch(word);
  };

  const handleArticleClick = (article: ArticleItem) => {
    onCancel();
    navigate(`/article/${article.id}`);
  };

  const handleQuickSearch = () => {
    navigate(`/search?keyword=${encodeURIComponent(searchText)}`);
    onCancel();
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      closable={false}
      centered
      width={560}
      styles={{ body: { padding: 0, maxHeight: '70vh', overflowY: 'auto' } }}
      wrapProps={{ style: { top: '10%' } }}
    >
      <div style={{ padding: 20, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SearchOutlined style={{ color: '#8c8c8c', fontSize: 20 }} />
          <Input
            ref={inputRef}
            value={searchText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="搜索文章..."
            style={{ flex: 1, fontSize: 15 }}
            allowClear
          />
          <Button type="primary" onClick={() => handleSearch(searchText)}>
            搜索
          </Button>
          <Button onClick={onCancel}>关闭</Button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      ) : showResults ? (
        <div>
          {searchResults.length > 0 ? (
            <List
              dataSource={searchResults}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  onClick={() => handleArticleClick(item)}
                  style={{ cursor: 'pointer', padding: '12px 20px', borderBottom: '1px solid #f5f5f5' }}
                >
                  <List.Item.Meta
                    title={
                      <span style={{ color: '#1f1f1f', fontSize: 14 }}>{item.title}</span>
                    }
                    description={
                      <span style={{ color: '#999', fontSize: 12 }}>
                        {item.description || '暂无描述'}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="未找到相关文章" style={{ padding: 40 }} />
          )}
          <div style={{ padding: 16, textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
            <Button type="link" onClick={handleQuickSearch}>
              查看完整搜索结果
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ padding: 20 }}>
          {hotSearches.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <FireOutlined style={{ color: '#ff6b6b', marginRight: 6 }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>热门搜索</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {hotSearches.map((word, index) => (
                  <Tag
                    key={word}
                    color={index < 3 ? 'red' : 'orange'}
                    onClick={() => handleHotSearchClick(word)}
                    style={{ cursor: 'pointer', padding: '4px 12px' }}
                  >
              {word}
            </Tag>
                ))}
              </div>
            </div>
          )}

          {searchHistory.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ClockCircleOutlined style={{ color: '#919191', marginRight: 6 }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>搜索历史</span>
                </div>
                <Button
                  type="text"
                  size="small"
                  onClick={clearSearchHistory}
                  style={{ color: '#999', padding: 0 }}
                >
                  清空
                </Button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {searchHistory.map((word) => (
                  <Tag
                    key={word}
                    onClick={() => handleHistoryClick(word)}
                    style={{ cursor: 'pointer', padding: '4px 12px' }}
                  >
                    {word}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default SearchModal;
