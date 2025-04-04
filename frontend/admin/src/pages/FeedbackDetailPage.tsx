import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Breadcrumb, Spin, Result } from 'antd';
import { ArrowLeftOutlined, HomeOutlined, CommentOutlined } from '@ant-design/icons';
import FeedbackDetail from '../components/FeedbackDetail';
import PageHeader from '../components/PageHeader';
import { useAppContext } from '../contexts/AppContext';

/**
 * 反馈详情页面
 */
const FeedbackDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppContext();
  const isStudent = user?.role === 'student';
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 返回列表页
  const goBack = () => {
    navigate(isStudent ? '/my-feedback' : '/feedback');
  };

  // 当状态更改时刷新页面
  const handleStatusChange = () => {
    // 重新加载当前页面数据
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    // 检查ID是否有效
    if (!id || isNaN(Number(id))) {
      setError('无效的反馈ID');
    }
    
    setLoading(false);
  }, [id]);

  if (error) {
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle={error}
        extra={
          <Button type="primary" onClick={goBack}>
            返回列表
          </Button>
        }
      />
    );
  }

  return (
    <div className="feedback-detail-page">
      <PageHeader
        title="反馈详情"
        subtitle={isStudent ? "查看我的反馈详情和处理进度" : "查看和处理学生的反馈"}
        icon={<CommentOutlined />}
        extra={
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={goBack}
          >
            返回列表
          </Button>
        }
      />
      
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item href="/dashboard">
          <HomeOutlined />
          <span>首页</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item href={isStudent ? '/my-feedback' : '/feedback'}>
          <CommentOutlined />
          <span>{isStudent ? '我的反馈' : '反馈管理'}</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>反馈详情 #{id}</Breadcrumb.Item>
      </Breadcrumb>
      
      {loading ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>加载反馈详情...</div>
          </div>
        </Card>
      ) : (
        <FeedbackDetail 
          feedbackId={Number(id)} 
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default FeedbackDetailPage; 