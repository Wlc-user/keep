import SparkMD5 from 'spark-md5';

/**
 * 计算文件的MD5哈希值
 * @param file 文件对象
 * @param progressCallback 进度回调函数
 * @returns Promise<string> 文件的哈希值
 */
export const calculateFileHash = (
  file: File, 
  progressCallback?: (percentage: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunkSize = 2 * 1024 * 1024; // 2MB chunks
    const chunks = Math.ceil(file.size / chunkSize);
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    
    let currentChunk = 0;
    
    fileReader.onload = (e) => {
      if (e.target?.result) {
        spark.append(e.target.result as ArrayBuffer);
        currentChunk++;
        
        if (progressCallback) {
          progressCallback(Math.round((currentChunk / chunks) * 100));
        }
        
        if (currentChunk < chunks) {
          loadNext();
        } else {
          // 完成计算
          const hash = spark.end();
          resolve(hash);
        }
      }
    };
    
    fileReader.onerror = () => {
      reject(new Error('读取文件发生错误'));
    };
    
    function loadNext() {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      fileReader.readAsArrayBuffer(chunk);
    }
    
    loadNext();
  });
};

/**
 * 格式化文件大小
 * @param bytes 文件大小（字节）
 * @param decimals 小数位数
 * @returns 格式化后的文件大小
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * 根据文件后缀获取文件类型
 * @param filename 文件名
 * @returns 文件类型
 */
export const getFileType = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const documentTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt'];
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
  const audioTypes = ['mp3', 'wav', 'ogg', 'flac', 'aac'];
  
  if (imageTypes.includes(extension)) return 'image';
  if (documentTypes.includes(extension)) return 'document';
  if (videoTypes.includes(extension)) return 'video';
  if (audioTypes.includes(extension)) return 'audio';
  
  return 'other';
};

/**
 * 检查文件类型是否合法
 * @param file 文件对象
 * @param acceptedTypes 接受的文件类型数组 (mime类型或文件扩展名)
 * @returns 是否合法
 */
export const isValidFileType = (file: File, acceptedTypes: string[]): boolean => {
  if (!acceptedTypes || acceptedTypes.length === 0) return true;
  
  // 通过文件扩展名判断
  const fileName = file.name;
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
  
  return acceptedTypes.some(type => {
    // 如果是mime类型
    if (type.includes('/')) {
      // 处理 image/* 这种格式
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(`${baseType}/`);
      }
      return file.type === type;
    }
    // 文件扩展名
    return type.toLowerCase() === `.${fileExtension}` || type.toLowerCase() === fileExtension;
  });
};

/**
 * 生成唯一文件名
 * @param originalName 原始文件名
 * @returns 唯一文件名
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const extension = originalName.split('.').pop() || '';
  return `${timestamp}_${random}.${extension}`;
}; 