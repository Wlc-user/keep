import { message } from 'antd';

/**
 * 模拟分片上传服务
 * 使用浏览器的IndexedDB来存储上传的分片
 */

interface ChunkInfo {
  hash: string;
  uploaded: boolean;
  index: number;
}

interface FileRecord {
  fileHash: string;
  filename: string;
  size: number;
  uploadedChunks: ChunkInfo[];
  status: 'pending' | 'uploading' | 'completed';
  uploadedAt?: Date;
}

// 使用内存模拟存储
const fileRecords: Record<string, FileRecord> = {};
const chunks: Record<string, Blob[]> = {};

/**
 * 检查分片上传状态
 * @param fileHash 文件哈希
 */
export const checkChunkUploadStatus = (fileHash: string) => {
  console.log('[Mock] 检查分片上传状态:', fileHash);
  
  if (!fileRecords[fileHash]) {
    return {
      uploaded: false,
      uploadedChunks: []
    };
  }
  
  const record = fileRecords[fileHash];
  
  return {
    uploaded: record.status === 'completed',
    uploadedChunks: record.uploadedChunks
      .filter(chunk => chunk.uploaded)
      .map(chunk => chunk.index)
  };
};

/**
 * 上传文件分片
 */
export const uploadChunk = async (params: {
  file: File;
  fileHash: string;
  filename: string;
  chunkIndex: number;
  chunkSize: number;
  chunkCount: number;
  fileSize: number;
}) => {
  const { file, fileHash, filename, chunkIndex, chunkCount, fileSize } = params;
  
  console.log(`[Mock] 上传分片: ${chunkIndex + 1}/${chunkCount} 文件: ${filename}`);
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // 确保文件记录已创建
  if (!fileRecords[fileHash]) {
    fileRecords[fileHash] = {
      fileHash,
      filename,
      size: fileSize,
      uploadedChunks: Array.from({ length: chunkCount }, (_, i) => ({
        hash: `${fileHash}-${i}`,
        uploaded: false,
        index: i
      })),
      status: 'uploading'
    };
    
    chunks[fileHash] = new Array(chunkCount);
  }
  
  // 保存分片
  chunks[fileHash][chunkIndex] = file;
  
  // 更新分片状态
  fileRecords[fileHash].uploadedChunks[chunkIndex].uploaded = true;
  
  // 检查是否所有分片已上传
  const allChunksUploaded = fileRecords[fileHash].uploadedChunks.every(chunk => chunk.uploaded);
  
  return {
    success: true,
    message: `分片 ${chunkIndex + 1}/${chunkCount} 上传成功`,
    uploaded: allChunksUploaded
  };
};

/**
 * 合并文件分片
 */
export const mergeChunks = async (params: {
  fileHash: string;
  filename: string;
  size: number;
  chunkCount: number;
}) => {
  const { fileHash, filename } = params;
  
  console.log(`[Mock] 合并分片文件: ${filename}`);
  
  // 模拟较长的处理时间
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  if (!fileRecords[fileHash]) {
    return {
      success: false,
      message: '文件记录不存在'
    };
  }
  
  // 检查所有分片是否上传
  const allChunksUploaded = fileRecords[fileHash].uploadedChunks.every(chunk => chunk.uploaded);
  
  if (!allChunksUploaded) {
    return {
      success: false,
      message: '部分分片未上传完成，无法合并'
    };
  }
  
  // 更新文件状态
  fileRecords[fileHash].status = 'completed';
  fileRecords[fileHash].uploadedAt = new Date();
  
  // 生成文件URL (模拟)
  const fileUrl = `/api/files/${fileHash}/${encodeURIComponent(filename)}`;
  
  return {
    success: true,
    message: '文件合并成功',
    fileUrl,
    file: {
      name: filename,
      url: fileUrl,
      size: fileRecords[fileHash].size,
      uploadTime: fileRecords[fileHash].uploadedAt
    }
  };
};

/**
 * 清理上传记录
 * @param fileHash 文件哈希
 */
export const clearUploadRecord = (fileHash: string): void => {
  if (fileRecords[fileHash]) {
    delete fileRecords[fileHash];
    delete chunks[fileHash];
    console.log(`[模拟存储] 清理文件记录: ${fileHash}`);
  }
};

/**
 * 获取当前上传存储状态
 * 用于调试
 */
export const getUploadStoreStatus = (): any => {
  return Object.keys(fileRecords).map(hash => ({
    fileHash: hash,
    filename: fileRecords[hash].filename,
    uploadedChunks: fileRecords[hash].uploadedChunks.filter(chunk => chunk.uploaded).length,
    totalChunks: fileRecords[hash].uploadedChunks.length,
    fileSize: fileRecords[hash].size,
    uploadComplete: fileRecords[hash].status === 'completed',
    status: fileRecords[hash].status,
    uploadedAt: fileRecords[hash].uploadedAt
  }));
}; 