import React, { useState, useRef } from 'react';
import { Upload, Button, Progress, message, Card, Space, Typography, Modal } from 'antd';
import { UploadOutlined, FileOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';
import apiService from '../../services/api';
import { calculateFileHash } from '../../utils/fileUtils';

const { Text, Title } = Typography;

// 默认分片大小 2MB
const DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024;

interface ChunkUploadProps {
  /**
   * 上传完成后的回调
   * @param fileInfo 上传成功的文件信息
   */
  onSuccess?: (fileInfo: any) => void;
  
  /**
   * 分片大小（字节）
   * 默认值：2MB
   */
  chunkSize?: number;
  
  /**
   * 是否显示文件列表
   * 默认值：true
   */
  showFileList?: boolean;
  
  /**
   * 允许上传的文件类型
   */
  accept?: string;
  
  /**
   * 自定义上传按钮文本
   */
  buttonText?: string;
  
  /**
   * 自定义上传区域
   */
  children?: React.ReactNode;
  
  /**
   * 是否开启断点续传
   * 默认值：true
   */
  resumable?: boolean;
  
  /**
   * 是否自动开始上传
   * 默认值：true
   */
  autoUpload?: boolean;
}

interface ChunkFile {
  file: File;
  index: number;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface UploadTask {
  file: RcFile;
  filename: string;
  fileHash: string;
  fileSize: number;
  chunks: ChunkFile[];
  uploadedChunks: number[];
  uploading: boolean;
  progress: number;
  status: 'pending' | 'calculating' | 'uploading' | 'merging' | 'success' | 'error';
  error?: string;
  url?: string;
}

const ChunkUploader: React.FC<ChunkUploadProps> = ({
  onSuccess,
  chunkSize = DEFAULT_CHUNK_SIZE,
  showFileList = true,
  accept,
  buttonText = '上传文件',
  children,
  resumable = true,
  autoUpload = true,
}) => {
  const [uploadTask, setUploadTask] = useState<UploadTask | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  
  const workerRef = useRef<Worker | null>(null);
  
  // 创建Web Worker用于哈希计算
  const createWorker = (): Worker => {
    const workerCode = `
      self.onmessage = async function(e) {
        const { file, chunkSize } = e.data;
        const chunks = Math.ceil(file.size / chunkSize);
        const spark = new self.SparkMD5.ArrayBuffer();
        const fileReader = new FileReader();
        
        let currentChunk = 0;
        
        fileReader.onload = function(e) {
          spark.append(e.target.result);
          currentChunk++;
          
          if (currentChunk < chunks) {
            // 通知主线程进度
            self.postMessage({ type: 'progress', percentage: Math.round((currentChunk / chunks) * 100) });
            loadNext();
          } else {
            // 完成计算
            self.postMessage({ type: 'complete', hash: spark.end() });
          }
        };
        
        fileReader.onerror = function() {
          self.postMessage({ type: 'error', message: 'File read error' });
        };
        
        function loadNext() {
          const start = currentChunk * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const chunk = file.slice(start, end);
          fileReader.readAsArrayBuffer(chunk);
        }
        
        loadNext();
      };
      
      // SparkMD5 库
      /* 此处应有SparkMD5库代码 */
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  };
  
  // 计算文件哈希值
  const computeHash = async (file: RcFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // 使用外部计算工具
        return calculateFileHash(file)
          .then(hash => resolve(hash))
          .catch(err => {
            console.error('计算哈希错误:', err);
            message.error('文件校验失败，请重试');
            reject(err);
          });
      } catch (error) {
        console.error('哈希计算初始化错误:', error);
        reject(error);
      }
    });
  };
  
  // 创建分片
  const createFileChunks = (file: RcFile, size: number): ChunkFile[] => {
    const chunks: ChunkFile[] = [];
    let cur = 0;
    while (cur < file.size) {
      const end = Math.min(cur + size, file.size);
      const chunk = file.slice(cur, end);
      
      chunks.push({
        file: chunk as File,
        index: chunks.length,
        progress: 0,
        status: 'pending',
      });
      
      cur = end;
    }
    return chunks;
  };
  
  // 检查已上传的分片
  const checkUploadStatus = async (fileHash: string): Promise<number[]> => {
    try {
      const response = await apiService.request('get', '/api/upload/check', { fileHash });
      if (response && response.uploaded) {
        message.success('文件已上传，无需重复上传');
        if (uploadTask) {
          setUploadTask({
            ...uploadTask,
            status: 'success',
            progress: 100,
            uploading: false,
            url: response.url,
          });
        }
        return [];
      }
      
      return response.uploadedChunks || [];
    } catch (error) {
      console.error('检查上传状态失败:', error);
      return [];
    }
  };
  
  // 上传单个分片
  const uploadChunk = async (chunk: ChunkFile, task: UploadTask): Promise<boolean> => {
    const formData = new FormData();
    formData.append('file', chunk.file);
    formData.append('fileHash', task.fileHash);
    formData.append('filename', task.filename);
    formData.append('chunkIndex', chunk.index.toString());
    formData.append('chunkSize', chunkSize.toString());
    formData.append('chunkCount', task.chunks.length.toString());
    formData.append('fileSize', task.fileSize.toString());
    
    try {
      // 更新分片状态
      setUploadTask(prev => {
        if (!prev) return prev;
        const newChunks = [...prev.chunks];
        newChunks[chunk.index] = {
          ...newChunks[chunk.index],
          status: 'uploading',
        };
        return { ...prev, chunks: newChunks };
      });
      
      const response = await apiService.request('post', '/api/upload/chunk', formData);
      
      if (response.success) {
        // 更新分片状态
        setUploadTask(prev => {
          if (!prev) return prev;
          const newChunks = [...prev.chunks];
          newChunks[chunk.index] = {
            ...newChunks[chunk.index],
            status: 'success',
            progress: 100,
          };
          
          // 计算总进度
          const totalProgress = newChunks.reduce((acc, curr) => 
            acc + curr.progress, 0) / newChunks.length;
          
          return {
            ...prev,
            chunks: newChunks,
            uploadedChunks: [...prev.uploadedChunks, chunk.index],
            progress: totalProgress,
          };
        });
        
        return true;
      } else {
        throw new Error(response.message || '上传分片失败');
      }
    } catch (error) {
      console.error(`上传分片 ${chunk.index} 失败:`, error);
      
      // 更新分片状态
      setUploadTask(prev => {
        if (!prev) return prev;
        const newChunks = [...prev.chunks];
        newChunks[chunk.index] = {
          ...newChunks[chunk.index],
          status: 'error',
          error: error.message,
        };
        return { ...prev, chunks: newChunks };
      });
      
      return false;
    }
  };
  
  // 合并分片
  const mergeChunks = async (task: UploadTask): Promise<void> => {
    try {
      setUploadTask(prev => prev ? { ...prev, status: 'merging' } : null);
      
      const response = await apiService.request('post', '/api/upload/merge', {
        fileHash: task.fileHash,
        filename: task.filename,
        size: task.fileSize,
        chunkCount: task.chunks.length,
      });
      
      if (response.success) {
        setUploadTask(prev => prev ? {
          ...prev,
          status: 'success',
          progress: 100,
          uploading: false,
          url: response.fileUrl,
        } : null);
        
        message.success('文件上传成功');
        
        if (onSuccess && response.file) {
          onSuccess(response.file);
        }
      } else {
        throw new Error(response.message || '合并文件失败');
      }
    } catch (error) {
      console.error('合并文件失败:', error);
      message.error(`合并文件失败: ${error.message}`);
      
      setUploadTask(prev => prev ? {
        ...prev,
        status: 'error',
        error: error.message,
        uploading: false,
      } : null);
    }
  };
  
  // 处理上传
  const handleUpload = async () => {
    if (!uploadTask || uploadTask.uploading || uploadTask.status === 'success') return;
    
    try {
      setUploadTask(prev => prev ? { ...prev, uploading: true, status: 'uploading' } : null);
      
      // 获取已上传的分片
      let uploadedChunks: number[] = [];
      if (resumable) {
        uploadedChunks = await checkUploadStatus(uploadTask.fileHash);
        
        // 更新已上传的分片状态
        setUploadTask(prev => {
          if (!prev) return prev;
          
          const newChunks = [...prev.chunks];
          uploadedChunks.forEach(index => {
            if (index < newChunks.length) {
              newChunks[index] = {
                ...newChunks[index],
                status: 'success',
                progress: 100,
              };
            }
          });
          
          return {
            ...prev,
            chunks: newChunks,
            uploadedChunks,
          };
        });
      }
      
      // 筛选未上传的分片
      const chunksToUpload = uploadTask.chunks
        .filter(chunk => !uploadedChunks.includes(chunk.index));
      
      if (chunksToUpload.length === 0) {
        // 所有分片已上传，直接合并
        await mergeChunks(uploadTask);
        return;
      }
      
      // 并行上传分片
      const concurrency = 3; // 并发数
      let completed = 0;
      
      const uploadNext = async (index: number) => {
        if (index >= chunksToUpload.length) return;
        
        const chunk = chunksToUpload[index];
        const success = await uploadChunk(chunk, uploadTask);
        
        completed++;
        
        if (completed === chunksToUpload.length) {
          // 所有分片上传完成，开始合并
          await mergeChunks(uploadTask);
        } else {
          // 上传下一个分片
          await uploadNext(index + concurrency);
        }
      };
      
      // 启动并发上传
      const promises = [];
      for (let i = 0; i < Math.min(concurrency, chunksToUpload.length); i++) {
        promises.push(uploadNext(i));
      }
      
      await Promise.all(promises);
      
    } catch (error) {
      console.error('上传过程出错:', error);
      message.error(`上传失败: ${error.message}`);
      
      setUploadTask(prev => prev ? {
        ...prev,
        status: 'error',
        error: error.message,
        uploading: false,
      } : null);
    }
  };
  
  // 处理文件选择
  const handleFileSelect = async (file: RcFile) => {
    if (uploadTask && uploadTask.uploading) {
      message.warning('正在上传中，请等待当前上传完成');
      return false;
    }
    
    // 重置上传任务
    setUploadTask({
      file,
      filename: file.name,
      fileHash: '',
      fileSize: file.size,
      chunks: [],
      uploadedChunks: [],
      uploading: false,
      progress: 0,
      status: 'calculating',
    });
    
    try {
      // 计算文件哈希
      message.loading('正在分析文件...');
      const fileHash = await computeHash(file);
      
      // 创建分片
      const chunks = createFileChunks(file, chunkSize);
      
      setUploadTask(prev => prev ? {
        ...prev,
        fileHash,
        chunks,
        status: 'pending',
      } : null);
      
      message.success('文件准备就绪');
      
      // 自动上传
      if (autoUpload) {
        setTimeout(() => handleUpload(), 100);
      }
      
    } catch (error) {
      console.error('文件处理失败:', error);
      message.error(`文件处理失败: ${error.message}`);
      
      setUploadTask(prev => prev ? {
        ...prev,
        status: 'error',
        error: error.message,
      } : null);
    }
    
    return false;
  };
  
  // 取消上传
  const handleCancel = () => {
    if (uploadTask && uploadTask.uploading) {
      // TODO: 实现取消上传中的请求
      message.info('上传已取消');
    }
    
    setUploadTask(null);
  };
  
  // 重试上传
  const handleRetry = () => {
    if (!uploadTask) return;
    
    const failedChunks = uploadTask.chunks.filter(chunk => chunk.status === 'error');
    
    if (failedChunks.length > 0) {
      // 重置失败的分片状态
      setUploadTask(prev => {
        if (!prev) return prev;
        const newChunks = [...prev.chunks];
        failedChunks.forEach(chunk => {
          newChunks[chunk.index] = {
            ...chunk,
            status: 'pending',
            error: undefined,
          };
        });
        
        return {
          ...prev,
          status: 'pending',
          error: undefined,
        };
      });
      
      // 重新上传
      setTimeout(() => handleUpload(), 100);
    }
  };
  
  const renderUploadButton = () => {
    if (children) {
      return children;
    }
    
    return (
      <Button icon={<UploadOutlined />}>
        {buttonText}
      </Button>
    );
  };
  
  const renderTaskStatus = () => {
    if (!uploadTask) return null;
    
    const { status, progress, filename, fileSize, error } = uploadTask;
    
    const formatFileSize = (size: number) => {
      if (size < 1024) {
        return `${size} B`;
      } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
      } else if (size < 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
      } else {
        return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      }
    };
    
    const statusText = {
      pending: '准备上传',
      calculating: '计算文件哈希',
      uploading: '上传中',
      merging: '合并文件',
      success: '上传成功',
      error: '上传失败',
    }[status];
    
    const statusIcon = {
      success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      error: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      default: <FileOutlined />,
    }[status === 'success' ? 'success' : status === 'error' ? 'error' : 'default'];
    
    return (
      <Card 
        style={{ marginTop: 16 }} 
        size="small"
        title={
          <Space>
            {statusIcon}
            <Text>{filename}</Text>
            <Text type="secondary">{formatFileSize(fileSize)}</Text>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text type="secondary">{statusText}</Text>
            {status === 'error' && <Text type="danger" style={{ marginLeft: 8 }}>{error}</Text>}
          </div>
          
          <Progress 
            percent={Math.round(progress)} 
            status={
              status === 'success' ? 'success' : 
              status === 'error' ? 'exception' : 
              'active'
            }
          />
          
          <Space>
            {['pending', 'calculating'].includes(status) && (
              <Button type="primary" onClick={handleUpload} disabled={status === 'calculating'}>
                开始上传
              </Button>
            )}
            
            {status === 'error' && (
              <Button type="primary" onClick={handleRetry}>
                重试
              </Button>
            )}
            
            {status === 'success' && uploadTask.url && (
              <Button type="link" onClick={() => setPreviewVisible(true)}>
                查看文件
              </Button>
            )}
            
            {status !== 'success' && (
              <Button danger onClick={handleCancel}>
                取消
              </Button>
            )}
          </Space>
        </Space>
      </Card>
    );
  };
  
  return (
    <div className="chunk-uploader">
      <Upload.Dragger
        multiple={false}
        showUploadList={false}
        beforeUpload={handleFileSelect}
        accept={accept}
      >
        {renderUploadButton()}
        <p className="ant-upload-hint" style={{ marginTop: 8 }}>
          支持大文件上传，单个文件大小不限
        </p>
      </Upload.Dragger>
      
      {showFileList && renderTaskStatus()}
      
      <Modal
        title="文件预览"
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        {uploadTask?.url && (
          <div style={{ textAlign: 'center' }}>
            <p>文件上传成功</p>
            <p>
              <a href={uploadTask.url} target="_blank" rel="noopener noreferrer">
                {uploadTask.filename}
              </a>
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChunkUploader; 