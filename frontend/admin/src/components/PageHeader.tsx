import React, { ReactNode } from 'react';
import { Breadcrumb, Typography, Space, Button, Divider } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

export interface BreadcrumbItem {
  title: string;
  path?: string;
}

export interface Action {
  key: string;
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  type?: 'default' | 'primary' | 'ghost' | 'dashed' | 'link' | 'text';
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  extra?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  icon, 
  extra 
}) => {
  return (
    <div className="page-header" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size="middle" align="center">
          {icon && (
            <div style={{ fontSize: 24, color: '#1890ff' }}>
              {icon}
            </div>
          )}
          <Title level={3} style={{ margin: 0 }}>{title}</Title>
        </Space>
        
        {extra && (
          <div className="page-header-extra">
            {extra}
          </div>
        )}
      </div>
      
      {description && (
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">{description}</Text>
        </div>
      )}
      
      <Divider style={{ margin: '16px 0' }} />
    </div>
  );
};

export default PageHeader; 