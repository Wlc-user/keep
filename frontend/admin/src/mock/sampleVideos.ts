// 样例视频配置文件
// 这些样例视频用于系统功能测试，所有视频均为免费、无版权限制的素材

import { MaterialType } from '../types/material';

export interface SampleVideo {
  id: number;
  title: string;
  description: string;
  url: string;
  type: MaterialType;
  duration: number; // 单位：秒
  thumbnailUrl?: string;
  size?: number; // 单位：字节
}

export const sampleVideos: SampleVideo[] = [
  {
    id: 1,
    title: '示例讲座视频',
    description: '这是一个用于测试的示例讲座视频，用于验证系统的视频播放功能。',
    url: '/assets/sample-videos/sample-lecture.mp4',
    type: MaterialType.VIDEO,
    duration: 180, // 3分钟
    thumbnailUrl: '/assets/default-avatar.svg',
    size: 10546620
  },
  {
    id: 2,
    title: '在线学习内容示例',
    description: '用于测试在线学习系统视频播放和进度跟踪功能的示例视频。',
    url: '/assets/sample-videos/sample-lecture.mp4',
    type: MaterialType.VIDEO,
    duration: 120, // 2分钟
    thumbnailUrl: '/assets/default-avatar.svg',
    size: 10546620
  }
];

// 导出获取样例视频的工具函数
export const getSampleVideo = (id: number): SampleVideo | undefined => {
  return sampleVideos.find(video => video.id === id);
};

export const getAllSampleVideos = (): SampleVideo[] => {
  return [...sampleVideos];
}; 