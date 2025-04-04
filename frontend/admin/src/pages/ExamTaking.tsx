import React from 'react';
import { Typography, Card } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';

const { Title } = Typography;

const ExamTaking: React.FC = () => {
  return (
    <div className="exam-taking-page">
      <PageHeader 
        title="参加考试" 
        icon={<FileTextOutlined />}
        description="参加在线考试，答题并提交答案"
      />
      
      <Card>
        <Title level={5}>考试参加功能正在开发中...</Title>
      </Card>
    </div>
  );
};

export default ExamTaking; 