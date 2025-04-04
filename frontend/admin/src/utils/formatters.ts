/**
 * 将秒数格式化为时间字符串 (HH:MM:SS 或 MM:SS)
 */
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) {
    return '00:00';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
  }
  
  return `${padZero(minutes)}:${padZero(secs)}`;
};

/**
 * 将文件大小格式化为人类可读的格式
 * @param size 文件大小（字节）
 * @returns 格式化后的字符串
 */
export const formatFileSize = (size: number): string => {
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

/**
 * 数字补零
 */
const padZero = (num: number): string => {
  return num.toString().padStart(2, '0');
};

/**
 * 将日期格式化为YYYY-MM-DD格式
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
};

/**
 * 将日期时间格式化为YYYY-MM-DD HH:MM:SS格式
 */
export const formatDateTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString('zh-CN');
  } catch (error) {
    console.error('日期格式化错误:', error);
    return dateString;
  }
};

/**
 * 格式化百分比
 * @param value 0-1之间的数值
 * @returns 格式化后的百分比字符串
 */
export const formatPercent = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

/**
 * 格式化持续时间（分钟转为小时分钟）
 * @param minutes 分钟数
 * @returns 格式化后的时间字符串
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} 分钟`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} 小时`;
    } else {
      return `${hours} 小时 ${remainingMinutes} 分钟`;
    }
  }
}; 