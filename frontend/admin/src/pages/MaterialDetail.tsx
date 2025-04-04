import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Divider,
  Typography,
  Tabs,
  Table,
  Modal,
  Form,
  Switch,
  message,
  Tooltip,
  Breadcrumb,
  Row,
  Col,
  Statistic,
  Avatar,
  List,
  Input,
  Spin,
  Empty,
  Skeleton
} from 'antd';
import {
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  StarOutlined,
  StarFilled,
  EyeOutlined,
  LockOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  PictureOutlined,
  FileOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TagsOutlined,
  FolderOutlined
} from '@ant-design/icons';
import { 
  Material, 
  MaterialType, 
  MaterialStatus,
  PermissionType,
  RoleType,
  MaterialPermission
} from '../types/material';
import { 
  getMaterials, 
  getMaterial as getMaterialById, 
  updateMaterial, 
  deleteMaterial, 
  getMaterialPermissions,
  updateMaterialPermissions,
  checkMaterialAccess,
  advancedSearchMaterials
} from '../services/materialService';
import { useAppContext } from '../contexts/AppContext';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  datetime: string;
}

const MaterialDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);
  const [materialPermissions, setMaterialPermissions] = useState<MaterialPermission[]>([]);
  const [permissionsForm] = Form.useForm();
  const [isFavorite, setIsFavorite] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentValue, setCommentValue] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [canView, setCanView] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [relatedMaterials, setRelatedMaterials] = useState<Material[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  // 获取素材详情
  const fetchMaterialDetail = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const materialData = await getMaterialById(id);
      setMaterial(materialData);
      
      // 更新浏览次数
      setViewCount((materialData.viewCount || 0) + 1);
      
      // 检查是否收藏
      const favorites = JSON.parse(localStorage.getItem('materialFavorites') || '[]');
      setIsFavorite(favorites.includes(id));
      
      // 检查权限
      const [viewAccess, downloadAccess, editAccess, deleteAccess, manageAccess] = await Promise.all([
        checkMaterialAccess(id, PermissionType.VIEW),
        checkMaterialAccess(id, PermissionType.DOWNLOAD),
        checkMaterialAccess(id, PermissionType.EDIT),
        checkMaterialAccess(id, PermissionType.DELETE),
        checkMaterialAccess(id, PermissionType.MANAGE)
      ]);
      
      setCanView(viewAccess);
      setCanDownload(downloadAccess);
      setCanEdit(editAccess);
      setCanDelete(deleteAccess);
      setCanManage(manageAccess);
      
      // 记录到最近查看
      const recentViewed = JSON.parse(localStorage.getItem('materialRecentViewed') || '[]');
      const updatedRecentViewed = [
        materialData,
        ...recentViewed.filter((item: Material) => item.id !== materialData.id)
      ].slice(0, 10);
      localStorage.setItem('materialRecentViewed', JSON.stringify(updatedRecentViewed));
      
      // 模拟评论数据
      setComments([
        {
          id: '1',
          author: '张老师',
          avatar: 'https://joeschmoe.io/api/v1/random',
          content: '这是一个非常好的学习资料，推荐给大家！',
          datetime: '2023-05-15 14:30'
        },
        {
          id: '2',
          author: '李同学',
          avatar: 'https://joeschmoe.io/api/v1/random',
          content: '谢谢分享，对我的学习很有帮助。',
          datetime: '2023-05-16 09:45'
        }
      ]);
      
      // 获取相关素材
      fetchRelatedMaterials(materialData);
    } catch (error) {
      message.error('获取素材详情失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 获取相关素材
  const fetchRelatedMaterials = useCallback(async (currentMaterial: Material) => {
    try {
      setRelatedLoading(true);
      // 获取相关素材
      const response = await advancedSearchMaterials({
        categoryId: currentMaterial.categoryId,
        tags: currentMaterial.tags,
        page: 1,
        pageSize: 4
      });
      
      // 过滤掉当前素材
      const filteredMaterials = response.items.filter(item => item.id !== currentMaterial.id);
      setRelatedMaterials(filteredMaterials);
    } catch (error) {
      console.error('获取相关素材失败', error);
    } finally {
      setRelatedLoading(false);
    }
  }, []);

  // 获取素材权限
  const fetchMaterialPermissions = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // 获取素材权限
      const permissions = await getMaterialPermissions(id);
      
      // 转换为表单需要的格式
      const formattedPermissions = Object.values(RoleType).map(role => ({
        roleId: role,
        roleName: getRoleName(role),
        permissions: permissions.filter(p => p.includes(role))
      }));
      
      setMaterialPermissions(formattedPermissions);
      
      // 设置表单初始值
      const initialValues: any = {};
      formattedPermissions.forEach(p => {
        Object.values(PermissionType).forEach(type => {
          initialValues[`${p.roleId}_${type}`] = p.permissions.includes(type);
        });
      });
      
      permissionsForm.setFieldsValue(initialValues);
    } catch (error) {
      message.error('获取权限信息失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, permissionsForm]);

  useEffect(() => {
    fetchMaterialDetail();
  }, [id, fetchMaterialDetail]);

  // 处理权限设置
  const handleOpenPermissions = async () => {
    if (!canManage) {
      message.error('您没有管理此素材权限的权限');
      return;
    }
    
    await fetchMaterialPermissions();
    setPermissionsModalVisible(true);
  };

  // 保存权限设置
  const handleSavePermissions = async () => {
    if (!id) return;
    
    try {
      const values = permissionsForm.getFieldsValue();
      
      // 转换为API需要的格式
      const permissions = Object.values(RoleType).map(role => {
        const rolePermissions = Object.values(PermissionType)
          .filter(type => values[`${role}_${type}`])
          .map(type => type);
        
        return {
          roleId: role,
          permissions: rolePermissions
        };
      });
      
      await updateMaterialPermissions(id, permissions);
      message.success('权限设置已保存');
      setPermissionsModalVisible(false);
    } catch (error) {
      message.error('保存权限设置失败');
      console.error(error);
    }
  };

  // 处理删除
  const handleDelete = async () => {
    if (!id) return;
    
    if (!canDelete) {
      message.error('您没有删除此素材的权限');
      return;
    }
    
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个素材吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteMaterial(id);
          message.success('删除成功');
          navigate('/material');
        } catch (error) {
          message.error('删除失败');
          console.error(error);
        }
      }
    });
  };

  // 处理下载
  const handleDownload = () => {
    if (!material) return;
    
    if (!canDownload) {
      message.error('您没有下载此素材的权限');
      return;
    }
    
    // 模拟下载
    message.success(`正在下载: ${material.title}`);
  };

  // 处理编辑
  const handleEdit = () => {
    if (!id) return;
    
    if (!canEdit) {
      message.error('您没有编辑此素材的权限');
      return;
    }
    
    navigate(`/material/edit/${id}`);
  };

  // 处理收藏
  const handleToggleFavorite = () => {
    if (!id) return;
    
    const favorites = JSON.parse(localStorage.getItem('materialFavorites') || '[]');
    
    if (isFavorite) {
      const updatedFavorites = favorites.filter((favId: string) => favId !== id);
      localStorage.setItem('materialFavorites', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
      message.success('已取消收藏');
    } else {
      const updatedFavorites = [...favorites, id];
      localStorage.setItem('materialFavorites', JSON.stringify(updatedFavorites));
      setIsFavorite(true);
      message.success('已添加到收藏');
    }
  };

  // 处理分享
  const handleShare = () => {
    if (!material) return;
    
    // 复制链接到剪贴板
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      message.success('链接已复制到剪贴板');
    });
  };

  // 处理预览
  const handlePreview = () => {
    if (!canView) {
      message.error('您没有查看此素材的权限');
      return;
    }
    
    setPreviewVisible(true);
  };

  // 提交评论
  const handleSubmitComment = () => {
    if (!commentValue.trim()) {
      return;
    }
    
    const newComment: Comment = {
      id: Date.now().toString(),
      author: user?.name || '匿名用户',
      avatar: user?.avatar || 'https://joeschmoe.io/api/v1/random',
      content: commentValue,
      datetime: new Date().toLocaleString()
    };
    
    setComments([...comments, newComment]);
    setCommentValue('');
    message.success('评论已提交');
  };

  // 获取角色名称
  const getRoleName = (role: string): string => {
    const roleNames: Record<string, string> = {
      [RoleType.ADMIN]: '管理员',
      [RoleType.TEACHER]: '教师',
      [RoleType.STUDENT]: '学生',
      [RoleType.GUEST]: '访客'
    };
    return roleNames[role] || role;
  };

  // 获取权限名称
  const getPermissionName = (permission: string): string => {
    const permissionNames: Record<string, string> = {
      [PermissionType.VIEW]: '查看',
      [PermissionType.DOWNLOAD]: '下载',
      [PermissionType.EDIT]: '编辑',
      [PermissionType.DELETE]: '删除',
      [PermissionType.APPROVE]: '审核',
      [PermissionType.MANAGE]: '管理'
    };
    return permissionNames[permission] || permission;
  };

  // 获取素材类型图标
  const getTypeIcon = (type?: MaterialType) => {
    if (!type) return <FileOutlined />;
    
    switch (type) {
      case MaterialType.VIDEO:
        return <VideoCameraOutlined />;
      case MaterialType.AUDIO:
        return <SoundOutlined />;
      case MaterialType.DOCUMENT:
        return <FileTextOutlined />;
      case MaterialType.IMAGE:
        return <PictureOutlined />;
      default:
        return <FileOutlined />;
    }
  };

  // 获取状态标签
  const getStatusTag = (status?: MaterialStatus) => {
    if (!status) return null;
    
    const statusColors = {
      [MaterialStatus.DRAFT]: 'default',
      [MaterialStatus.PENDING]: 'processing',
      [MaterialStatus.APPROVED]: 'success',
      [MaterialStatus.REJECTED]: 'error',
    };
    
    const statusText = {
      [MaterialStatus.DRAFT]: '草稿',
      [MaterialStatus.PENDING]: '待审核',
      [MaterialStatus.APPROVED]: '已通过',
      [MaterialStatus.REJECTED]: '已拒绝',
    };
    
    return <Tag color={statusColors[status]}>{statusText[status]}</Tag>;
  };

  // 使用useMemo计算文件大小显示
  const formattedSize = useMemo(() => {
    if (!material) return '';
    
    if (material.size < 1024) {
      return `${material.size} B`;
    } else if (material.size < 1024 * 1024) {
      return `${(material.size / 1024).toFixed(2)} KB`;
    } else if (material.size < 1024 * 1024 * 1024) {
      return `${(material.size / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(material.size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  }, [material]);

  // 使用useMemo计算文件扩展名
  const fileExtension = useMemo(() => {
    if (!material?.url) return '';
    
    const parts = material.url.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
  }, [material]);

  // 使用useMemo优化预览内容渲染
  const renderPreviewContent = useMemo(() => {
    if (!material) return null;
    
    switch (material.type) {
      case MaterialType.IMAGE:
        return (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <img 
              src={material.url} 
              alt={material.title} 
              style={{ maxWidth: '100%', maxHeight: '400px' }} 
            />
          </div>
        );
      case MaterialType.VIDEO:
        return (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <video 
              controls 
              style={{ maxWidth: '100%', maxHeight: '400px' }}
            >
              <source src={material.url} />
              您的浏览器不支持视频播放
            </video>
          </div>
        );
      case MaterialType.AUDIO:
        return (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <audio controls style={{ width: '100%' }}>
              <source src={material.url} />
              您的浏览器不支持音频播放
            </audio>
          </div>
        );
      case MaterialType.DOCUMENT:
        return (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>文档预览功能正在开发中</p>
            <Button icon={<DownloadOutlined />} onClick={handleDownload}>
              下载查看
            </Button>
          </div>
        );
      default:
        return (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <FileOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            <p>无法预览此类型文件</p>
            <Button icon={<DownloadOutlined />} onClick={handleDownload}>
              下载查看
            </Button>
          </div>
        );
    }
  }, [material, handleDownload]);

  // 增强相关素材渲染
  const renderRelatedMaterials = () => {
    if (relatedLoading) {
      return (
        <Row gutter={[16, 16]}>
          {Array(4).fill(0).map((_, index) => (
            <Col span={12} key={index}>
              <Card>
                <Skeleton loading active avatar paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      );
    }
    
    if (relatedMaterials.length === 0) {
      return <Empty description="暂无相关素材" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    
    return (
      <Row gutter={[16, 16]}>
        {relatedMaterials.map(item => (
          <Col span={12} key={item.id}>
            <Card
              hoverable
              size="small"
              onClick={() => navigate(`/material/${item.id}`)}
            >
              <Card.Meta
                avatar={
                  <Avatar 
                    icon={getTypeIcon(item.type)} 
                    style={{ backgroundColor: item.type === MaterialType.VIDEO ? '#f56a00' : item.type === MaterialType.AUDIO ? '#1890ff' : item.type === MaterialType.IMAGE ? '#52c41a' : '#722ed1' }}
                  />
                }
                title={item.title}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" ellipsis>{item.description}</Text>
                    <div>
                      {item.tags?.slice(0, 2).map(tag => (
                        <Tag key={tag} style={{ marginTop: 4 }}>{tag}</Tag>
                      ))}
                    </div>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!material) {
    return (
      <Empty description="未找到素材" />
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/dashboard"><HomeOutlined /> 首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/material">素材中心</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{material.title}</Breadcrumb.Item>
      </Breadcrumb>
      
      <Card>
        <Row gutter={16}>
          <Col span={18}>
            <Title level={3}>
              {getTypeIcon(material.type)} {material.title} {getStatusTag(material.status)}
            </Title>
            <Space size={16} style={{ marginBottom: 16 }}>
              <Text type="secondary">
                <UserOutlined style={{ marginRight: 4 }} />
                上传者: {material.uploaderName}
              </Text>
              <Text type="secondary">
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                上传时间: {material.createdAt}
              </Text>
              <Text type="secondary">
                <FolderOutlined style={{ marginRight: 4 }} />
                分类: {material.categoryName}
              </Text>
              <Text type="secondary">
                <EyeOutlined style={{ marginRight: 4 }} />
                浏览次数: {viewCount}
              </Text>
              <Text type="secondary">
                <DownloadOutlined style={{ marginRight: 4 }} />
                下载次数: {material.downloadCount || 0}
              </Text>
            </Space>
            
            {material.tags && material.tags.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <TagsOutlined style={{ marginRight: 8 }} />
                {material.tags.map(tag => (
                  <Tag key={tag} color="blue">{tag}</Tag>
                ))}
              </div>
            )}
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                type="primary" 
                icon={<EyeOutlined />} 
                onClick={handlePreview}
                disabled={!canView}
              >
                预览
              </Button>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={handleDownload}
                disabled={!canDownload}
              >
                下载
              </Button>
              <Button 
                icon={isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />} 
                onClick={handleToggleFavorite}
              >
                {isFavorite ? '已收藏' : '收藏'}
              </Button>
              <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                分享
              </Button>
              <Tooltip title="权限设置">
                <Button 
                  icon={<LockOutlined />} 
                  onClick={handleOpenPermissions}
                  disabled={!canManage}
                />
              </Tooltip>
              <Tooltip title="编辑">
                <Button 
                  icon={<EditOutlined />} 
                  onClick={handleEdit}
                  disabled={!canEdit}
                />
              </Tooltip>
              <Tooltip title="删除">
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={handleDelete}
                  disabled={!canDelete}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
        
        <Divider />
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "info",
              label: "素材信息",
              children: (
                <Row gutter={24}>
                  <Col span={16}>
                    <Card title="素材描述" variant="outlined">
                      <Paragraph>{material.description}</Paragraph>
                    </Card>
                    
                    {material.type === MaterialType.VIDEO && (
                      <Card title="视频预览" style={{ marginTop: 16 }} variant="outlined">
                        <div style={{ background: '#f0f2f5', padding: 16, textAlign: 'center' }}>
                          <Text>视频预览区域</Text>
                        </div>
                      </Card>
                    )}
                    
                    {material.type === MaterialType.IMAGE && (
                      <Card title="图片预览" style={{ marginTop: 16 }} variant="outlined">
                        <div style={{ background: '#f0f2f5', padding: 16, textAlign: 'center' }}>
                          <Text>图片预览区域</Text>
                        </div>
                      </Card>
                    )}
                    
                    {material.type === MaterialType.DOCUMENT && (
                      <Card title="文档预览" style={{ marginTop: 16 }} variant="outlined">
                        <div style={{ background: '#f0f2f5', padding: 16, textAlign: 'center' }}>
                          <Text>文档预览区域</Text>
                        </div>
                      </Card>
                    )}
                  </Col>
                  
                  <Col span={8}>
                    <Card title="素材详情" variant="outlined">
                      <Descriptions column={1}>
                        <Descriptions.Item label="ID">{material.id}</Descriptions.Item>
                        <Descriptions.Item label="文件名">{material.filename}</Descriptions.Item>
                        <Descriptions.Item label="文件大小">{formattedSize}</Descriptions.Item>
                        <Descriptions.Item label="文件类型">{fileExtension}</Descriptions.Item>
                        <Descriptions.Item label="创建时间">{material.createdAt}</Descriptions.Item>
                        <Descriptions.Item label="更新时间">{material.updatedAt}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                    
                    <Card title="统计信息" style={{ marginTop: 16 }} variant="outlined">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic title="浏览次数" value={viewCount} prefix={<EyeOutlined />} />
                        </Col>
                        <Col span={12}>
                          <Statistic title="下载次数" value={material.downloadCount || 0} prefix={<DownloadOutlined />} />
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              )
            },
            {
              key: "comments",
              label: "评论",
              children: (
                <Card variant="outlined">
                  <List
                    className="comment-list"
                    header={`${comments.length} 条评论`}
                    itemLayout="horizontal"
                    dataSource={comments}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar src={item.avatar} alt={item.author} />}
                          title={<span>{item.author}</span>}
                          description={
                            <div>
                              <div>{item.content}</div>
                              <div style={{ color: '#8c8c8c', fontSize: '12px', marginTop: '8px' }}>{item.datetime}</div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                  
                  <Divider />
                  
                  <div>
                    <Form.Item>
                      <TextArea 
                        rows={4} 
                        value={commentValue} 
                        onChange={e => setCommentValue(e.target.value)} 
                        placeholder="添加评论..."
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button 
                        htmlType="submit" 
                        type="primary" 
                        onClick={handleSubmitComment}
                        disabled={!commentValue.trim()}
                      >
                        提交评论
                      </Button>
                    </Form.Item>
                  </div>
                </Card>
              )
            },
            {
              key: "related",
              label: "相关素材",
              children: (
                <Card variant="outlined">
                  {renderRelatedMaterials()}
                </Card>
              )
            }
          ]}
        />
      </Card>
      
      {/* 权限设置模态框 */}
      <Modal
        title={`权限设置 - ${material.title}`}
        open={permissionsModalVisible}
        onCancel={() => setPermissionsModalVisible(false)}
        onOk={handleSavePermissions}
        width={700}
      >
        <Form
          form={permissionsForm}
          layout="vertical"
        >
          <div style={{ marginBottom: 16 }}>
            <Tooltip title="权限说明">
              <InfoCircleOutlined style={{ marginRight: 8 }} />
            </Tooltip>
            <span>设置不同角色对此素材的访问权限</span>
          </div>
          
          <Table
            dataSource={Object.values(RoleType).map(role => ({
              key: role,
              role: getRoleName(role),
              roleId: role
            }))}
            pagination={false}
            rowKey="key"
          >
            <Table.Column title="角色" dataIndex="role" key="role" />
            
            {Object.values(PermissionType).map(permission => (
              <Table.Column
                title={getPermissionName(permission)}
                key={permission}
                render={(_, record: any) => (
                  <Form.Item
                    name={`${record.roleId}_${permission}`}
                    valuePropName="checked"
                    style={{ margin: 0 }}
                  >
                    <Switch size="small" />
                  </Form.Item>
                )}
              />
            ))}
          </Table>
        </Form>
      </Modal>
      
      {/* 预览模态框 */}
      <Modal
        title={`预览 - ${material.title}`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ textAlign: 'center', padding: 24 }}>
          {renderPreviewContent}
        </div>
      </Modal>
    </div>
  );
};

export default MaterialDetail; 