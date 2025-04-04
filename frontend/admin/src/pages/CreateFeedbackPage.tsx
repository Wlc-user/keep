import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Upload, 
  message, 
  Typography, 
  Space,
  Divider,
  Alert,
  Breadcrumb
} from 'antd';
import { 
  PlusOutlined, 
  UploadOutlined, 
  HomeOutlined, 
  CommentOutlined, 
  SendOutlined,
  LinkOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import * as feedbackService from '../services/feedbackService';
import PageHeader from '../components/PageHeader';
import { useAppContext } from '../contexts/AppContext';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * 创建反馈页面
 */
const CreateFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [form] = Form.useForm();
  const [types, setTypes] = useState<any[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentResource, setCurrentResource] = useState<string | null>(null);

  // 添加引用来跟踪组件挂载状态
  const isMounted = useRef(true);
  
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    
    if (userRole !== 'student') {
      message.error('只有学生可以提交反馈');
      navigate('/dashboard');
      return;
    }

    // 加载反馈类型
    loadFeedbackTypes();
    
    // 检查是否有当前资源上下文
    checkCurrentResource();
    
    // 组件卸载时清理
    return () => {
      isMounted.current = false;
      feedbackService.cleanupFeedbackRequests();
    };
  }, []);

  // 加载反馈类型
  const loadFeedbackTypes = async () => {
    try {
      const types = await feedbackService.getFeedbackTypes();
      
      if (isMounted.current) {
        // 转换为前端需要的格式
        const typeOptions = types.map(type => ({
          value: type,
          label: type
        }));
        setTypes(typeOptions);
        setIsLoading(false);
      }
    } catch (error) {
      if (isMounted.current) {
        if (error instanceof Error && error.name !== 'CanceledError') {
          message.error('加载反馈类型失败');
          console.error(error);
        } else {
          console.log('反馈类型请求已取消');
        }
        setIsLoading(false);
      }
    }
  };

  // 检查当前资源上下文
  const checkCurrentResource = () => {
    // 从URL或全局状态获取当前资源信息
    const params = new URLSearchParams(window.location.search);
    const resourceId = params.get('resourceId');
    const resourceType = params.get('resourceType');
    const resourceUrl = params.get('resourceUrl');
    
    if (resourceId && resourceType) {
      setCurrentResource(`${resourceType}:${resourceId}`);
      
      // 自动填充表单中的资源信息
      form.setFieldsValue({
        resourceIdentifier: `${resourceType}:${resourceId}`,
        resourceUrl: resourceUrl || undefined
      });
    }
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // 添加表单字段
      formData.append('title', values.title);
      formData.append('content', values.content);
      formData.append('feedbackType', values.feedbackType);
      formData.append('priority', values.priority || 'Normal');
      
      if (values.resourceIdentifier) {
        formData.append('resourceIdentifier', values.resourceIdentifier);
      }
      
      if (values.resourceUrl) {
        formData.append('resourceUrl', values.resourceUrl);
      }
      
      // 添加附件
      fileList.forEach(file => {
        formData.append('attachments', file.originFileObj);
      });
      
      // 提交表单
      const response = await feedbackService.createFeedback(formData);
      
      if (isMounted.current) {
        message.success('反馈提交成功！');
        
        // 跳转到反馈详情页面
        navigate(`/feedback/${response.id}`);
      }
    } catch (error) {
      if (isMounted.current) {
        if (error instanceof Error && error.name !== 'CanceledError') {
          message.error('提交反馈失败');
          console.error(error);
        } else {
          console.log('提交反馈请求已取消');
        }
      }
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="create-feedback-page">
      <PageHeader
        title="提交新反馈"
        subtitle="提出问题、报告错误或建议改进"
        icon={<CommentOutlined />}
      />
      
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item href="/dashboard">
          <HomeOutlined />
          <span>首页</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/my-feedback">
          <CommentOutlined />
          <span>我的反馈</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>提交新反馈</Breadcrumb.Item>
      </Breadcrumb>
      
      <Card loading={isLoading}>
        {currentResource && (
          <Alert
            message="您正在对特定资源提交反馈"
            description="系统已自动关联您当前浏览的资源，这将帮助我们更快地解决您的问题。"
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: 24 }}
          />
        )}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            feedbackType: 'LearningQuestion',
          }}
        >
          <Form.Item
            name="title"
            label="反馈标题"
            rules={[{ required: true, message: '请输入反馈标题' }]}
          >
            <Input placeholder="请简明扼要地描述您的问题或建议" maxLength={100} />
          </Form.Item>
          
          <Form.Item
            name="feedbackType"
            label="反馈类型"
            rules={[{ required: true, message: '请选择反馈类型' }]}
          >
            <Select placeholder="选择反馈类型">
              {types.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="content"
            label="详细描述"
            rules={[{ required: true, message: '请详细描述您的问题或建议' }]}
          >
            <TextArea 
              placeholder="请详细描述您遇到的问题或提出的建议，包括相关步骤、错误信息等..." 
              rows={6} 
              maxLength={2000} 
              showCount
            />
          </Form.Item>
          
          <Form.Item
            name="attachments"
            label="附件"
            extra="您可以上传截图、视频或其他相关文件，最多5个文件，每个不超过10MB"
          >
            <Upload
              listType="picture"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList }) => setFileList(fileList)}
              multiple
              maxCount={5}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
          
          <Divider orientation="left" plain>资源关联（选填）</Divider>
          
          <Form.Item
            name="resourceIdentifier"
            label="关联资源标识符"
            extra="如果您的反馈与特定课程、视频、练习题等资源相关，可以填写资源标识符"
          >
            <Input placeholder="例如：course:123, video:456, exercise:789" />
          </Form.Item>
          
          <Form.Item
            name="resourceUrl"
            label="资源链接"
            extra="您可以填写与反馈相关的资源链接"
          >
            <Input prefix={<LinkOutlined />} placeholder="https://..." />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                icon={<SendOutlined />}
              >
                提交反馈
              </Button>
              <Button onClick={() => navigate('/my-feedback')}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
        
        <Divider />
        
        <Paragraph type="secondary">
          <Title level={5}>提交反馈提示</Title>
          <ul>
            <li>请尽可能详细地描述您遇到的问题或建议，这有助于我们更快地理解和解决。</li>
            <li>如果是技术问题，请提供相关的错误信息、截图以及重现步骤。</li>
            <li>如果是学习问题，请明确指出您不理解的概念或需要进一步解释的内容。</li>
            <li>您的反馈将由专业教师或管理员处理，我们会尽快回复。</li>
          </ul>
        </Paragraph>
      </Card>
    </div>
  );
};

export default CreateFeedbackPage; 