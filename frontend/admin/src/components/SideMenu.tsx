import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import AdminMenu from './AdminMenu';
import TeacherMenu from './TeacherMenu';
import StudentMenu from './StudentMenu';
import './SideMenu.css';

/**
 * 侧边栏菜单组件，根据用户角色显示不同的菜单
 */
const SideMenu: React.FC = () => {
  const { user } = useAppContext();
  
  console.log('SideMenu - Current user:', user);
  
  // 获取用户角色，默认为学生
  const userRole = user?.role || 'student';
  console.log('SideMenu - User role:', userRole);

  // 根据用户角色渲染对应的菜单
  const renderMenu = () => {
    console.log('SideMenu - Rendering menu for role:', userRole);
    switch (userRole) {
      case 'admin':
        return <AdminMenu />;
      case 'teacher':
        return <TeacherMenu />;
      case 'student':
      default:
        return <StudentMenu />;
    }
  };

  return (
    <>
      {renderMenu()}
    </>
  );
};

export default SideMenu; 