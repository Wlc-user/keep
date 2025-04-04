import React, { useState, useEffect } from 'react';
import { 
  Card, Tabs, Button, Modal, Form, Input, 
  Upload, Select, message, Spin, 
  Table, Space, Tag, Tooltip, Popconfirm
} from 'antd';
import { 
  UploadOutlined, FileOutlined, PlusOutlined, 
  SearchOutlined, FilterOutlined, DeleteOutlined, 
  EditOutlined, EyeOutlined, DownloadOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import materialService from '../services/materialService';
import { API_BASE_URL } from '../env';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

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

const TeacherMaterialManagement: React.FC = () => {
  // 状态定义
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [teachingCourses, setTeachingCourses] = useState<Course[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedCourse, setSelectedCourse] = useState<number | undefined>(undefined);
  const [fileList, setFileList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isMyMaterials, setIsMyMaterials] = useState(false);

  // 加载数据
  useEffect(() => {
    fetchMaterials();
    fetchCategories();
    fetchTeachingCourses();
  }, [activeTab, searchText, selectedCategory, selectedCourse, currentPage, pageSize, isMyMaterials]);

  // 获取材料列表
  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize: pageSize,
        search: searchText || undefined,
        category: selectedCategory || undefined,
        courseId: selectedCourse || undefined,
        status: activeTab !== 'all' ? activeTab : undefined,
        myMaterials: isMyMaterials || undefined
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

  // 获取教授的课程列表
  const fetchTeachingCourses = async () => {
    try {
      const courses = await materialService.getTeacherCourses();
      setTeachingCourses(courses);
    } catch (error) {
      console.error('获取教授课程列表失败:', error);
      message.error('获取教授课程列表失败');
    }
  };

  // 处理材料上传
  const handleUpload = async (values: any) => {
    try {
      if (fileList.length === 0) {
        message.error('请选择要上传的文件');
        return;
      }

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description || '');
      formData.append('category', values.category || '');
      formData.append('accessLevel', values.accessLevel || 'Private');
      if (values.courseId) {
        formData.append('courseId', values.courseId);
      }
      formData.append('file', fileList[0].originFileObj);

      setLoading(true);
      const response = await materialService.uploadMaterial(formData);

      message.success('材料上传成功，等待审核');
      setUploadModalVisible(false);
      form.resetFields();
      setFileList([]);
      fetchMaterials();
    } catch (error) {
      console.error('材料上传失败:', error);
      message.error('材料上传失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理材料编辑
  const handleEdit = async (values: any) => {
    if (!currentMaterial) return;

    try {
      setLoading(true);
      await materialService.updateMaterial(currentMaterial.id, {
        title: values.title,
        description: values.description,
        category: values.category,
        accessLevel: values.accessLevel,
        courseId: values.courseId,
      });

      message.success('材料更新成功');
      setEditModalVisible(false);
      fetchMaterials();
    } catch (error) {
      console.error('材料更新失败:', error);
      message.error('材料更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理材料删除
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await materialService.deleteMaterial(id);
      message.success('材料删除成功');
      fetchMaterials();
    } catch (error) {
      console.error('材料删除失败:', error);
      message.error('材料删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 文件上传组件属性配置
  const uploadProps: UploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      // 检查文件大小 (100MB)
      if (file.size > 100 * 1024 * 1024) {
        message.error('文件大小不能超过100MB!');
        return Upload.LIST_IGNORE;
      }

      // 设置文件列表
      setFileList([file]);
      return false;
    },
    fileList,
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
      render: (size: number) => {
        if (size < 1024) {
          return `${size} B`;
        } else if (size < 1024 * 1024) {
          return `${(size / 1024).toFixed(2)} KB`;
        } else {
          return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        }
      },
    },
    {
      title: '课程',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 120,
      render: (text: string) => text || '无',
    },
    {
      title: '权限',
      dataIndex: 'accessLevel',
      key: 'accessLevel',
      width: 100,
      render: (text: string) => {
        let color = 'default';
        
        switch (text) {
          case 'Public':
            color = 'green';
            break;
          case 'Course':
            color = 'blue';
            break;
          case 'Teacher':
            color = 'orange';
            break;
          case 'Private':
            color = 'red';
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text: string) => {
        let color = 'default';
        let statusText = text;
        
        switch (text) {
          case 'Pending':
            color = 'gold';
            statusText = '待审核';
            break;
          case 'Approved':
            color = 'green';
            statusText = '已通过';
            break;
          case 'Rejected':
            color = 'red';
            statusText = '已拒绝';
            break;
          case 'Unpublished':
            color = 'default';
            statusText = '已下架';
            break;
        }
        
        return <Tag color={color}>{statusText}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: Material) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => window.open(record.filePath, '_blank')} 
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button 
              type="text" 
              icon={<DownloadOutlined />} 
              onClick={() => window.open(record.filePath, '_blank')} 
            />
          </Tooltip>
          {/* 只显示教师自己上传的材料的编辑和删除按钮 */}
          {isMyMaterials && (
            <>
              <Tooltip title="编辑">
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => showEditModal(record)} 
                />
              </Tooltip>
              <Tooltip title="删除">
                <Popconfirm
                  title="确定要删除这个材料吗？"
                  onConfirm={() => handleDelete(record.id)}
                  okText="是"
                  cancelText="否"
                >
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                  />
                </Popconfirm>
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  // 显示编辑模态框
  const showEditModal = (material: Material) => {
    setCurrentMaterial(material);
    editForm.setFieldsValue({
      title: material.title,
      description: material.description,
      category: material.category,
      accessLevel: material.accessLevel,
      courseId: material.courseId,
    });
    setEditModalVisible(true);
  };

  return (
    <div className="teacher-material-management-page">
      <Card title="教学资料库" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setUploadModalVisible(true)}
          >
            上传材料
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Space size="large" wrap>
            <Input
              placeholder="搜索材料"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
              allowClear
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
              {teachingCourses.map(course => (
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
              type={isMyMaterials ? 'primary' : 'default'}
              onClick={() => setIsMyMaterials(!isMyMaterials)}
            >
              {isMyMaterials ? '我的材料' : '所有可见材料'}
            </Button>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="全部" key="all" />
          <TabPane tab="待审核" key="Pending" />
          <TabPane tab="已通过" key="Approved" />
          <TabPane tab="已拒绝" key="Rejected" />
        </Tabs>

        <Spin spinning={loading}>
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
        </Spin>
      </Card>

      {/* 上传材料模态框 */}
      <Modal
        title="上传教学材料"
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpload}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入材料标题' }]}
          >
            <Input placeholder="请输入材料标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={4} placeholder="请输入材料描述" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
          >
            <Select placeholder="请选择分类">
              {categories.map(category => (
                <Option key={category.id} value={category.name}>{category.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="courseId"
            label="所属课程"
          >
            <Select placeholder="请选择课程">
              {teachingCourses.map(course => (
                <Option key={course.id} value={course.id}>{course.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="accessLevel"
            label="访问权限"
            initialValue="Course"
            rules={[{ required: true, message: '请选择访问权限' }]}
          >
            <Select placeholder="请选择访问权限">
              <Option value="Public">公开 - 所有人可见</Option>
              <Option value="Course">课程 - 仅课程学生可见</Option>
              <Option value="Teacher">教师 - 仅教师可见</Option>
              <Option value="Private">私有 - 仅创建者可见</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="file"
            label="选择文件"
            rules={[{ required: true, message: '请选择要上传的文件' }]}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>
                {fileList.length === 0 ? '选择文件' : '更换文件'}
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => {
                  setUploadModalVisible(false);
                  form.resetFields();
                  setFileList([]);
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                上传
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑材料模态框 */}
      <Modal
        title="编辑材料"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEdit}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入材料标题' }]}
          >
            <Input placeholder="请输入材料标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={4} placeholder="请输入材料描述" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
          >
            <Select placeholder="请选择分类">
              {categories.map(category => (
                <Option key={category.id} value={category.name}>{category.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="courseId"
            label="所属课程"
          >
            <Select placeholder="请选择课程">
              {teachingCourses.map(course => (
                <Option key={course.id} value={course.id}>{course.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="accessLevel"
            label="访问权限"
            rules={[{ required: true, message: '请选择访问权限' }]}
          >
            <Select placeholder="请选择访问权限">
              <Option value="Public">公开 - 所有人可见</Option>
              <Option value="Course">课程 - 仅课程学生可见</Option>
              <Option value="Teacher">教师 - 仅教师可见</Option>
              <Option value="Private">私有 - 仅创建者可见</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherMaterialManagement; 