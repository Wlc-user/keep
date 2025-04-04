import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, InputNumber, Upload, Switch, Card, Typography, Space, message, Row, Col, Divider } from 'antd';
import { PlusOutlined, UploadOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import apiService from '../services/apiService';
import PageHeader from '../components/PageHeader';
import './CourseForm.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Course {
  id?: number;
  title: string;
  shortDescription: string;
  description: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  credits: number;
  categoryId?: number;
  courseCode: string;
  price: number;
  isFree: boolean;
  status: string;
  learningObjectives: string[];
}

interface CourseCategory {
  id: number;
  name: string;
  description: string;
  parentCategoryId?: number;
}

const CourseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState<string>('');
  
  // 判断是编辑还是新建
  const isEditing = !!id;
  
  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchCourse();
    }
  }, [id]);
  
  const fetchCategories = async () => {
    try {
      const response = await apiService.courses.getCategories();
      setCategories(response || []);
    } catch (error) {
      console.error('获取课程分类失败:', error);
      message.error('获取课程分类失败');
    }
  };
  
  const fetchCourse = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const courseId = parseInt(id);
      const response = await apiService.courses.getById(courseId);
      
      setCourse(response);
      setObjectives(response.learningObjectives || []);
      
      // 设置表单初始值
      form.setFieldsValue({
        title: response.title,
        shortDescription: response.shortDescription,
        description: response.description,
        courseCode: response.courseCode,
        credits: response.credits,
        categoryId: response.categoryId,
        price: response.price,
        isFree: response.isFree,
        status: response.status,
        dateRange: response.startDate && response.endDate 
          ? [moment(response.startDate), moment(response.endDate)] 
          : undefined
      });
      
      // 设置封面图片
      if (response.coverImage) {
        setFileList([
          {
            uid: '-1',
            name: 'cover-image.jpg',
            status: 'done',
            url: response.coverImage,
          }
        ]);
      }
    } catch (error) {
      console.error('获取课程数据失败:', error);
      message.error('获取课程数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      
      // 处理表单数据
      const dateRange = values.dateRange;
      const formData: Partial<Course> = {
        title: values.title,
        shortDescription: values.shortDescription,
        description: values.description,
        startDate: dateRange ? dateRange[0].format('YYYY-MM-DD') : '',
        endDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : '',
        credits: values.credits,
        categoryId: values.categoryId,
        courseCode: values.courseCode,
        price: values.isFree ? 0 : values.price,
        isFree: values.isFree,
        status: values.status,
        learningObjectives: objectives
      };
      
      // 处理封面图片
      if (fileList.length > 0 && fileList[0].originFileObj) {
        // 如果有新上传的图片，需要先上传图片，获取URL
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);
        
        // 上传图片
        const uploadResponse = await apiService.uploads.uploadFile(formData);
        formData.coverImage = uploadResponse.url;
      } else if (fileList.length > 0 && fileList[0].url) {
        // 使用已有的图片URL
        formData.coverImage = fileList[0].url;
      }
      
      let response;
      if (isEditing && id) {
        // 更新课程
        response = await apiService.courses.update(parseInt(id), formData);
        message.success('课程更新成功');
      } else {
        // 创建课程
        response = await apiService.courses.create(formData);
        message.success('课程创建成功');
      }
      
      // 导航到课程详情页
      if (response && response.id) {
        navigate(`/courses/${response.id}`);
      } else {
        navigate('/courses');
      }
    } catch (error) {
      console.error('保存课程失败:', error);
      message.error('保存课程失败');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    if (isEditing && id) {
      navigate(`/courses/${id}`);
    } else {
      navigate('/courses');
    }
  };
  
  // 处理图片上传
  const handleImageChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };
  
  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传JPG/PNG格式的图片!');
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
    }
    
    // 返回false阻止自动上传，我们将在表单提交时手动处理上传
    return false;
  };
  
  // 处理学习目标的添加和删除
  const addObjective = () => {
    if (newObjective.trim() === '') {
      message.warning('学习目标不能为空');
      return;
    }
    
    setObjectives([...objectives, newObjective.trim()]);
    setNewObjective('');
  };
  
  const removeObjective = (index: number) => {
    const newObjectives = [...objectives];
    newObjectives.splice(index, 1);
    setObjectives(newObjectives);
  };
  
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传封面</div>
    </div>
  );
  
  return (
    <div className="course-form-container">
      <PageHeader 
        title={
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleCancel}
              type="text"
            />
            {isEditing ? '编辑课程' : '创建课程'}
          </Space>
        }
      />
      
      <Card loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'Draft',
            credits: 3,
            isFree: false,
            price: 0
          }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={16}>
              <Title level={4}>基本信息</Title>
              
              <Form.Item
                name="title"
                label="课程标题"
                rules={[{ required: true, message: '请输入课程标题' }]}
              >
                <Input placeholder="请输入课程标题" maxLength={100} />
              </Form.Item>
              
              <Form.Item
                name="shortDescription"
                label="简短描述"
                rules={[{ required: true, message: '请输入简短描述' }]}
              >
                <Input placeholder="简短描述将显示在课程列表中" maxLength={200} />
              </Form.Item>
              
              <Form.Item
                name="description"
                label="详细描述"
                rules={[{ required: true, message: '请输入详细描述' }]}
              >
                <TextArea 
                  placeholder="详细介绍课程内容、适合人群、教学方式等" 
                  rows={6} 
                />
              </Form.Item>
              
              <Title level={4} style={{ marginTop: 24 }}>学习目标</Title>
              <Text type="secondary">添加学习目标，帮助学生了解课程能学到什么</Text>
              
              <div className="objectives-container">
                {objectives.map((objective, index) => (
                  <div key={index} className="objective-item">
                    <Text>{objective}</Text>
                    <Button 
                      type="text" 
                      danger 
                      onClick={() => removeObjective(index)}
                    >
                      删除
                    </Button>
                  </div>
                ))}
                
                <div className="add-objective">
                  <Input 
                    placeholder="输入学习目标" 
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    onPressEnter={addObjective}
                    style={{ width: '70%' }}
                  />
                  <Button 
                    type="primary" 
                    onClick={addObjective}
                  >
                    添加目标
                  </Button>
                </div>
              </div>
            </Col>
            
            <Col xs={24} lg={8}>
              <Card title="课程设置" className="settings-card">
                <Form.Item
                  name="courseCode"
                  label="课程编码"
                  rules={[{ required: true, message: '请输入课程编码' }]}
                >
                  <Input placeholder="例如：MATH101" />
                </Form.Item>
                
                <Form.Item
                  name="categoryId"
                  label="课程分类"
                >
                  <Select placeholder="选择课程分类">
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>{category.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="dateRange"
                  label="课程时间"
                  rules={[{ required: true, message: '请选择课程时间范围' }]}
                >
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
                
                <Form.Item
                  name="credits"
                  label="学分"
                  rules={[{ required: true, message: '请输入课程学分' }]}
                >
                  <InputNumber min={0} max={10} style={{ width: '100%' }} />
                </Form.Item>
                
                <Form.Item
                  name="status"
                  label="课程状态"
                  rules={[{ required: true, message: '请选择课程状态' }]}
                >
                  <Select>
                    <Option value="Draft">草稿</Option>
                    <Option value="Published">已发布</Option>
                    <Option value="Archived">已归档</Option>
                  </Select>
                </Form.Item>
                
                <Divider />
                
                <Form.Item
                  name="isFree"
                  valuePropName="checked"
                  label="免费课程"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  name="price"
                  label="课程价格"
                  rules={[{ required: true, message: '请输入课程价格' }]}
                  dependencies={['isFree']}
                >
                  <InputNumber 
                    min={0} 
                    style={{ width: '100%' }} 
                    precision={2} 
                    formatter={value => `¥ ${value}`} 
                    parser={value => value!.replace(/¥\s?/g, '')}
                    disabled={form.getFieldValue('isFree')}
                  />
                </Form.Item>
                
                <Divider />
                
                <Form.Item
                  label="课程封面"
                >
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleImageChange}
                    beforeUpload={beforeUpload}
                    maxCount={1}
                  >
                    {fileList.length >= 1 ? null : uploadButton}
                  </Upload>
                  <Text type="secondary">推荐尺寸：800 x 450像素，JPG/PNG格式</Text>
                </Form.Item>
              </Card>
            </Col>
          </Row>
          
          <Divider />
          
          <div className="form-actions">
            <Space size="middle">
              <Button onClick={handleCancel}>取消</Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={submitting}
              >
                {isEditing ? '更新课程' : '创建课程'}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CourseForm; 