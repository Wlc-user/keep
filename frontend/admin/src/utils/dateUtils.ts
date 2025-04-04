/**
 * 日期工具函数
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 扩展dayjs以支持相对时间
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/**
 * 格式化时间戳为相对时间（如：3小时前）
 * @param timestamp ISO格式时间字符串或Date对象
 * @returns 格式化后的相对时间字符串
 */
export const formatRelativeTime = (timestamp: string | Date): string => {
  return dayjs(timestamp).fromNow();
};

/**
 * 格式化时间戳为标准时间格式（如：2023-01-01 12:30）
 * @param timestamp ISO格式时间字符串或Date对象
 * @param format 时间格式，默认为 YYYY-MM-DD HH:mm
 * @returns 格式化后的时间字符串
 */
export const formatDateTime = (
  timestamp: string | Date, 
  format: string = 'YYYY-MM-DD HH:mm'
): string => {
  return dayjs(timestamp).format(format);
};

/**
 * 智能格式化时间戳
 * - 如果是今天的时间，显示为"今天 HH:mm"
 * - 如果是昨天的时间，显示为"昨天 HH:mm"
 * - 如果是当年的时间，显示为"MM-DD HH:mm"
 * - 如果是往年的时间，显示为"YYYY-MM-DD"
 * - 如果时间在24小时内，显示为相对时间（几小时前）
 * 
 * @param timestamp ISO格式时间字符串或Date对象
 * @returns 格式化后的时间字符串
 */
export const formatTimestamp = (timestamp: string | Date): string => {
  const date = dayjs(timestamp);
  const now = dayjs();
  const diffHours = now.diff(date, 'hour');
  
  // 24小时内显示相对时间
  if (diffHours < 24) {
    return date.fromNow();
  }
  
  // 同一年内显示 MM-DD HH:mm
  if (date.year() === now.year()) {
    // 昨天
    if (now.diff(date, 'day') === 1) {
      return `昨天 ${date.format('HH:mm')}`;
    }
    // 当年其他日期
    return date.format('MM-DD HH:mm');
  }
  
  // 不同年份显示完整日期
  return date.format('YYYY-MM-DD');
};

/**
 * 计算两个日期之间的天数差
 * @param date1 开始日期
 * @param date2 结束日期，默认为当前时间
 * @returns 天数差
 */
export const getDayDifference = (
  date1: string | Date, 
  date2: string | Date = new Date()
): number => {
  return dayjs(date2).diff(dayjs(date1), 'day');
};

/**
 * 判断日期是否为今天
 * @param date 日期字符串或Date对象
 * @returns 是否为今天
 */
export const isToday = (date: string | Date): boolean => {
  const inputDate = dayjs(date);
  const today = dayjs();
  return inputDate.isSame(today, 'day');
};

/**
 * 判断日期是否在指定天数内
 * @param date 日期字符串或Date对象
 * @param days 天数
 * @returns 是否在指定天数内
 */
export const isWithinDays = (date: string | Date, days: number): boolean => {
  const inputDate = dayjs(date);
  const now = dayjs();
  const diffDays = now.diff(inputDate, 'day');
  return diffDays >= 0 && diffDays < days;
};

/**
 * 格式化日期为本地字符串
 * @param date 日期字符串或Date对象
 * @param options 格式化选项
 * @returns 格式化后的日期字符串
 */
export const formatDate = (
  date: string | Date | undefined | null,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  if (!date) return '未知';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('zh-CN', options);
  } catch (error) {
    console.error('日期格式化错误:', error);
    return typeof date === 'string' ? date : String(date);
  }
};

/**
 * 获取相对时间（如"3小时前"，"2天前"）
 * @param date 日期字符串或Date对象
 * @returns 相对时间字符串
 */
export const getRelativeTime = (date: string | Date | undefined | null): string => {
  if (!date) return '未知';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    // 小于1分钟
    if (diffInSeconds < 60) {
      return '刚刚';
    }
    
    // 小于1小时
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}分钟前`;
    }
    
    // 小于1天
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}小时前`;
    }
    
    // 小于30天
    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}天前`;
    }
    
    // 小于1年
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months}个月前`;
    }
    
    // 大于1年
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years}年前`;
  } catch (error) {
    console.error('相对时间计算错误:', error);
    return typeof date === 'string' ? date : String(date);
  }
};

/**
 * 格式化日期范围
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 格式化后的日期范围字符串
 */
export const formatDateRange = (
  startDate: string | Date | undefined | null,
  endDate: string | Date | undefined | null
): string => {
  if (!startDate && !endDate) return '未指定时间';
  if (startDate && !endDate) return `从 ${formatDate(startDate)} 开始`;
  if (!startDate && endDate) return `到 ${formatDate(endDate)} 结束`;
  
  return `${formatDate(startDate)} 至 ${formatDate(endDate)}`;
};

/**
 * 判断日期是否在过去
 * @param date 日期字符串或Date对象
 * @returns 如果日期在过去则返回true
 */
export const isDateInPast = (date: string | Date | undefined | null): boolean => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    return dateObj.getTime() < now.getTime();
  } catch (error) {
    console.error('日期比较错误:', error);
    return false;
  }
};

/**
 * 判断日期是否在未来
 * @param date 日期字符串或Date对象
 * @returns 如果日期在未来则返回true
 */
export const isDateInFuture = (date: string | Date | undefined | null): boolean => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    return dateObj.getTime() > now.getTime();
  } catch (error) {
    console.error('日期比较错误:', error);
    return false;
  }
}; 