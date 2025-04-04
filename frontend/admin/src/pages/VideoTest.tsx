import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Button, Progress, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { sampleVideos, SampleVideo } from '../mock/sampleVideos';

const { Title, Paragraph } = Typography;

const VideoTest: React.FC = () => {
  const [currentVideo, setCurrentVideo] = useState<SampleVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 默认选择第一个视频
    if (sampleVideos.length > 0) {
      setCurrentVideo(sampleVideos[0]);
    }
  }, []);

  // 处理视频加载完成事件
  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      message.success('视频加载完成');
    }
  };

  // 处理视频播放事件
  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // 处理视频暂停事件
  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // 处理视频重置事件
  const handleReset = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  // 切换视频
  const switchVideo = (video: SampleVideo) => {
    setCurrentVideo(video);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    
    // 确保在视频切换后，视频元素获得正确的src
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
      }
    }, 100);
  };

  // 处理视频进度更新
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const calculatedProgress = (current / videoRef.current.duration) * 100;
      setCurrentTime(current);
      setProgress(calculatedProgress);
    }
  };

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>视频功能测试页面</Title>
      <Paragraph>
        本页面用于测试系统的视频播放功能。所有视频素材均为免费、无版权限制的样例视频。
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card title="视频列表" style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {sampleVideos.map((video) => (
                <Button
                  key={video.id}
                  type={currentVideo?.id === video.id ? 'primary' : 'default'}
                  block
                  onClick={() => switchVideo(video)}
                >
                  {video.title}
                </Button>
              ))}
            </Space>
          </Card>
        </Col>

        <Col span={18}>
          <Card 
            title={currentVideo?.title || '无视频选择'} 
            extra={
              <Space>
                {isPlaying ? (
                  <Button icon={<PauseCircleOutlined />} onClick={handlePause}>暂停</Button>
                ) : (
                  <Button icon={<PlayCircleOutlined />} onClick={handlePlay}>播放</Button>
                )}
                <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
              </Space>
            }
          >
            {currentVideo ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <video
                    ref={videoRef}
                    src={currentVideo.url}
                    style={{ maxWidth: '100%', maxHeight: '400px' }}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleVideoLoaded}
                  />
                </div>
                <div>
                  <Progress percent={progress} status="active" />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <Title level={5}>视频信息</Title>
                  <p><strong>描述：</strong> {currentVideo.description}</p>
                  <p><strong>时长：</strong> {formatTime(currentVideo.duration)}</p>
                  <p><strong>文件大小：</strong> {(currentVideo.size || 0) / (1024 * 1024)} MB</p>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Title level={4}>请从左侧选择一个视频</Title>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VideoTest; 