import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Button, 
  message, 
  Progress, 
  Space, 
  Card, 
  Typography, 
  Modal, 
  Tooltip,
  List,
  Image
} from 'antd';
import { 
  UploadOutlined, 
  InboxOutlined, 
  FileOutlined, 
  FilePdfOutlined,
  FileImageOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileTextOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  PaperClipOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { RcFile, UploadFile, UploadProps } from 'antd/lib/upload/interface';

const { Dragger } = Upload;
const { Text, Title, Paragraph } = Typography;

export interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxCount?: number;
  maxSize?: number; // 单位：MB
  fileTypes?: string[];
  listType?: 'text' | 'picture' | 'picture-card';
  showUploadList?: boolean;
  defaultFileList?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  onRemove?: (file: UploadFile) => void | boolean | Promise<void | boolean>;
  onPreview?: (file: UploadFile) => void;
  onDownload?: (file: UploadFile) => void;
  customRequest?: (options: any) => void;
  beforeUpload?: (file: RcFile, fileList: RcFile[]) => boolean | Promise<void | Blob | File>;
  action?: string;
  headers?: Record<string, string>;
  data?: Record<string, any> | ((file: UploadFile) => Record<string, any>);
  name?: string;
  withCredentials?: boolean;
  directory?: boolean;
  disabled?: boolean;
  showRemoveIcon?: boolean;
  showPreviewIcon?: boolean;
  showDownloadIcon?: boolean;
  previewFile?: (file: File | Blob) => Promise<string>;
  iconRender?: (file: UploadFile) => React.ReactNode;
  itemRender?: (originNode: React.ReactNode, file: UploadFile, fileList: UploadFile[]) => React.ReactNode;
  progress?: UploadProps['progress'];
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  uploadText?: string;
  uploadHint?: string;
  mode?: 'default' | 'dragger' | 'card' | 'button' | 'simple';
  showFileList?: boolean;
}

const StyledUpload = styled(Upload)`
  .ant-upload-list-item-info {
    display: flex;
    align-items: center;
  }
  
  .ant-upload-list-item-name {
    flex: 1;
    padding-left: 4px;
  }
  
  .ant-upload-list-item-card-actions {
    position: static;
    opacity: 1;
  }
`;

const StyledDragger = styled(Dragger)`
  .ant-upload-drag-container {
    padding: 16px;
  }
  
  .ant-upload-text {
    margin: 8px 0;
    color: var(--heading-color, #262626);
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      color: var(--heading-color, #e6e6e6);
    }
  }
  
  .ant-upload-hint {
    color: var(--text-color-secondary, #595959);
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      color: var(--text-color-secondary, #a6a6a6);
    }
  }
  
  .ant-upload-drag-icon {
    color: var(--primary-color, #1890ff);
    font-size: 48px;
    margin-bottom: 8px;
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      color: var(--primary-color, #177ddc);
    }
  }
`;

const CardUploader = styled(Card)`
  width: 100%;
  border-radius: 8px;
  
  .ant-card-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 150px;
  }
`;

const SimpleUploader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FileListContainer = styled.div`
  margin-top: 16px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: var(--item-hover-bg, #f5f5f5);
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    background-color: var(--item-hover-bg, #262626);
  }
`;

const FileIcon = styled.div`
  font-size: 24px;
  margin-right: 8px;
  color: var(--text-color-secondary, #595959);
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color-secondary, #a6a6a6);
  }
`;

const FileInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

const FileName = styled(Text)`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--heading-color, #262626);
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--heading-color, #e6e6e6);
  }
`;

const FileSize = styled(Text)`
  font-size: 12px;
  color: var(--text-color-secondary, #595959);
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color-secondary, #a6a6a6);
  }
`;

const FileActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled(Button)`
  color: var(--text-color-secondary, #595959);
  
  &:hover {
    color: var(--primary-color, #1890ff);
  }
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color-secondary, #a6a6a6);
    
    &:hover {
      color: var(--primary-color, #177ddc);
    }
  }
`;

/**
 * 文件上传组件
 * 支持拖拽上传、预览和进度显示
 */
const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  multiple = false,
  maxCount,
  maxSize = 10, // 默认最大10MB
  fileTypes,
  listType = 'text',
  showUploadList = true,
  defaultFileList = [],
  onChange,
  onRemove,
  onPreview,
  onDownload,
  customRequest,
  beforeUpload: propBeforeUpload,
  action,
  headers,
  data,
  name = 'file',
  withCredentials,
  directory,
  disabled = false,
  showRemoveIcon = true,
  showPreviewIcon = true,
  showDownloadIcon = true,
  previewFile,
  iconRender,
  itemRender,
  progress,
  className,
  style,
  children,
  uploadText = '点击或拖拽文件到此区域上传',
  uploadHint = '支持单个或批量上传',
  mode = 'default',
  showFileList = true,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>(defaultFileList);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  
  // 同步外部fileList变化
  useEffect(() => {
    if (defaultFileList) {
      setFileList(defaultFileList);
    }
  }, [defaultFileList]);
  
  // 处理文件大小检查
  const checkFileSize = (file: RcFile) => {
    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtMaxSize) {
      message.error(`文件大小不能超过 ${maxSize}MB!`);
    }
    return isLtMaxSize;
  };
  
  // 处理文件类型检查
  const checkFileType = (file: RcFile) => {
    if (!fileTypes || fileTypes.length === 0) {
      return true;
    }
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const isValidType = fileTypes.includes(fileExtension);
    if (!isValidType) {
      message.error(`只支持 ${fileTypes.join(', ')} 格式的文件!`);
    }
    return isValidType;
  };
  
  // 上传前检查
  const beforeUpload = async (file: RcFile, fileList: RcFile[]) => {
    const isValidSize = checkFileSize(file);
    const isValidType = checkFileType(file);
    
    if (!isValidSize || !isValidType) {
      return Upload.LIST_IGNORE;
    }
    
    if (propBeforeUpload) {
      return propBeforeUpload(file, fileList);
    }
    
    return true;
  };
  
  // 处理文件变化
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    
    if (onChange) {
      onChange(newFileList);
    }
  };
  
  // 处理文件预览
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
    
    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    
    if (onPreview) {
      onPreview(file);
    }
  };
  
  // 处理文件下载
  const handleDownload = (file: UploadFile) => {
    if (onDownload) {
      onDownload(file);
    } else {
      const link = document.createElement('a');
      link.href = file.url || (file.preview as string);
      link.download = file.name;
      link.click();
    }
  };
  
  // 处理文件删除
  const handleRemove = (file: UploadFile) => {
    if (onRemove) {
      return onRemove(file);
    }
    return true;
  };
  
  // 获取文件图标
  const getFileIcon = (file: UploadFile) => {
    if (iconRender) {
      return iconRender(file);
    }
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    switch (fileExtension) {
      case 'pdf':
        return <FilePdfOutlined />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
        return <FileImageOutlined />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FileExcelOutlined />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined />;
      case 'ppt':
      case 'pptx':
        return <FilePptOutlined />;
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return <FileZipOutlined />;
      case 'txt':
      case 'md':
        return <FileTextOutlined />;
      default:
        return <FileOutlined />;
    }
  };
  
  // 转换文件大小显示
  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else if (size < 1024 * 1024 * 1024) {
      return `${(size / 1024 / 1024).toFixed(2)} MB`;
    } else {
      return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
    }
  };
  
  // 渲染自定义文件列表
  const renderFileList = () => {
    if (!showFileList || fileList.length === 0) {
      return null;
    }
    
    return (
      <FileListContainer>
        <List
          dataSource={fileList}
          renderItem={file => (
            <FileItem>
              <FileIcon>{getFileIcon(file)}</FileIcon>
              <FileInfo>
                <FileName ellipsis title={file.name}>{file.name}</FileName>
                <FileSize>{file.size ? formatFileSize(file.size) : ''}</FileSize>
                {file.status === 'uploading' && (
                  <Progress 
                    percent={file.percent} 
                    size="small" 
                    status="active" 
                    showInfo={false} 
                    style={{ marginTop: 4 }}
                  />
                )}
              </FileInfo>
              <FileActions>
                {showPreviewIcon && file.status === 'done' && (
                  <Tooltip title="预览">
                    <ActionButton 
                      type="text" 
                      icon={<EyeOutlined />} 
                      onClick={() => handlePreview(file)}
                      size="small"
                    />
                  </Tooltip>
                )}
                {showDownloadIcon && file.status === 'done' && (
                  <Tooltip title="下载">
                    <ActionButton 
                      type="text" 
                      icon={<DownloadOutlined />} 
                      onClick={() => handleDownload(file)}
                      size="small"
                    />
                  </Tooltip>
                )}
                {showRemoveIcon && (
                  <Tooltip title="删除">
                    <ActionButton 
                      type="text" 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleRemove(file)}
                      size="small"
                    />
                  </Tooltip>
                )}
              </FileActions>
            </FileItem>
          )}
        />
      </FileListContainer>
    );
  };
  
  // 渲染上传组件
  const renderUploader = () => {
    const uploadProps: UploadProps = {
      name,
      accept,
      multiple,
      maxCount,
      action,
      headers,
      data,
      withCredentials,
      directory,
      disabled,
      fileList,
      listType,
      showUploadList: mode === 'default' && showUploadList,
      beforeUpload,
      onChange: handleChange,
      onPreview: handlePreview,
      onRemove: handleRemove,
      onDownload: handleDownload,
      customRequest,
      previewFile,
      iconRender,
      itemRender,
      progress,
    };
    
    switch (mode) {
      case 'dragger':
        return (
          <StyledDragger {...uploadProps}>
            <div className="ant-upload-drag-container">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">{uploadText}</p>
              <p className="ant-upload-hint">{uploadHint}</p>
            </div>
          </StyledDragger>
        );
      
      case 'card':
        return (
          <CardUploader>
            <Upload {...uploadProps} showUploadList={false}>
              <Space direction="vertical" align="center">
                <UploadOutlined style={{ fontSize: 32 }} />
                <Text strong>{uploadText}</Text>
                <Text type="secondary">{uploadHint}</Text>
              </Space>
            </Upload>
          </CardUploader>
        );
      
      case 'button':
        return (
          <Upload {...uploadProps} showUploadList={false}>
            <Button icon={<UploadOutlined />} disabled={disabled}>
              {children || '上传文件'}
            </Button>
          </Upload>
        );
      
      case 'simple':
        return (
          <SimpleUploader>
            <Upload {...uploadProps} showUploadList={false}>
              <Button 
                type="link" 
                icon={<PaperClipOutlined />} 
                disabled={disabled}
              >
                {children || '添加附件'}
              </Button>
            </Upload>
          </SimpleUploader>
        );
      
      default:
        return (
          <StyledUpload {...uploadProps}>
            {children || (
              <Button icon={<UploadOutlined />} disabled={disabled}>
                上传文件
              </Button>
            )}
          </StyledUpload>
        );
    }
  };
  
  return (
    <div className={className} style={style}>
      {renderUploader()}
      
      {mode !== 'default' && renderFileList()}
      
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt={previewTitle} style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

// 将文件转换为Base64
const getBase64 = (file: RcFile): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default FileUploader; 