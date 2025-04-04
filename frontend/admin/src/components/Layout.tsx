import React, { ReactNode } from 'react';
import { Layout as AntLayout } from 'antd';
import SideMenu from './SideMenu';
import { useAppContext } from '../contexts/AppContext';

const { Header, Content, Footer, Sider } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarCollapsed, toggleSidebar } = useAppContext();

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={sidebarCollapsed}
        onCollapse={toggleSidebar}
        width={256}
        theme="light"
        style={{
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            padding: sidebarCollapsed ? 0 : '0 24px',
          }}
        >
          <img
            src="/logo.svg"
            alt="Logo"
            style={{
              height: 32,
              marginRight: sidebarCollapsed ? 0 : 12,
            }}
          />
          {!sidebarCollapsed && (
            <h1
              style={{
                margin: 0,
                color: '#1890ff',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              在线学习系统
            </h1>
          )}
        </div>
        <SideMenu />
      </Sider>
      <AntLayout>
        <Content style={{ padding: 24, margin: 0 }}>
          {children}
        </Content>
        <Footer style={{ textAlign: 'center', padding: 12 }}>
          在线学习系统 ©{new Date().getFullYear()} - 教育技术研究所
        </Footer>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout; 