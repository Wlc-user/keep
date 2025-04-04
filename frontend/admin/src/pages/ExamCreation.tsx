import React from 'react';
import { Typography, Card } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';

const { Title } = Typography;

const ExamCreation: React.FC = () => {
  return (
    <div className="exam-creation-page">
      <PageHeader 
        title="创建考试" 
        icon={<EditOutlined />}
        description="创建新的考试，添加考试题目和设置考试规则"
      />
      
      <Card>
        <Title level={5}>考试创建功能正在开发中...</Title>
      </Card>
    </div>
  );
};

export default ExamCreation; 