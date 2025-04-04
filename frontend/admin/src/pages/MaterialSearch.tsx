import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Input, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Divider, 
  List, 
  Space, 
  Button, 
  Tabs, 
  Select, 
  Empty, 
  Tooltip, 
  Dropdown, 
  Menu, 
  Badge, 
  Skeleton,
  Result
} from 'antd';
import { 
  SearchOutlined, 
  FileOutlined, 
  VideoCameraOutlined, 
  AudioOutlined, 
  PictureOutlined, 
  FilterOutlined, 
  ClockCircleOutlined, 
  HistoryOutlined, 
  DeleteOutlined, 
  SortAscendingOutlined, 
  DownOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { MaterialType, AdvancedSearchParams } from '../types/material';
import { advancedSearchMaterials } from '../services/materialService';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

// 样式化组件
const SearchContainer = styled.div`
  padding: 24px;
`;

const SearchHeader = styled.div`
  margin-bottom: 24px;
`;

const SearchResultsContainer = styled.div`
  margin-top: 24px;
`;

const TagContainer = styled.div`
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const MaterialSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('categories');
  const [materialType, setMaterialType] = useState<MaterialType | ''>('');
  const [sortBy, setSortBy] = useState('relevance');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 从本地存储加载最近搜索
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches).slice(0, 5));
    }

    // 模拟流行标签
    setPopularTags([
      '数学', '物理', '化学', '生物', '历史', '地理', 
      '政治', '英语', '语文', '编程', '人工智能', '机器学习',
      '数据分析', '微积分', '统计学', '经济学', '心理学'
    ]);

    // 模拟初始加载一些热门素材
    fetchInitialMaterials();
  }, []);

  const fetchInitialMaterials = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 模拟API调用延迟
      setTimeout(async () => {
        const response = await advancedSearchMaterials({
          sortBy: 'viewCount',
          sortOrder: 'desc',
          page: 1,
          pageSize: 8
        });
        
        setSearchResults(response.items || []);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('获取热门素材失败', err);
      setError('获取热门素材失败，请稍后重试');
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      if (value.trim().length >= 2) {
        // 生成搜索建议
        generateSuggestions(value);
      } else {
        setSearchSuggestions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchValue);
  }, [searchValue, debouncedSearch]);

  const generateSuggestions = (query: string) => {
    // 模拟搜索建议
    const suggestions = [
      `${query} 基础教程`,
      `${query} 进阶教程`,
      `${query} 实践案例`,
      `${query} 考试题`,
      `最新 ${query} 资料`
    ];
    
    setSearchSuggestions(suggestions);
  };

  const handleSearch = async (value: string) => {
    if (!value.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 保存到最近搜索
      const newRecentSearches = [value, ...recentSearches.filter(s => s !== value)].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
      
      // 执行搜索
      const params: AdvancedSearchParams = {
        keyword: value,
        page: 1,
        pageSize: 12
      };
      
      if (materialType) {
        params.type = materialType as MaterialType;
      }
      
      if (sortBy === 'latest') {
        params.sortBy = 'createdAt';
        params.sortOrder = 'desc';
      } else if (sortBy === 'popular') {
        params.sortBy = 'viewCount';
        params.sortOrder = 'desc';
      }
      
      // 模拟API调用延迟
      setTimeout(async () => {
        const response = await advancedSearchMaterials(params);
        setSearchResults(response.items || []);
        setIsLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('搜索失败', err);
      setError('搜索失败，请稍后重试');
      setIsLoading(false);
    } finally {
      setShowSuggestions(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchFocus = () => {
    if (searchValue.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    // 延迟关闭，让用户有时间点击建议
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleClearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchValue(suggestion);
    handleSearch(suggestion);
  };

  const handleTagClick = (tag: string) => {
    setSearchValue(tag);
    handleSearch(tag);
  };

  const handleMaterialTypeChange = (value: MaterialType | '') => {
    setMaterialType(value);
    if (searchValue) {
      handleSearch(searchValue);
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    if (searchValue) {
      handleSearch(searchValue);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleViewMaterial = (id: string) => {
    navigate(`/material/${id}`);
  };

  const renderTypeIcon = (type: MaterialType) => {
    switch (type) {
      case MaterialType.DOCUMENT:
        return <FileOutlined />;
      case MaterialType.VIDEO:
        return <VideoCameraOutlined />;
      case MaterialType.AUDIO:
        return <AudioOutlined />;
      case MaterialType.IMAGE:
        return <PictureOutlined />;
      default:
        return <FileOutlined />;
    }
  };

  const renderPopularTags = () => {
    return (
      <TagContainer>
        {popularTags.map(tag => (
          <Tag 
            key={tag} 
            color="blue" 
            style={{ cursor: 'pointer' }}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </Tag>
        ))}
      </TagContainer>
    );
  };

  const renderSearchHistory = () => {
    if (recentSearches.length === 0) {
      return <Empty description="暂无搜索历史" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text strong>最近搜索</Text>
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            size="small" 
            onClick={handleClearHistory}
          >
            清除历史
          </Button>
        </div>
        {recentSearches.map((search, index) => (
          <HistoryItem key={index}>
            <Space>
              <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
              <Text style={{ cursor: 'pointer' }} onClick={() => handleSuggestionClick(search)}>
                {search}
              </Text>
            </Space>
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              size="small"
              onClick={() => {
                const newHistory = [...recentSearches];
                newHistory.splice(index, 1);
                setRecentSearches(newHistory);
                localStorage.setItem('recentSearches', JSON.stringify(newHistory));
              }}
            />
          </HistoryItem>
        ))}
      </div>
    );
  };

  const renderSearchResults = () => {
    if (error) {
      return (
        <Result
          status="error"
          title="搜索出错"
          subTitle={error}
          extra={[
            <Button type="primary" key="retry" icon={<ReloadOutlined />} onClick={() => searchValue ? handleSearch(searchValue) : fetchInitialMaterials()}>
              重试
            </Button>
          ]}
        />
      );
    }

    if (isLoading) {
      return (
        <Row gutter={[24, 24]}>
          {Array(8).fill(0).map((_, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card>
                <Skeleton loading active avatar paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      );
    }

    if (searchResults.length === 0) {
      return <Empty description="没有找到相关素材" />;
    }

    return (
      <Row gutter={[24, 24]}>
        {searchResults.map(material => (
          <Col xs={24} sm={12} md={8} lg={6} key={material.id}>
            <Card
              hoverable
              cover={
                <div style={{ 
                  height: 140, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: '#f0f2f5'
                }}>
                  {renderTypeIcon(material.type)}
                </div>
              }
              onClick={() => handleViewMaterial(material.id)}
            >
              <Badge.Ribbon 
                text={material.type.charAt(0).toUpperCase() + material.type.slice(1)} 
                color={material.type === MaterialType.VIDEO ? 'red' : material.type === MaterialType.AUDIO ? 'blue' : material.type === MaterialType.IMAGE ? 'green' : 'orange'}
              >
                <Card.Meta
                  title={material.title}
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" ellipsis>{material.description}</Text>
                      <div>
                        {material.tags?.slice(0, 3).map(tag => (
                          <Tag key={tag} style={{ marginTop: 8 }}>{tag}</Tag>
                        ))}
                      </div>
                    </Space>
                  }
                />
              </Badge.Ribbon>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <SearchContainer>
      <SearchHeader>
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Title level={2}>素材搜索</Title>
            <Paragraph>在线学习系统提供丰富的学习素材，您可以按类型、关键词等进行搜索和筛选</Paragraph>
          </Col>
        </Row>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <div style={{ position: 'relative' }}>
              <Search
                placeholder="搜索素材、知识点、课程等"
                enterButton={<span><SearchOutlined /> 搜索</span>}
                size="large"
                value={searchValue}
                onChange={handleSearchInputChange}
                onSearch={handleSearch}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                allowClear
              />
              {showSuggestions && searchSuggestions.length > 0 && (
                <Card 
                  style={{ 
                    position: 'absolute', 
                    top: 40, 
                    width: '100%', 
                    zIndex: 10,
                    boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <List
                    size="small"
                    bordered={false}
                    dataSource={searchSuggestions}
                    renderItem={item => (
                      <List.Item 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => handleSuggestionClick(item)}
                      >
                        <SearchOutlined style={{ marginRight: 8 }} />{item}
                      </List.Item>
                    )}
                  />
                </Card>
              )}
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Space style={{ width: '100%' }}>
              <Select
                placeholder="素材类型"
                style={{ width: '50%' }}
                onChange={handleMaterialTypeChange}
                value={materialType}
                allowClear
              >
                <Option value={MaterialType.VIDEO}>视频</Option>
                <Option value={MaterialType.AUDIO}>音频</Option>
                <Option value={MaterialType.DOCUMENT}>文档</Option>
                <Option value={MaterialType.IMAGE}>图片</Option>
                <Option value={MaterialType.OTHER}>其他</Option>
              </Select>
              <Select
                placeholder="排序方式"
                style={{ width: '50%' }}
                onChange={handleSortChange}
                value={sortBy}
              >
                <Option value="relevance">相关性</Option>
                <Option value="latest">最新</Option>
                <Option value="popular">最受欢迎</Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </SearchHeader>
      
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="分类浏览" key="categories">
          <div>{renderPopularTags()}</div>
        </TabPane>
        <TabPane 
          tab={
            <span>
              <HistoryOutlined />
              搜索历史
            </span>
          } 
          key="history"
        >
          <div>{renderSearchHistory()}</div>
        </TabPane>
      </Tabs>
      
      <Divider />
      
      <SearchResultsContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text strong>
            {searchValue ? `"${searchValue}" 的搜索结果` : '热门素材推荐'}
          </Text>
          <Space>
            <Text type="secondary">
              {!isLoading && `共 ${searchResults.length} 个结果`}
            </Text>
          </Space>
        </div>
        
        {renderSearchResults()}
      </SearchResultsContainer>
    </SearchContainer>
  );
};

// 防抖函数
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default MaterialSearch; 