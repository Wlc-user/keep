import React, { useState } from 'react';
import { Card, Typography, Space, Divider, Radio, InputNumber, Switch, message, Tag } from 'antd';
import { CloudUploadOutlined, FileOutlined } from '@ant-design/icons';
import ChunkUploader from '../components/common/ChunkUploader';
import { formatFileSize } from '../utils/fileUtils';

const { Title, Text, Paragraph } = Typography;

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  uploadTime: Date;
}

const MaterialUpload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [chunkSize, setChunkSize] = useState(2 * 1024 * 1024); // 默认2MB
  const [autoUpload, setAutoUpload] = useState(true);
  const [resumable, setResumable] = useState(true);
  const [fileType, setFileType] = useState<'all' | 'image' | 'document' | 'video'>('all');
  
  // 文件类型对应的accept属性
  const fileTypeMap = {
    all: undefined,
    image: 'image/*',
    document: '.doc,.docx,.pdf,.txt,.xls,.xlsx,.ppt,.pptx',
    video: 'video/*',
  };
  
  // 处理上传成功
  const handleUploadSuccess = (file: UploadedFile) => {
    setUploadedFiles(prev => [file, ...prev]);
    message.success(`文件 ${file.name} 上传成功`);
  };
  
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>素材上传</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={4}>上传设置</Title>
          
          <Space>
            <Text>分片大小：</Text>
            <Radio.Group 
              value={chunkSize} 
              onChange={e => setChunkSize(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value={1 * 1024 * 1024}>1MB</Radio.Button>
              <Radio.Button value={2 * 1024 * 1024}>2MB</Radio.Button>
              <Radio.Button value={5 * 1024 * 1024}>5MB</Radio.Button>
              <Radio.Button value={10 * 1024 * 1024}>10MB</Radio.Button>
            </Radio.Group>
            
            <Text>自定义：</Text>
            <InputNumber
              min={1}
              max={20}
              value={chunkSize / (1024 * 1024)}
              onChange={value => setChunkSize((value || 2) * 1024 * 1024)}
              addonAfter="MB"
            />
          </Space>
          
          <Space>
            <Text>文件类型：</Text>
            <Radio.Group 
              value={fileType} 
              onChange={e => setFileType(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="all">全部</Radio.Button>
              <Radio.Button value="image">图片</Radio.Button>
              <Radio.Button value="document">文档</Radio.Button>
              <Radio.Button value="video">视频</Radio.Button>
            </Radio.Group>
          </Space>
          
          <Space>
            <Text>自动上传：</Text>
            <Switch checked={autoUpload} onChange={setAutoUpload} />
            
            <Divider type="vertical" />
            
            <Text>断点续传：</Text>
            <Switch checked={resumable} onChange={setResumable} />
          </Space>
        </Space>
      </Card>
      
      <Card 
        title={
          <Space>
            <CloudUploadOutlined />
            <span>文件上传</span>
          </Space>
        }
      >
        <ChunkUploader
          chunkSize={chunkSize}
          onSuccess={handleUploadSuccess}
          accept={fileTypeMap[fileType]}
          buttonText="选择文件上传"
          resumable={resumable}
          autoUpload={autoUpload}
        />
        
        <Paragraph style={{ margin: '16px 0' }}>
          <Text type="secondary">
            支持大文件上传，文件大小不限。{fileType !== 'all' && `当前仅支持上传${
              fileType === 'image' ? '图片' : 
              fileType === 'document' ? '文档' : 
              '视频'
            }文件。`}
          </Text>
        </Paragraph>
      </Card>
      
      {uploadedFiles.length > 0 && (
        <Card 
          title={
            <Space>
              <FileOutlined />
              <span>已上传文件</span>
              <Tag color="blue">{uploadedFiles.length}</Tag>
            </Space>
          } 
          style={{ marginTop: 24 }}
        >
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {uploadedFiles.map((file, index) => (
              <li key={index} style={{ padding: '12px 0', borderBottom: index < uploadedFiles.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <Space>
                  <FileOutlined />
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    {file.name}
                  </a>
                  <Text type="secondary">({formatFileSize(file.size)})</Text>
                  <Text type="secondary">
                    上传时间: {new Date(file.uploadTime).toLocaleString()}
                  </Text>
                </Space>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default MaterialUpload;