import React, { useState, useEffect } from 'react';
import { Tabs, Typography, Card, message } from 'antd';
import { 
  FileTextOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ScheduleOutlined
} from '@ant-design/icons';
import { useAppContext } from '../contexts/AppContext';
import usePermission from '../hooks/usePermission';
import ExamManagement from './ExamManagement';
import ExamCreation from './ExamCreation';
import ExamReview from './ExamReview';
import StudentExams from './StudentExams';
import PageHeader from '../components/PageHeader';

const { Title, Paragraph } = Typography;

const ExamCenter: React.FC = () => {
  const { user } = useAppContext();
  const { isAdmin, isTeacher, isStudent } = usePermission();
  const [activeKey, setActiveKey] = useState<string>('');

  useEffect(() => {
    // 根据用户角色设置默认激活的标签页
    if (isAdmin) {
      setActiveKey('exam-review');
    } else if (isTeacher) {
      setActiveKey('exam-creation');
    } else if (isStudent) {
      setActiveKey('my-exams');
    }
  }, [isAdmin, isTeacher, isStudent]);

  // 定义标签页项目
  const tabItems = [];
  
  if (isAdmin) {
    tabItems.push({
      key: 'exam-review',
      label: <span><CheckCircleOutlined />考试审核</span>,
      children: <ExamReview />
    });
  }
  
  if (isAdmin || isTeacher) {
    tabItems.push({
      key: 'exam-management',
      label: <span><ScheduleOutlined />考试管理</span>,
      children: <ExamManagement />
    });
  }
  
  if (isTeacher) {
    tabItems.push({
      key: 'exam-creation',
      label: <span><EditOutlined />创建考试</span>,
      children: <ExamCreation />
    });
  }
  
  if (isStudent) {
    tabItems.push({
      key: 'my-exams',
      label: <span><FileTextOutlined />我的考试</span>,
      children: <StudentExams />
    });
  }

  return (
    <div className="exam-center-page">
      <PageHeader
        title="考试中心"
        icon={<FileTextOutlined />}
        description="对考试进行管理、创建、审核和参与"
      />

      <Card className="main-content-card" variant="bordered">
        <Tabs 
          activeKey={activeKey} 
          onChange={setActiveKey}
          items={tabItems}
        />
      </Card>
    </div>
  );
};

export default ExamCenter; 