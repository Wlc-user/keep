import React from 'react';
import { Typography, Card } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';

const { Title } = Typography;

const ExamGrading: React.FC = () => {
  return (
    <div className="exam-grading-page">
      <PageHeader 
        title="考试评分" 
        icon={<CheckCircleOutlined />}
        description="为学生的考试答卷进行评分和点评"
      />
      
      <Card>
        <Title level={5}>考试评分功能正在开发中...</Title>
      </Card>
    </div>
  );
};

export default ExamGrading; 