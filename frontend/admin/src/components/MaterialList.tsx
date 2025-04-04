import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Button, Space, Tag, Input, Select, Dropdown, 
  Menu, Popconfirm, message, Tooltip, Badge, Modal, Typography, 
  Row, Col, Pagination, Empty
} from 'antd';
import {
  DownloadOutlined, DeleteOutlined, EditOutlined,
  EyeOutlined, ShareAltOutlined, SearchOutlined,
  SortAscendingOutlined, FilterOutlined, ExclamationCircleOutlined,
  FileTextOutlined, FilePdfOutlined, FileImageOutlined, 
  FileExcelOutlined, FilePptOutlined, FileZipOutlined,
  FileUnknownOutlined, FileOutlined, MoreOutlined
} from '@ant-design/icons';
import apiService from '../services/api';
import { formatDate } from '../utils/dateUtils';

const { Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

interface MaterialListProps {
  courseId?: number;
  category?: string;
  isTeacher?: boolean;
  isAdmin?: boolean;
  onEdit?: (material: any) => void;
  onPreview?: (material: any) => void;
}

// 访问级别对应的标签颜色
const ACCESS_LEVEL_COLORS = {
  'Public': 'green',
  'Course': 'blue',
  'Teacher': 'orange',
  'Private': 'red'
};

// 状态对应的标签颜色
const STATUS_COLORS = {
  'Pending': 'orange',
  'Approved': 'green',
  'Rejected': 'red',
  'Unpublished': 'default'
};

// 文件类型图标映射
const getFileTypeIcon = (type: string) => {
  const fileType = (type || '').toLowerCase();
  if (!fileType) return <FileUnknownOutlined />;
  
  if (fileType.includes('pdf')) return <FilePdfOutlined />;
  if (fileType.includes('word') || fileType.includes('doc')) return <FileTextOutlined />;
  if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('xls')) return <FileExcelOutlined />;
  if (fileType.includes('ppt') || fileType.includes('presentation')) return <FilePptOutlined />;
  if (fileType.includes('image')) return <FileImageOutlined />;
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return <FileZipOutlined />;
  if (fileType.includes('text') || fileType.includes('md')) return <FileTextOutlined />;
  
  return <FileOutlined />;
};

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (!bytes) return '未知';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MaterialList: React.FC<MaterialListProps> = ({ 
  courseId, 
  category,
  isTeacher = false,
  isAdmin = false,
  onEdit,
  onPreview
}) => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    searchText: '',
    category: category || '',
    accessLevel: '',
    status: '',
    sortField: 'createdAt',
    sortOrder: 'descend'
  });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<any>(null);

  // 加载素材列表
  const fetchMaterials = async (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      // 构建查询参数
      const params: any = {
        page,
        pageSize,
        ...filters
      };
      
      // 如果有课程ID，添加到查询参数
      if (courseId) {
        params.courseId = courseId;
      }
      
      // 调用API获取素材列表
      const response = await apiService.get('/api/materials', params);
      
      if (response && response.data) {
        setMaterials(response.data.items || []);
        setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: response.data.total || 0
        });
      } else {
        // 如果API请求失败或返回异常，尝试使用模拟数据
        const mockMaterials = generateMockMaterials();
        setMaterials(mockMaterials);
        setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: mockMaterials.length
        });
        console.warn('使用模拟数据: API请求失败或返回异常', response);
      }
    } catch (error) {
      console.error('获取素材列表失败:', error);
      message.error('获取素材列表失败，可能是网络问题或服务器维护中');
      
      // 使用模拟数据作为备选
      const mockMaterials = generateMockMaterials();
      setMaterials(mockMaterials);
      setPagination({
        ...pagination,
        current: page,
        pageSize,
        total: mockMaterials.length
      });
    } finally {
      setLoading(false);
    }
  };

  // 生成模拟数据
  const generateMockMaterials = () => {
    const mockCategories = ['lecture', 'assignment', 'reference', 'video', 'image', 'other'];
    const mockAccessLevels = ['Public', 'Course', 'Teacher', 'Private'];
    const mockStatuses = ['Approved', 'Pending', 'Rejected', 'Unpublished'];
    const mockFileTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.ms-excel',
      'image/jpeg',
      'application/zip',
      'text/plain'
    ];
    
    return Array.from({ length: 20 }, (_, index) => ({
      id: index + 1,
      title: `模拟素材 ${index + 1}`,
      description: `这是一个模拟的素材描述，用于测试素材列表组件的显示效果。素材ID: ${index + 1}`,
      category: mockCategories[Math.floor(Math.random() * mockCategories.length)],
      filePath: `/mock/materials/file_${index + 1}.pdf`,
      fileType: mockFileTypes[Math.floor(Math.random() * mockFileTypes.length)],
      fileSize: Math.floor(Math.random() * 10000000), // 随机文件大小
      thumbnailUrl: `/mock/materials/thumb_${index + 1}.jpg`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: {
        id: Math.floor(Math.random() * 10) + 1,
        name: `用户 ${Math.floor(Math.random() * 10) + 1}`
      },
      accessLevel: mockAccessLevels[Math.floor(Math.random() * mockAccessLevels.length)],
      courseId: courseId || Math.floor(Math.random() * 5) + 1,
      courseName: courseId ? '当前课程' : `课程 ${Math.floor(Math.random() * 5) + 1}`,
      status: mockStatuses[Math.floor(Math.random() * mockStatuses.length)],
      reviewedBy: Math.random() > 0.5 ? {
        id: Math.floor(Math.random() * 5) + 1,
        name: `审核员 ${Math.floor(Math.random() * 5) + 1}`
      } : null,
      reviewedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString() : null,
      reviewComments: Math.random() > 0.5 ? '审核通过，内容符合要求' : null,
      viewCount: Math.floor(Math.random() * 1000),
      downloadCount: Math.floor(Math.random() * 500),
      likeCount: Math.floor(Math.random() * 100)
    }));
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setFilters({
      ...filters,
      searchText: value
    });
    fetchMaterials(1, pagination.pageSize);
  };

  // 处理排序变化
  const handleSortChange = (field: string) => {
    const newSortOrder = filters.sortField === field && filters.sortOrder === 'ascend' ? 'descend' : 'ascend';
    setFilters({
      ...filters,
      sortField: field,
      sortOrder: newSortOrder
    });
    fetchMaterials(1, pagination.pageSize);
  };

  // 处理过滤变化
  const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value
    });
    fetchMaterials(1, pagination.pageSize);
  };

  // 处理分页变化
  const handleTableChange = (page: number, pageSize?: number) => {
    fetchMaterials(page, pageSize || pagination.pageSize);
  };

  // 处理下载素材
  const handleDownload = async (material: any) => {
    try {
      message.loading({ content: '正在准备下载...', key: 'download' });
      
      // 调用API下载素材
      const response = await apiService.get(`/api/materials/${material.id}/download`);
      
      if (response && response.data && response.data.downloadUrl) {
        // 创建一个临时链接并点击它来下载文件
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.target = '_blank';
        link.download = material.title || `material-${material.id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        message.success({ content: '下载已开始!', key: 'download', duration: 2 });
      } else {
        // 如果API没有返回下载链接，尝试使用文件路径
        const fallbackUrl = material.filePath || `/api/materials/${material.id}/file`;
        const link = document.createElement('a');
        link.href = fallbackUrl;
        link.target = '_blank';
        link.download = material.title || `material-${material.id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        message.warning({ content: '使用备用下载方式，如果下载未开始，请联系管理员', key: 'download', duration: 3 });
      }
    } catch (error) {
      console.error('下载素材失败:', error);
      message.error({ content: '下载失败，请稍后重试', key: 'download' });
    }
  };

  // 处理删除素材
  const handleDelete = async (material: any) => {
    try {
      // 调用API删除素材
      await apiService.delete(`/api/materials/${material.id}`);
      message.success(`已删除素材 "${material.title}"`);
      
      // 重新加载素材列表
      fetchMaterials();
    } catch (error) {
      console.error('删除素材失败:', error);
      message.error('删除素材失败，请稍后重试');
    }
  };

  // 处理预览素材
  const handlePreview = (material: any) => {
    setCurrentMaterial(material);
    setPreviewVisible(true);
    
    // 如果有外部预览处理函数，调用它
    if (onPreview) {
      onPreview(material);
    }
  };

  // 处理编辑素材
  const handleEdit = (material: any) => {
    // 如果有外部编辑处理函数，调用它
    if (onEdit) {
      onEdit(material);
    } else {
      // 否则，可以在这里实现默认编辑行为
      message.info('编辑功能尚未实现');
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchMaterials();
  }, [courseId, category]);

  // 表格列定义
  const columns = [
    {
      title: (
        <Space>
          <span>素材标题</span>
          <Button 
            type="text" 
            icon={<SortAscendingOutlined />} 
            size="small"
            onClick={() => handleSortChange('title')}
          />
        </Space>
      ),
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <Space>
          {getFileTypeIcon(record.fileType)}
          <Tooltip title={record.description || text}>
            <a onClick={() => handlePreview(record)}>{text}</a>
          </Tooltip>
          {record.status === 'Pending' && (
            <Badge status="processing" text="" />
          )}
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      filters: [
        { text: '讲义', value: 'lecture' },
        { text: '作业', value: 'assignment' },
        { text: '参考资料', value: 'reference' },
        { text: '视频', value: 'video' },
        { text: '图片', value: 'image' },
        { text: '其他', value: 'other' }
      ],
      render: (category: string) => {
        const categoryMap: Record<string, string> = {
          'lecture': '讲义',
          'assignment': '作业',
          'reference': '参考资料',
          'video': '视频',
          'image': '图片',
          'audio': '音频',
          'code': '代码',
          'other': '其他'
        };
        return categoryMap[category] || category;
      }
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size: number) => formatFileSize(size)
    },
    {
      title: '权限',
      dataIndex: 'accessLevel',
      key: 'accessLevel',
      width: 120,
      filters: [
        { text: '公开', value: 'Public' },
        { text: '课程', value: 'Course' },
        { text: '教师', value: 'Teacher' },
        { text: '私有', value: 'Private' }
      ],
      render: (level: string) => {
        const levelTextMap: Record<string, string> = {
          'Public': '公开',
          'Course': '课程',
          'Teacher': '教师',
          'Private': '私有'
        };
        return <Tag color={ACCESS_LEVEL_COLORS[level as keyof typeof ACCESS_LEVEL_COLORS]}>{levelTextMap[level] || level}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: '待审核', value: 'Pending' },
        { text: '已通过', value: 'Approved' },
        { text: '已拒绝', value: 'Rejected' },
        { text: '未发布', value: 'Unpublished' }
      ],
      render: (status: string) => {
        const statusTextMap: Record<string, string> = {
          'Pending': '待审核',
          'Approved': '已通过',
          'Rejected': '已拒绝',
          'Unpublished': '未发布'
        };
        return <Tag color={STATUS_COLORS[status as keyof typeof STATUS_COLORS]}>{statusTextMap[status] || status}</Tag>;
      }
    },
    {
      title: '上传者',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
      render: (createdBy: any) => createdBy?.name || '未知'
    },
    {
      title: (
        <Space>
          <span>更新时间</span>
          <Button 
            type="text" 
            icon={<SortAscendingOutlined />} 
            size="small"
            onClick={() => handleSortChange('updatedAt')}
          />
        </Space>
      ),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      render: (date: string) => formatDate(date)
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (text: string, record: any) => (
        <Space size="small">
          <Tooltip title="下载">
            <Button 
              type="text" 
              icon={<DownloadOutlined />} 
              onClick={() => handleDownload(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="预览">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handlePreview(record)}
              size="small"
            />
          </Tooltip>
          {/* 只有教师和管理员可以编辑和删除 */}
          {(isTeacher || isAdmin || record.createdBy?.id === 'current-user-id') && (
            <Dropdown overlay={
              <Menu>
                <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                  编辑
                </Menu.Item>
                <Menu.Item key="share" icon={<ShareAltOutlined />}>
                  分享
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                  <Popconfirm
                    title="确定要删除这个素材吗?"
                    onConfirm={() => handleDelete(record)}
                    okText="确定"
                    cancelText="取消"
                    placement="left"
                  >
                    删除
                  </Popconfirm>
                </Menu.Item>
              </Menu>
            }>
              <Button type="text" icon={<MoreOutlined />} size="small" />
            </Dropdown>
          )}
        </Space>
      ),
    },
  ];

  // 素材预览弹窗
  const renderPreviewModal = () => {
    if (!currentMaterial) return null;
    
    // 根据文件类型选择不同的预览方式
    const renderPreviewContent = () => {
      const fileType = (currentMaterial.fileType || '').toLowerCase();
      
      // 图片预览
      if (fileType.includes('image')) {
        return (
          <div style={{ textAlign: 'center' }}>
            <img 
              src={currentMaterial.filePath || currentMaterial.thumbnailUrl} 
              alt={currentMaterial.title}
              style={{ maxWidth: '100%', maxHeight: '500px' }}
            />
          </div>
        );
      }
      
      // PDF预览
      if (fileType.includes('pdf')) {
        return (
          <div style={{ height: '500px', overflow: 'auto' }}>
            <iframe 
              src={currentMaterial.filePath} 
              title={currentMaterial.title}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          </div>
        );
      }
      
      // 默认预览 - 显示素材信息
      return (
        <div>
          <Row gutter={[16, 16]}>
            {currentMaterial.thumbnailUrl && (
              <Col span={6}>
                <img 
                  src={currentMaterial.thumbnailUrl}
                  alt={currentMaterial.title}
                  style={{ maxWidth: '100%' }}
                />
              </Col>
            )}
            <Col span={currentMaterial.thumbnailUrl ? 18 : 24}>
              <div style={{ marginBottom: 16 }}>
                <Title level={4}>{currentMaterial.title}</Title>
                <Text type="secondary">{currentMaterial.description}</Text>
              </div>
              
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>文件类型: </Text>
                  <Text>{currentMaterial.fileType}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>文件大小: </Text>
                  <Text>{formatFileSize(currentMaterial.fileSize)}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>上传者: </Text>
                  <Text>{currentMaterial.createdBy?.name}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>上传时间: </Text>
                  <Text>{formatDate(currentMaterial.createdAt)}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>权限: </Text>
                  <Tag color={ACCESS_LEVEL_COLORS[currentMaterial.accessLevel as keyof typeof ACCESS_LEVEL_COLORS]}>
                    {currentMaterial.accessLevel}
                  </Tag>
                </Col>
                <Col span={12}>
                  <Text strong>状态: </Text>
                  <Tag color={STATUS_COLORS[currentMaterial.status as keyof typeof STATUS_COLORS]}>
                    {currentMaterial.status}
                  </Tag>
                </Col>
                {currentMaterial.reviewedBy && (
                  <>
                    <Col span={12}>
                      <Text strong>审核者: </Text>
                      <Text>{currentMaterial.reviewedBy.name}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>审核时间: </Text>
                      <Text>{formatDate(currentMaterial.reviewedAt)}</Text>
                    </Col>
                  </>
                )}
                {currentMaterial.reviewComments && (
                  <Col span={24}>
                    <Text strong>审核意见: </Text>
                    <Text>{currentMaterial.reviewComments}</Text>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>
          
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Space>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(currentMaterial)}
              >
                下载文件
              </Button>
              {(isTeacher || isAdmin || currentMaterial.createdBy?.id === 'current-user-id') && (
                <Button 
                  icon={<EditOutlined />}
                  onClick={() => {
                    setPreviewVisible(false);
                    handleEdit(currentMaterial);
                  }}
                >
                  编辑信息
                </Button>
              )}
            </Space>
          </div>
        </div>
      );
    };
    
    return (
      <Modal
        title={
          <Space>
            {getFileTypeIcon(currentMaterial.fileType)}
            <span>{currentMaterial.title}</span>
          </Space>
        }
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {renderPreviewContent()}
      </Modal>
    );
  };

  return (
    <Card 
      title="学习素材" 
      className="material-list"
      extra={
        <Space size="middle">
          <Select 
            placeholder="分类筛选" 
            style={{ width: 150 }}
            allowClear
            value={filters.category || undefined}
            onChange={(value) => handleFilterChange('category', value)}
          >
            <Option value="">全部分类</Option>
            <Option value="lecture">讲义</Option>
            <Option value="assignment">作业</Option>
            <Option value="reference">参考资料</Option>
            <Option value="video">视频</Option>
            <Option value="image">图片</Option>
            <Option value="other">其他</Option>
          </Select>
          <Search 
            placeholder="搜索素材" 
            onSearch={handleSearch}
            style={{ width: 200 }}
            allowClear
          />
        </Space>
      }
    >
      <Table 
        dataSource={materials} 
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
        locale={{
          emptyText: (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description="暂无素材" 
            />
          )
        }}
      />
      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Pagination 
          current={pagination.current} 
          pageSize={pagination.pageSize}
          total={pagination.total}
          showTotal={(total) => `共 ${total} 项`}
          onChange={handleTableChange}
          showSizeChanger
          showQuickJumper
        />
      </div>
      
      {renderPreviewModal()}
    </Card>
  );
};

export default MaterialList; 