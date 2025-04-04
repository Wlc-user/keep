import React, { useState, useEffect } from 'react';
import { 
  Card, Input, Select, Button, Tabs, 
  Spin, Table, Space, Tag, Tooltip, 
  Empty, List, Avatar, Typography, Divider, Row, Col, Statistic
} from 'antd';
import { 
  SearchOutlined, FilterOutlined, DownloadOutlined, 
  EyeOutlined, FileOutlined, LikeOutlined, LikeFilled,
  FileTextOutlined, FilePdfOutlined, FileImageOutlined,
  FileZipOutlined, FileUnknownOutlined
} from '@ant-design/icons';
import materialService from '../services/materialService';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

// 定义材料数据接口
interface Material {
  id: number;
  title: string;
  description: string;
  category: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl: string;
  createdBy: string;
  createdAt: string;
  courseId?: number;
  courseName?: string;
  accessLevel: string;
  status: string;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  isLiked?: boolean;
}

// 定义课程数据接口
interface Course {
  id: number;
  name: string;
}

// 定义材料分类接口
interface MaterialCategory {
  id: number;
  name: string;
  description?: string;
  parentCategoryId?: number;
}

// 文件类型图标映射
const fileTypeIcons: Record<string, React.ReactNode> = {
  pdf: <FileOutlined style={{ color: '#ff4d4f' }} />,
  doc: <FileOutlined style={{ color: '#1890ff' }} />,
  docx: <FileOutlined style={{ color: '#1890ff' }} />,
  xls: <FileOutlined style={{ color: '#52c41a' }} />,
  xlsx: <FileOutlined style={{ color: '#52c41a' }} />,
  ppt: <FileOutlined style={{ color: '#fa8c16' }} />,
  pptx: <FileOutlined style={{ color: '#fa8c16' }} />,
  jpg: <FileOutlined style={{ color: '#722ed1' }} />,
  jpeg: <FileOutlined style={{ color: '#722ed1' }} />,
  png: <FileOutlined style={{ color: '#722ed1' }} />,
  mp4: <FileOutlined style={{ color: '#eb2f96' }} />,
  mp3: <FileOutlined style={{ color: '#faad14' }} />,
  default: <FileOutlined />,
};

const StudentMaterialsView: React.FC = () => {
  // 状态定义
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedCourse, setSelectedCourse] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [popularMaterials, setPopularMaterials] = useState<Material[]>([]);
  const [recentMaterials, setRecentMaterials] = useState<Material[]>([]);

  // 加载数据
  useEffect(() => {
    fetchMaterials();
    fetchCategories();
    fetchStudentCourses();
    fetchPopularMaterials();
    fetchRecentMaterials();
  }, []);

  // 当筛选条件变化时，重新加载材料列表
  useEffect(() => {
    fetchMaterials();
  }, [activeTab, searchText, selectedCategory, selectedCourse, currentPage, pageSize]);

  // 获取课程材料
  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize: pageSize,
        search: searchText || undefined,
        category: selectedCategory || undefined,
        courseId: selectedCourse || undefined
      };
      
      const response = await materialService.getMaterials(params);
      setMaterials(response.items);
      setTotal(response.totalCount);
    } catch (error) {
      console.error('获取材料列表失败:', error);
      message.error('获取材料列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取材料分类
  const fetchCategories = async () => {
    try {
      const categories = await materialService.getCategories();
      setCategories(categories);
    } catch (error) {
      console.error('获取材料分类失败:', error);
      message.error('获取材料分类失败');
    }
  };

  // 获取学生选修的课程
  const fetchStudentCourses = async () => {
    try {
      const courses = await materialService.getStudentCourses();
      setEnrolledCourses(courses);
    } catch (error) {
      console.error('获取选修课程失败:', error);
      message.error('获取选修课程失败');
    }
  };

  // 获取热门材料
  const fetchPopularMaterials = async () => {
    try {
      const materials = await materialService.getPopularMaterials(5);
      setPopularMaterials(materials);
    } catch (error) {
      console.error('获取热门材料失败:', error);
    }
  };

  // 获取最新材料
  const fetchRecentMaterials = async () => {
    try {
      const materials = await materialService.getRecentMaterials(5);
      setRecentMaterials(materials);
    } catch (error) {
      console.error('获取最新材料失败:', error);
    }
  };

  // 记录查看次数
  const handleView = async (id) => {
    try {
      await materialService.recordMaterialView(id);
      
      // 更新本地数据
      setMaterials(materials.map(m => 
        m.id === id ? { ...m, viewCount: m.viewCount + 1 } : m
      ));
    } catch (error) {
      console.error('记录查看次数失败:', error);
    }
  };

  // 记录下载次数
  const handleDownload = async (id) => {
    try {
      await materialService.recordMaterialDownload(id);
      
      // 更新本地数据
      setMaterials(materials.map(m => 
        m.id === id ? { ...m, downloadCount: m.downloadCount + 1 } : m
      ));
    } catch (error) {
      console.error('记录下载次数失败:', error);
    }
  };

  // 处理点赞/取消点赞
  const handleLike = async (id, isLiked) => {
    try {
      if (isLiked) {
        await materialService.unlikeMaterial(id);
      } else {
        await materialService.likeMaterial(id);
      }
      
      // 更新本地数据
      setMaterials(materials.map(m => 
        m.id === id ? { 
          ...m, 
          likeCount: isLiked ? m.likeCount - 1 : m.likeCount + 1,
          isLiked: !isLiked 
        } : m
      ));
      
      message.success(isLiked ? '已取消点赞' : '点赞成功');
    } catch (error) {
      console.error('点赞操作失败:', error);
      message.error('操作失败');
    }
  };

  // 格式化文件大小
  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  // 获取文件类型图标
  const getFileTypeIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    return fileTypeIcons[type] || fileTypeIcons.default;
  };

  // 表格列定义
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Material) => (
        <Space>
          <img 
            src={record.thumbnailUrl || '/assets/images/file-thumbnail.png'} 
            alt={text} 
            style={{ width: 30, height: 30, marginRight: 8 }} 
          />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'fileType',
      key: 'fileType',
      width: 80,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 120,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '上传者',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
    },
    {
      title: '课程',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 120,
      render: (text: string) => text || '无',
    },
    {
      title: '下载/查看',
      dataIndex: 'stats',
      key: 'stats',
      width: 120,
      render: (_: any, record: Material) => (
        <span>
          {record.downloadCount} / {record.viewCount}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Material) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleView(record.id)} 
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button 
              type="text" 
              icon={<DownloadOutlined />} 
              onClick={() => handleDownload(record.id)} 
            />
          </Tooltip>
          <Tooltip title={record.isLiked ? '取消点赞' : '点赞'}>
            <Button 
              type="text" 
              icon={record.isLiked ? <LikeFilled /> : <LikeOutlined />} 
              onClick={() => handleLike(record.id, record.isLiked)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="student-materials-view">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={18}>
          <Card title="学习资料库">
            <div style={{ marginBottom: 16 }}>
              <Space size="large" wrap>
                <Input
                  placeholder="搜索材料"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 200 }}
                  prefix={<SearchOutlined />}
                  allowClear
                  onPressEnter={fetchMaterials}
                />
                <Select
                  placeholder="选择分类"
                  style={{ width: 150 }}
                  onChange={setSelectedCategory}
                  allowClear
                >
                  {categories.map(category => (
                    <Option key={category.id} value={category.name}>{category.name}</Option>
                  ))}
                </Select>
                <Select
                  placeholder="选择课程"
                  style={{ width: 200 }}
                  onChange={setSelectedCourse}
                  allowClear
                >
                  {enrolledCourses.map(course => (
                    <Option key={course.id} value={course.id}>{course.name}</Option>
                  ))}
                </Select>
                <Button
                  icon={<FilterOutlined />}
                  onClick={fetchMaterials}
                >
                  筛选
                </Button>
                <Button
                  type={viewMode === 'table' ? 'primary' : 'default'}
                  onClick={() => setViewMode('table')}
                >
                  表格视图
                </Button>
                <Button
                  type={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                >
                  网格视图
                </Button>
              </Space>
            </div>

            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="全部" key="all" />
              <TabPane tab="文档" key="document" />
              <TabPane tab="视频" key="video" />
              <TabPane tab="音频" key="audio" />
              <TabPane tab="图片" key="image" />
              <TabPane tab="其他" key="other" />
            </Tabs>

            <Spin spinning={loading}>
              {viewMode === 'table' ? (
                <Table
                  columns={columns}
                  dataSource={materials}
                  rowKey="id"
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    onChange: (page, pageSize) => {
                      setCurrentPage(page);
                      if (pageSize) setPageSize(pageSize);
                    },
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 项`,
                  }}
                />
              ) : (
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
                  dataSource={materials}
                  renderItem={item => (
                    <List.Item>
                      <Card
                        hoverable
                        cover={
                          <div 
                            style={{ 
                              height: 160, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              background: '#f5f5f5',
                              overflow: 'hidden'
                            }}
                          >
                            <img 
                              alt={item.title} 
                              src={item.thumbnailUrl || '/assets/images/file-thumbnail.png'} 
                              style={{ maxWidth: '100%', maxHeight: '100%' }} 
                            />
                          </div>
                        }
                        actions={[
                          <Tooltip title="查看">
                            <EyeOutlined key="view" onClick={() => handleView(item.id)} />
                          </Tooltip>,
                          <Tooltip title="下载">
                            <DownloadOutlined key="download" onClick={() => handleDownload(item.id)} />
                          </Tooltip>,
                          <Tooltip title={item.isLiked ? '取消点赞' : '点赞'}>
                            {item.isLiked ? 
                              <LikeFilled key="like" onClick={() => handleLike(item.id, item.isLiked)} /> : 
                              <LikeOutlined key="like" onClick={() => handleLike(item.id, item.isLiked)} />
                            }
                          </Tooltip>,
                        ]}
                      >
                        <Card.Meta
                          title={item.title}
                          description={
                            <>
                              <Tag color="blue">{item.fileType}</Tag>
                              <Text type="secondary">{formatFileSize(item.fileSize)}</Text>
                              <br />
                              <Text type="secondary">课程: {item.courseName || '无'}</Text>
                            </>
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    onChange: (page, pageSize) => {
                      setCurrentPage(page);
                      if (pageSize) setPageSize(pageSize);
                    },
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 项`,
                  }}
                />
              )}
              
              {materials.length === 0 && !loading && (
                <Empty description="暂无符合条件的材料" />
              )}
            </Spin>
          </Card>
        </Col>
        
        <Col xs={24} lg={6}>
          <Card title="热门学习资料">
            <List
              itemLayout="horizontal"
              dataSource={popularMaterials}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={getFileTypeIcon(item.fileType)} />
                    }
                    title={<a onClick={() => handleView(item.id)}>{item.title}</a>}
                    description={
                      <>
                        <Tag color="blue">{item.fileType}</Tag>
                        <Text type="secondary"> {formatFileSize(item.fileSize)}</Text>
                        <br />
                        <Space>
                          <Text type="secondary">下载: {item.downloadCount}</Text>
                          <Text type="secondary">查看: {item.viewCount}</Text>
                        </Space>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
          
          <Card title="最新学习资料" style={{ marginTop: 16 }}>
            <List
              itemLayout="horizontal"
              dataSource={recentMaterials}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={getFileTypeIcon(item.fileType)} />
                    }
                    title={<a onClick={() => handleView(item.id)}>{item.title}</a>}
                    description={
                      <>
                        <Tag color="blue">{item.fileType}</Tag>
                        <Text type="secondary"> {formatFileSize(item.fileSize)}</Text>
                        <br />
                        <Text type="secondary">上传日期: {new Date(item.createdAt).toLocaleDateString()}</Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentMaterialsView; 