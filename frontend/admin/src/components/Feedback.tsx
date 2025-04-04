import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Rate, 
  Radio, 
  Upload, 
  Typography, 
  Space, 
  message, 
  Modal,
  Divider
} from 'antd';
import { 
  CommentOutlined, 
  BulbOutlined, 
  BugOutlined, 
  QuestionOutlined,
  UploadOutlined,
  SmileOutlined,
  SendOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

// 反馈类型
export type FeedbackType = 'suggestion' | 'bug' | 'question' | 'praise';

// 反馈接口
export interface FeedbackData {
  type: FeedbackType;
  content: string;
  satisfaction?: number;
  email?: string;
  screenshots?: File[];
  systemInfo?: {
    browser: string;
    os: string;
    screenSize: string;
    url: string;
  };
}

interface FeedbackProps {
  onSubmit?: (data: FeedbackData) => Promise<void>;
  position?: 'fixed' | 'inline';
  title?: string;
  subtitle?: string;
  showSatisfaction?: boolean;
  showEmail?: boolean;
  showScreenshot?: boolean;
  maxScreenshots?: number;
  className?: string;
  style?: React.CSSProperties;
}

const FeedbackContainer = styled.div<{ position: string }>`
  ${props => props.position === 'fixed' ? `
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 1000;
  ` : `
    width: 100%;
  `}
`;

const FeedbackButton = styled(Button)`
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--box-shadow-base);
  background-color: var(--primary-color, #1890ff);
  border-color: var(--primary-color, #1890ff);
  
  &:hover, &:focus {
    background-color: var(--primary-color-hover, #40a9ff);
    border-color: var(--primary-color-hover, #40a9ff);
  }
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    background-color: var(--primary-color, #177ddc);
    border-color: var(--primary-color, #177ddc);
    
    &:hover, &:focus {
      background-color: var(--primary-color-hover, #1f8ced);
      border-color: var(--primary-color-hover, #1f8ced);
    }
  }
`;

const FeedbackIcon = styled(CommentOutlined)`
  font-size: 24px;
  color: #fff;
`;

const FeedbackModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 8px;
    overflow: hidden;
  }
  
  .ant-modal-header {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border-color, #f0f0f0);
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      border-bottom: 1px solid var(--border-color, #303030);
    }
  }
  
  .ant-modal-title {
    font-weight: 600;
    color: var(--heading-color, #262626);
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      color: var(--heading-color, #e6e6e6);
    }
  }
  
  .ant-modal-body {
    padding: 24px;
  }
  
  .ant-modal-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--border-color, #f0f0f0);
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      border-top: 1px solid var(--border-color, #303030);
    }
  }
`;

const FeedbackForm = styled(Form)`
  .ant-form-item-label > label {
    color: var(--heading-color, #262626);
    font-weight: 500;
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      color: var(--heading-color, #e6e6e6);
    }
  }
`;

const FeedbackTypeButton = styled(Radio.Button)<{ feedbackType: string; activeType: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80px;
  width: 100%;
  border-radius: 4px;
  transition: all 0.3s;
  
  ${props => props.feedbackType === props.activeType ? `
    background-color: var(--primary-color-bg, rgba(24, 144, 255, 0.1));
    border-color: var(--primary-color, #1890ff);
    color: var(--primary-color, #1890ff);
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      background-color: var(--primary-color-bg, rgba(23, 125, 220, 0.1));
      border-color: var(--primary-color, #177ddc);
      color: var(--primary-color, #177ddc);
    }
  ` : `
    background-color: var(--component-background, #ffffff);
    border-color: var(--border-color, #d9d9d9);
    color: var(--text-color, #434343);
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      background-color: var(--component-background, #1f1f1f);
      border-color: var(--border-color, #434343);
      color: var(--text-color, #d9d9d9);
    }
  `}
  
  &:hover {
    background-color: var(--primary-color-bg, rgba(24, 144, 255, 0.1));
    border-color: var(--primary-color, #1890ff);
    color: var(--primary-color, #1890ff);
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      background-color: var(--primary-color-bg, rgba(23, 125, 220, 0.1));
      border-color: var(--primary-color, #177ddc);
      color: var(--primary-color, #177ddc);
    }
  }
  
  .anticon {
    font-size: 24px;
    margin-bottom: 8px;
  }
`;

const SuccessContainer = styled.div`
  text-align: center;
  padding: 24px 0;
`;

const SuccessIcon = styled(SmileOutlined)`
  font-size: 64px;
  color: var(--success-color, #52c41a);
  margin-bottom: 16px;
`;

/**
 * 反馈组件
 * 用于收集用户反馈
 */
const Feedback: React.FC<FeedbackProps> = ({
  onSubmit,
  position = 'fixed',
  title = '反馈与建议',
  subtitle = '我们非常重视您的反馈，它将帮助我们不断改进产品',
  showSatisfaction = true,
  showEmail = true,
  showScreenshot = true,
  maxScreenshots = 3,
  className,
  style,
}) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<FeedbackType>('suggestion');
  const [submitted, setSubmitted] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  
  // 打开反馈表单
  const showFeedback = () => {
    setVisible(true);
    setSubmitted(false);
    form.resetFields();
    setFileList([]);
  };
  
  // 关闭反馈表单
  const closeFeedback = () => {
    setVisible(false);
  };
  
  // 处理反馈类型变更
  const handleTypeChange = (e: any) => {
    setActiveType(e.target.value);
  };
  
  // 处理文件上传变更
  const handleFileChange = ({ fileList }: any) => {
    setFileList(fileList.slice(0, maxScreenshots));
  };
  
  // 处理文件上传前检查
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片必须小于5MB!');
      return false;
    }
    
    return false; // 阻止自动上传
  };
  
  // 获取系统信息
  const getSystemInfo = () => {
    return {
      browser: navigator.userAgent,
      os: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      url: window.location.href,
    };
  };
  
  // 提交反馈
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 构建反馈数据
      const feedbackData: FeedbackData = {
        type: activeType,
        content: values.content,
        systemInfo: getSystemInfo(),
      };
      
      // 添加可选字段
      if (showSatisfaction && values.satisfaction) {
        feedbackData.satisfaction = values.satisfaction;
      }
      
      if (showEmail && values.email) {
        feedbackData.email = values.email;
      }
      
      if (showScreenshot && fileList.length > 0) {
        feedbackData.screenshots = fileList.map((file: any) => file.originFileObj);
      }
      
      // 调用提交回调
      if (onSubmit) {
        await onSubmit(feedbackData);
      } else {
        // 模拟提交
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setSubmitted(true);
      message.success('感谢您的反馈！');
      
    } catch (error) {
      console.error('提交反馈失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 渲染反馈类型选项
  const renderFeedbackTypes = () => {
    const types = [
      { key: 'suggestion', label: '建议', icon: <BulbOutlined /> },
      { key: 'bug', label: '问题', icon: <BugOutlined /> },
      { key: 'question', label: '咨询', icon: <QuestionOutlined /> },
      { key: 'praise', label: '表扬', icon: <SmileOutlined /> },
    ];
    
    return (
      <Radio.Group 
        value={activeType} 
        onChange={handleTypeChange} 
        style={{ width: '100%' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {types.map(type => (
            <FeedbackTypeButton 
              key={type.key} 
              value={type.key} 
              feedbackType={type.key} 
              activeType={activeType}
            >
              {type.icon}
              <span>{type.label}</span>
            </FeedbackTypeButton>
          ))}
        </div>
      </Radio.Group>
    );
  };
  
  // 渲染成功状态
  const renderSuccess = () => {
    return (
      <SuccessContainer>
        <SuccessIcon />
        <Title level={4}>感谢您的反馈！</Title>
        <Paragraph>
          我们已收到您的反馈，您的意见对我们非常重要。
          我们会认真考虑每一条反馈，并不断改进产品。
        </Paragraph>
        <Button type="primary" onClick={closeFeedback}>
          关闭
        </Button>
      </SuccessContainer>
    );
  };
  
  // 渲染反馈表单
  const renderFeedbackForm = () => {
    return (
      <FeedbackForm
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="type"
          label="反馈类型"
          initialValue={activeType}
        >
          {renderFeedbackTypes()}
        </Form.Item>
        
        <Form.Item
          name="content"
          label="反馈内容"
          rules={[{ required: true, message: '请输入反馈内容' }]}
        >
          <TextArea 
            placeholder={
              activeType === 'suggestion' ? '请描述您的建议...' :
              activeType === 'bug' ? '请描述您遇到的问题，包括复现步骤...' :
              activeType === 'question' ? '请描述您的疑问...' :
              '请分享您的使用体验...'
            }
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
        </Form.Item>
        
        {showSatisfaction && (
          <Form.Item
            name="satisfaction"
            label="满意度评分"
          >
            <Rate allowHalf />
          </Form.Item>
        )}
        
        {showEmail && (
          <Form.Item
            name="email"
            label="联系邮箱（选填）"
            rules={[
              { 
                type: 'email', 
                message: '请输入有效的邮箱地址' 
              }
            ]}
          >
            <Input placeholder="请留下您的邮箱，方便我们回复您" />
          </Form.Item>
        )}
        
        {showScreenshot && (
          <Form.Item
            name="screenshots"
            label="上传截图（选填）"
            extra={`最多上传${maxScreenshots}张图片，每张不超过5MB`}
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={beforeUpload}
              multiple
              accept="image/*"
            >
              {fileList.length >= maxScreenshots ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        )}
        
        <Divider />
        
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={closeFeedback}>
              取消
            </Button>
            <Button 
              type="primary" 
              onClick={handleSubmit} 
              loading={loading}
              icon={<SendOutlined />}
            >
              提交反馈
            </Button>
          </Space>
        </Form.Item>
      </FeedbackForm>
    );
  };
  
  return (
    <FeedbackContainer position={position} className={className} style={style}>
      {position === 'fixed' && (
        <FeedbackButton 
          type="primary" 
          shape="circle" 
          onClick={showFeedback}
          aria-label="提供反馈"
        >
          <FeedbackIcon />
        </FeedbackButton>
      )}
      
      {position === 'inline' && (
        <div>
          <Title level={4}>{title}</Title>
          {subtitle && <Paragraph type="secondary">{subtitle}</Paragraph>}
          {renderFeedbackForm()}
        </div>
      )}
      
      <FeedbackModal
        title={title}
        open={visible && position === 'fixed'}
        footer={null}
        onCancel={closeFeedback}
        width={600}
        destroyOnClose
      >
        {subtitle && <Paragraph type="secondary" style={{ marginBottom: 24 }}>{subtitle}</Paragraph>}
        {submitted ? renderSuccess() : renderFeedbackForm()}
      </FeedbackModal>
    </FeedbackContainer>
  );
};

export default Feedback; 