import { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { hasPermission, hasRoleLevel, hasModulePermission, Permissions, getMenuVisibility, ModulePermissions } from '../utils/permissionUtils';
import { UserRole } from '../contexts/AppContext';

// 权限检查的自定义Hook
const usePermission = () => {
  const { user } = useAppContext();
  const [userRole, setUserRole] = useState<UserRole | undefined>(undefined);
  const [menuVisibility, setMenuVisibility] = useState<Record<string, boolean>>({});
  
  // 监听用户角色变化，更新权限
  useEffect(() => {
    if (user && user.role) {
      setUserRole(user.role as UserRole);
      // 根据用户角色设置菜单可见性
      const visibility = getMenuVisibility(user.role as UserRole);
      setMenuVisibility(visibility);
      
      // 调试日志
      console.log(`usePermission: 用户角色 ${user.role}, 权限已加载`);
    } else {
      setUserRole(undefined);
      setMenuVisibility({});
    }
  }, [user]);

  // 检查特定权限
  const hasPermission = (permissionType: string): boolean => {
    // 处理特殊权限检查
    if (permissionType === 'learning-center-view') {
      return menuVisibility.studentLearningCenter || false;
    }
    
    if (permissionType === 'assignments-view') {
      return menuVisibility.studentAssignments || false;
    }

    if (permissionType === 'achievements-view') {
      return menuVisibility.studentAchievements || false;
    }

    if (permissionType === 'competitions-view') {
      return menuVisibility.studentCompetitions || false;
    }

    if (permissionType === 'points-history-view') {
      return menuVisibility.studentPointsHistory || false;
    }
    
    // 默认权限判断
    return menuVisibility[permissionType] || false;
  };

  // 检查用户是否有特定权限
  const checkPermission = (allowedRoles: UserRole[]) => hasPermission(userRole, allowedRoles);

  // 检查用户是否有特定层级权限
  const checkRoleLevel = (requiredRole: UserRole) => hasRoleLevel(userRole, requiredRole);
  
  // 检查用户是否有特定模块权限
  const checkModulePermission = (moduleKey: keyof typeof ModulePermissions) => 
    hasModulePermission(userRole, moduleKey);

  // 权限状态对象
  const permissions = useMemo(() => ({
    dashboard: {
      view: hasPermission(Permissions.DASHBOARD.VIEW),
      manage: hasPermission(Permissions.DASHBOARD.MANAGE),
      studentFeatures: hasPermission(Permissions.DASHBOARD.STUDENT_FEATURES),
      teacherFeatures: hasPermission(Permissions.DASHBOARD.TEACHER_FEATURES),
      adminFeatures: hasPermission(Permissions.DASHBOARD.ADMIN_FEATURES),
    },
    courses: {
      view: hasPermission(Permissions.COURSES.VIEW),
      manage: hasPermission(Permissions.COURSES.MANAGE),
      create: hasPermission(Permissions.COURSES.CREATE),
      delete: hasPermission(Permissions.COURSES.DELETE),
      enroll: hasPermission(Permissions.COURSES.ENROLL),
      teach: hasPermission(Permissions.COURSES.TEACH),
    },
    materials: {
      view: hasPermission(Permissions.MATERIALS.VIEW),
      manage: hasPermission(Permissions.MATERIALS.MANAGE),
      create: hasPermission(Permissions.MATERIALS.CREATE),
      delete: hasPermission(Permissions.MATERIALS.DELETE),
      download: hasPermission(Permissions.MATERIALS.DOWNLOAD),
      rate: hasPermission(Permissions.MATERIALS.RATE),
    },
    users: {
      view: hasPermission(Permissions.USERS.VIEW),
      manage: hasPermission(Permissions.USERS.MANAGE),
      create: hasPermission(Permissions.USERS.CREATE),
      delete: hasPermission(Permissions.USERS.DELETE),
    },
    knowledgeGraph: {
      view: hasPermission(Permissions.KNOWLEDGE_GRAPH.VIEW),
      manage: hasPermission(Permissions.KNOWLEDGE_GRAPH.MANAGE),
      create: hasPermission(Permissions.KNOWLEDGE_GRAPH.CREATE),
      delete: hasPermission(Permissions.KNOWLEDGE_GRAPH.DELETE),
      progressTracking: hasPermission(Permissions.KNOWLEDGE_GRAPH.PROGRESS_TRACKING),
    },
    assignments: {
      view: hasPermission(Permissions.ASSIGNMENTS.VIEW),
      manage: hasPermission(Permissions.ASSIGNMENTS.MANAGE),
      create: hasPermission(Permissions.ASSIGNMENTS.CREATE),
      delete: hasPermission(Permissions.ASSIGNMENTS.DELETE),
      submit: hasPermission(Permissions.ASSIGNMENTS.SUBMIT),
      grade: hasPermission(Permissions.ASSIGNMENTS.GRADE),
      requestExtension: hasPermission(Permissions.ASSIGNMENTS.REQUEST_EXTENSION),
    },
    evaluations: {
      view: hasPermission(Permissions.EVALUATIONS.VIEW),
      manage: hasPermission(Permissions.EVALUATIONS.MANAGE),
      create: hasPermission(Permissions.EVALUATIONS.CREATE),
      delete: hasPermission(Permissions.EVALUATIONS.DELETE),
      viewOwn: hasPermission(Permissions.EVALUATIONS.VIEW_OWN),
    },
    settings: {
      view: hasPermission(Permissions.SETTINGS.VIEW),
      manage: hasPermission(Permissions.SETTINGS.MANAGE),
    },
    studentFeatures: {
      learningProgress: hasPermission(Permissions.STUDENT_FEATURES.LEARNING_PROGRESS),
      achievements: hasPermission(Permissions.STUDENT_FEATURES.ACHIEVEMENTS),
      competitions: hasPermission(Permissions.STUDENT_FEATURES.COMPETITIONS),
      pointsHistory: hasPermission(Permissions.STUDENT_FEATURES.POINTS_HISTORY),
      studyPartners: hasPermission(Permissions.STUDENT_FEATURES.STUDY_PARTNERS),
      challenges: hasPermission(Permissions.STUDENT_FEATURES.CHALLENGES),
      learningCenter: hasPermission(Permissions.STUDENT_FEATURES.LEARNING_CENTER),
      assignments: hasPermission(Permissions.STUDENT_FEATURES.ASSIGNMENTS),
    },
    teacherFeatures: {
      classManagement: hasPermission(Permissions.TEACHER_FEATURES.CLASS_MANAGEMENT),
      studentAssessment: hasPermission(Permissions.TEACHER_FEATURES.STUDENT_ASSESSMENT),
      grading: hasPermission(Permissions.TEACHER_FEATURES.GRADING),
      courseAnalytics: hasPermission(Permissions.TEACHER_FEATURES.COURSE_ANALYTICS),
    },
    adminFeatures: {
      systemAnalytics: hasPermission(Permissions.ADMIN_FEATURES.SYSTEM_ANALYTICS),
      userManagement: hasPermission(Permissions.ADMIN_FEATURES.USER_MANAGEMENT),
      siteConfiguration: hasPermission(Permissions.ADMIN_FEATURES.SITE_CONFIGURATION),
      roleManagement: hasPermission(Permissions.ADMIN_FEATURES.ROLE_MANAGEMENT),
    },
  }), [userRole]);
  
  // 模块权限检查
  const modules = useMemo(() => {
    const result: Record<string, boolean> = {};
    
    // 遍历所有模块权限配置
    Object.keys(ModulePermissions).forEach(key => {
      result[key] = hasModulePermission(
        userRole, 
        key as keyof typeof ModulePermissions
      );
    });
    
    return result;
  }, [userRole]);

  return {
    userRole,
    checkPermission,
    checkRoleLevel,
    checkModulePermission,
    permissions,
    menuVisibility,
    modules,
    hasPermission,
  };
};

export default usePermission; 