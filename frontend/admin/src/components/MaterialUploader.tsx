import React, { useState } from 'react';
import { 
  Upload, Button, message, Progress, Form, 
  Input, Select, Checkbox, Card, Divider, Row, Col, Space 
} from 'antd';
import { 
  UploadOutlined, FileOutlined, FileTextOutlined, 
  FileImageOutlined, FilePdfOutlined, FileUnknownOutlined 
} from '@ant-design/icons';
import type { UploadFile, UploadProps, UploadChangeParam } from 'antd/es/upload/interface';
import apiService from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

interface MaterialUploaderProps {
  courseId?: number;
  onSuccess?: (material: any) => void;
  maxSize?: number; // 单位: MB
  acceptTypes?: string;
}

// 素材分类选项
const CATEGORY_OPTIONS = [
  { value: 'lecture', label: '讲义' },
  { value: 'assignment', label: '作业' },
  { value: 'reference', label: '参考资料' },
  { value: 'video', label: '视频' },
  { value: 'image', label: '图片' },
  { value: 'audio', label: '音频' },
  { value: 'code', label: '代码' },
  { value: 'other', label: '其他' }
];

// 访问级别选项
const ACCESS_LEVEL_OPTIONS = [
  { value: 'Public', label: '公开 - 所有人可见' },
  { value: 'Course', label: '课程 - 仅课程学生可见' },
  { value: 'Teacher', label: '教师 - 仅教师可见' },
  { value: 'Private', label: '私有 - 仅创建者可见' }
];

// 文件类型图标映射
const getFileTypeIcon = (type: string) => {
  const fileType = type.toLowerCase();
  if (fileType.includes('image')) return <FileImageOutlined />;
  if (fileType.includes('pdf')) return <FilePdfOutlined />;
  if (fileType.includes('word') || fileType.includes('document')) return <FileTextOutlined />;
  if (fileType.includes('text') || fileType.includes('md')) return <FileTextOutlined />;
  return <FileOutlined />;
};

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MaterialUploader: React.FC<MaterialUploaderProps> = ({ 
  courseId, 
  onSuccess, 
  maxSize = 50, // 默认最大50MB
  acceptTypes = "*"
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);

  // 处理上传状态变化
  const handleChange = (info: UploadChangeParam) => {
    let newFileList = [...info.fileList];
    
    // 限制只能上传一个文件
    newFileList = newFileList.slice(-1);
    
    // 如果文件上传成功，获取服务器返回的url
    newFileList = newFileList.map(file => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
    
    setFileList(newFileList);
  };

  // 上传前校验
  const beforeUpload = (file: File) => {
    // 文件大小校验
    const isLimitSize = file.size / 1024 / 1024 < maxSize;
    if (!isLimitSize) {
      message.error(`文件必须小于 ${maxSize}MB!`);
      return Upload.LIST_IGNORE;
    }
    
    // 自动设置标题为文件名(不含扩展名)
    const fileName = file.name.split('.')[0];
    form.setFieldsValue({ title: fileName });
    
    // 自动设置文件类型
    const fileType = file.type || 'application/octet-stream';
    form.setFieldsValue({ fileType });
    
    // 自动设置文件大小
    form.setFieldsValue({ fileSize: file.size });
    
    return true;
  };

  // 自定义上传处理
  const customUpload = async (options: any) => {
    const { onSuccess, onError, onProgress, file } = options;
    
    // 表单验证
    try {
      await form.validateFields();
    } catch (error) {
      message.error('请填写必要的信息!');
      return;
    }
    
    // 获取表单数据
    const formValues = form.getFieldsValue();
    
    // 创建FormData对象
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', formValues.title);
    formData.append('description', formValues.description || '');
    formData.append('category', formValues.category);
    formData.append('accessLevel', formValues.accessLevel);
    if (courseId) {
      formData.append('courseId', courseId.toString());
    } else if (formValues.courseId) {
      formData.append('courseId', formValues.courseId.toString());
    }
    
    setUploading(true);
    setProgress(0);
    
    try {
      // 使用apiService上传文件
      const response = await apiService.upload('/api/materials/upload', formData, (percent) => {
        setProgress(Math.round(percent));
        onProgress({ percent: Math.round(percent) });
      });
      
      setUploading(false);
      message.success('文件上传成功!');
      onSuccess(response);
      
      // 清空表单和文件列表
      form.resetFields();
      setFileList([]);
      
      // 如果有成功回调，调用它
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('上传失败:', error);
      setUploading(false);
      message.error('文件上传失败');
      onError(error);
    }
  };

  // 上传组件属性
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    beforeUpload,
    customRequest: customUpload,
    onChange: handleChange,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: false,
    },
    accept: acceptTypes,
    progress: {
      strokeColor: {
        '0%': '#108ee9',
        '100%': '#87d068',
      },
      strokeWidth: 3,
      format: (percent) => `${parseFloat(percent.toFixed(2))}%`,
    },
  };

  return (
    <Card className="material-uploader" title="上传学习素材">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          accessLevel: 'Private',
          category: 'other'
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="title"
              label="素材标题"
              rules={[{ required: true, message: '请输入素材标题' }]}
            >
              <Input placeholder="请输入素材标题" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="素材分类"
              rules={[{ required: true, message: '请选择素材分类' }]}
            >
              <Select placeholder="请选择素材分类">
                {CATEGORY_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="description"
          label="素材描述"
        >
          <TextArea rows={3} placeholder="请输入素材描述" />
        </Form.Item>
        
        <Form.Item
          name="accessLevel"
          label="访问权限"
          rules={[{ required: true, message: '请选择访问权限' }]}
        >
          <Select placeholder="请选择访问权限">
            {ACCESS_LEVEL_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        {!courseId && (
          <Form.Item
            name="courseId"
            label="关联课程"
          >
            <Select placeholder="请选择关联课程" allowClear>
              <Option value={null}>无</Option>
              {/* 这里可以动态加载课程列表 */}
            </Select>
          </Form.Item>
        )}
        
        <Form.Item
          name="file"
          label="上传文件"
          required
        >
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />} disabled={uploading || fileList.length > 0}>
              选择文件
            </Button>
            <div className="upload-hint" style={{ marginTop: 8, color: '#888' }}>
              支持各种格式文件，单个文件大小不超过{maxSize}MB
            </div>
          </Upload>
        </Form.Item>
        
        {/* 隐藏字段用于存储文件信息 */}
        <Form.Item name="fileType" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="fileSize" hidden>
          <Input />
        </Form.Item>
        
        {uploading && (
          <div style={{ marginTop: 16 }}>
            <Progress percent={progress} status="active" />
          </div>
        )}
        
        <Divider />
        
        <Form.Item style={{ marginBottom: 0 }}>
          <Space>
            <Button 
              type="primary" 
              disabled={fileList.length === 0} 
              loading={uploading}
              onClick={() => customUpload({
                file: fileList[0].originFileObj,
                onSuccess: () => {},
                onError: () => {},
                onProgress: () => {}
              })}
            >
              {uploading ? '上传中...' : '上传素材'}
            </Button>
            <Button onClick={() => {
              form.resetFields();
              setFileList([]);
            }}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default MaterialUploader; 