// API 配置
export const API_URL = 'http://localhost:5000';

// 文件上传配置
export const UPLOAD_CONFIG = {
  maxSize: 100 * 1024 * 1024, // 100MB
  acceptTypes: {
    video: '.mp4,.avi,.mov',
    document: '.pdf,.doc,.docx,.ppt,.pptx',
    audio: '.mp3,.wav,.ogg',
    image: '.jpg,.jpeg,.png,.gif'
  }
}; 