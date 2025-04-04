import { UserRole } from '../contexts/AppContext';

// 定义角色层级
const roleHierarchy = {
  admin: 3,
  teacher: 2,
  student: 1,
};

// 定义不同模块的权限
export interface ModulePermissions {
  [key: string]: {
    read: boolean;
    write: boolean;
    delete: boolean;
    manage: boolean;
  };
}

/**
 * 检查用户角色是否有权限访问
 * @param userRole 用户角色
 * @param allowedRoles 允许的角色列表
 * @returns 是否有权限
 */
export const hasPermission = (userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean => {
  if (!userRole) {
    console.log('权限检查: 未找到用户角色，拒绝访问');
    return false;
  }
  
  const hasAccess = allowedRoles.includes(userRole);
  
  if (process.env.NODE_ENV === 'development') {
    if (hasAccess) {
      console.log(`权限检查: 用户角色 ${userRole} 有权访问 ${allowedRoles.join(', ')}`);
    } else {
      console.log(`权限检查: 用户角色 ${userRole} 无权访问，需要 ${allowedRoles.join(', ')}`);
    }
  }
  
  return hasAccess;
};

/**
 * 检查用户角色是否达到指定角色层级
 * @param userRole 用户角色
 * @param requiredRole 需要的角色
 * @returns 是否达到所需层级
 */
export const hasRoleLevel = (userRole: UserRole | undefined, requiredRole: UserRole): boolean => {
  if (!userRole) {
    console.log('权限级别检查: 未找到用户角色，拒绝访问');
    return false;
  }
  
  const hasAccess = (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
  
  if (process.env.NODE_ENV === 'development') {
    if (hasAccess) {
      console.log(`权限级别检查: 用户角色 ${userRole}(${roleHierarchy[userRole]}) 满足所需级别 ${requiredRole}(${roleHierarchy[requiredRole]})`);
    } else {
      console.log(`权限级别检查: 用户角色 ${userRole}(${roleHierarchy[userRole]}) 不满足所需级别 ${requiredRole}(${roleHierarchy[requiredRole]})`);
    }
  }
  
  return hasAccess;
};

// 系统权限定义
export const Permissions = {
  DASHBOARD: {
    VIEW: ['admin', 'teacher', 'student'] as UserRole[],
    MANAGE: ['admin'] as UserRole[],
    STUDENT_FEATURES: ['student'] as UserRole[],
    TEACHER_FEATURES: ['teacher'] as UserRole[],
    ADMIN_FEATURES: ['admin'] as UserRole[],
  },
  COURSES: {
    VIEW: ['admin', 'teacher', 'student'] as UserRole[],
    MANAGE: ['admin', 'teacher'] as UserRole[],
    CREATE: ['admin', 'teacher'] as UserRole[],
    DELETE: ['admin'] as UserRole[],
    ENROLL: ['student'] as UserRole[],
    TEACH: ['teacher'] as UserRole[],
  },
  MATERIALS: {
    VIEW: ['admin', 'teacher', 'student'] as UserRole[],
    MANAGE: ['admin', 'teacher'] as UserRole[],
    CREATE: ['admin', 'teacher'] as UserRole[],
    DELETE: ['admin'] as UserRole[],
    DOWNLOAD: ['admin', 'teacher', 'student'] as UserRole[],
    RATE: ['admin', 'teacher', 'student'] as UserRole[],
  },
  USERS: {
    VIEW: ['admin'] as UserRole[],
    MANAGE: ['admin'] as UserRole[],
    CREATE: ['admin'] as UserRole[],
    DELETE: ['admin'] as UserRole[],
  },
  KNOWLEDGE_GRAPH: {
    VIEW: ['admin', 'teacher', 'student'] as UserRole[],
    MANAGE: ['admin', 'teacher'] as UserRole[],
    CREATE: ['admin', 'teacher'] as UserRole[],
    DELETE: ['admin'] as UserRole[],
    PROGRESS_TRACKING: ['student'] as UserRole[],
    APPLY: ['admin', 'teacher'] as UserRole[],
  },
  ASSIGNMENTS: {
    VIEW: ['admin', 'teacher', 'student'] as UserRole[],
    MANAGE: ['admin', 'teacher'] as UserRole[],
    CREATE: ['admin', 'teacher'] as UserRole[],
    DELETE: ['admin', 'teacher'] as UserRole[],
    SUBMIT: ['student'] as UserRole[],
    GRADE: ['admin', 'teacher'] as UserRole[],
    REQUEST_EXTENSION: ['student'] as UserRole[],
  },
  EVALUATIONS: {
    VIEW: ['admin', 'teacher', 'student'] as UserRole[],
    MANAGE: ['admin', 'teacher'] as UserRole[],
    CREATE: ['admin', 'teacher'] as UserRole[],
    DELETE: ['admin'] as UserRole[],
    VIEW_OWN: ['student'] as UserRole[],
  },
  EXAMS: {
    VIEW: ['admin', 'teacher', 'student'] as UserRole[],
    MANAGE: ['admin', 'teacher'] as UserRole[],
    CREATE: ['teacher'] as UserRole[],
    EDIT: ['teacher'] as UserRole[],
    DELETE: ['admin', 'teacher'] as UserRole[],
    REVIEW: ['admin'] as UserRole[],
    PUBLISH: ['admin', 'teacher'] as UserRole[],
    TAKE: ['student'] as UserRole[],
    GRADE: ['admin', 'teacher'] as UserRole[],
    VIEW_RESULTS: ['admin', 'teacher', 'student'] as UserRole[],
    VIEW_ANALYTICS: ['admin', 'teacher'] as UserRole[],
    VIEW_OWN_RESULTS: ['student'] as UserRole[],
  },
  SETTINGS: {
    VIEW: ['admin'] as UserRole[],
    MANAGE: ['admin'] as UserRole[],
  },
  STUDENT_FEATURES: {
    LEARNING_PROGRESS: ['student'] as UserRole[],
    ACHIEVEMENTS: ['student'] as UserRole[],
    COMPETITIONS: ['student'] as UserRole[],
    POINTS_HISTORY: ['student'] as UserRole[],
    STUDY_PARTNERS: ['student'] as UserRole[],
    CHALLENGES: ['student'] as UserRole[],
    LEARNING_CENTER: ['student'] as UserRole[],
    ASSIGNMENTS: ['student'] as UserRole[],
  },
  TEACHER_FEATURES: {
    CLASS_MANAGEMENT: ['teacher'] as UserRole[],
    STUDENT_ASSESSMENT: ['teacher'] as UserRole[],
    GRADING: ['teacher'] as UserRole[],
    COURSE_ANALYTICS: ['teacher'] as UserRole[],
  },
  TEACHER_GROUPS: {
    VIEW: ['admin', 'teacher'] as UserRole[],
    MANAGE: ['admin'] as UserRole[],
    JOIN: ['teacher'] as UserRole[],
    TEACHING_RESEARCH: ['admin', 'teacher'] as UserRole[],
    LESSON_PREPARATION: ['admin', 'teacher'] as UserRole[],
    REVIEW: ['admin', 'teacher'] as UserRole[],
    KNOWLEDGE_GRAPH_REVIEW: ['admin', 'teacher'] as UserRole[],
    EVALUATION_REVIEW: ['admin', 'teacher'] as UserRole[],
  },
  ADMIN_FEATURES: {
    SYSTEM_ANALYTICS: ['admin'] as UserRole[],
    USER_MANAGEMENT: ['admin'] as UserRole[],
    SITE_CONFIGURATION: ['admin'] as UserRole[],
    ROLE_MANAGEMENT: ['admin'] as UserRole[],
  },
};

/**
 * 功能模块权限配置
 * 定义每个功能模块需要的权限
 */
export const ModulePermissions = {
  // 仪表盘相关
  ADMIN_DASHBOARD: ['dashboard.view', 'dashboard.admin_features'],
  TEACHER_DASHBOARD: ['dashboard.view', 'dashboard.teacher_features'],
  STUDENT_DASHBOARD: ['dashboard.view', 'dashboard.student_features'],
  
  // 课程相关
  COURSE_MANAGEMENT: ['courses.manage'],
  TEACHER_COURSES: ['courses.teach'],
  STUDENT_COURSES: ['courses.view', 'courses.enroll'],
  
  // 素材相关
  MATERIAL_MANAGEMENT: ['materials.manage'],
  MATERIAL_SEARCH: ['materials.view'],
  MATERIAL_STATS: ['materials.view', 'materials.manage'],
  
  // 知识图谱相关
  KNOWLEDGE_GRAPH_MANAGEMENT: ['knowledge_graph.manage'],
  KNOWLEDGE_GRAPH_VIEW: ['knowledge_graph.view'],
  
  // 学生特有功能
  STUDENT_ACHIEVEMENTS: ['student_features.achievements'],
  STUDENT_LEARNING_PROGRESS: ['student_features.learning_progress'],
  STUDENT_COMPETITIONS: ['student_features.competitions'],
  STUDENT_CHALLENGES: ['student_features.challenges'],
  STUDENT_LEARNING_CENTER: ['student_features.learning_center'],
  STUDENT_POINTS_SYSTEM: ['student_features.points_history'],
  STUDENT_ASSIGNMENTS: ['assignments.submit', 'student_features.assignments'],
  
  // 教师特有功能
  TEACHER_GRADING: ['teacher_features.grading', 'assignments.grade'],
  CLASS_EVALUATION: ['teacher_features.student_assessment', 'evaluations.manage'],
  
  // 教师分组功能
  TEACHER_RESEARCH_GROUP: ['teacher_groups.teaching_research'],
  TEACHER_PREPARATION_GROUP: ['teacher_groups.lesson_preparation'],
  TEACHER_REVIEW_GROUP: ['teacher_groups.review'],
  KNOWLEDGE_GRAPH_REVIEW: ['teacher_groups.knowledge_graph_review', 'knowledge_graph.apply'],
  EVALUATION_SYSTEM_REVIEW: ['teacher_groups.evaluation_review', 'evaluations.manage'],
  
  // 考试中心相关
  EXAM_CENTER: ['exams.view'],
  EXAM_MANAGEMENT: ['exams.manage'],
  EXAM_CREATION: ['exams.create', 'exams.edit'],
  EXAM_REVIEW: ['exams.review'],
  STUDENT_EXAMS: ['exams.take', 'exams.view_own_results'],
  EXAM_GRADING: ['exams.grade'],
  EXAM_ANALYTICS: ['exams.view_analytics'],
  
  // 管理员特有功能
  USER_MANAGEMENT: ['admin_features.user_management', 'users.manage'],
  SYSTEM_SETTINGS: ['admin_features.site_configuration', 'settings.manage'],
};

/**
 * 检查用户是否具有访问特定模块的权限
 * @param userRole 用户角色
 * @param moduleKey 模块键名
 * @returns 是否有权限
 */
export const hasModulePermission = (userRole: UserRole | undefined, moduleKey: keyof typeof ModulePermissions): boolean => {
  if (!userRole) {
    console.log(`模块权限检查: 未找到用户角色，拒绝访问模块 ${moduleKey}`);
    return false;
  }
  
  const requiredPermissions = ModulePermissions[moduleKey];
  
  if (!requiredPermissions || requiredPermissions.length === 0) {
    console.log(`模块权限检查: 未定义模块 ${moduleKey} 的权限`);
    return false;
  }
  
  const hasAccess = requiredPermissions.every(permString => {
    const [resource, action] = permString.split('.');
    if (!resource || !action) {
      console.error(`模块权限检查: 权限格式错误 ${permString}`);
      return false;
    }
    
    const permissionGroup = Permissions[resource.toUpperCase() as keyof typeof Permissions];
    if (!permissionGroup) {
      console.error(`模块权限检查: 未找到权限组 ${resource}`);
      return false;
    }
    
    const allowedRoles = permissionGroup[action.toUpperCase() as keyof typeof permissionGroup];
    if (!allowedRoles) {
      console.error(`模块权限检查: 未找到权限 ${resource}.${action}`);
      return false;
    }
    
    return allowedRoles.includes(userRole);
  });
  
  if (process.env.NODE_ENV === 'development') {
    if (hasAccess) {
      console.log(`模块权限检查: 用户角色 ${userRole} 有权访问模块 ${moduleKey}`);
    } else {
      console.log(`模块权限检查: 用户角色 ${userRole} 无权访问模块 ${moduleKey}`);
    }
  }
  
  return hasAccess;
};

/**
 * 根据用户角色获取菜单可见性
 * @param userRole 用户角色
 * @returns 菜单可见性配置
 */
export const getMenuVisibility = (userRole: UserRole | undefined): Record<string, boolean> => {
  // 默认所有菜单项不可见
  const defaultVisibility = {
    // 仪表盘
    dashboard: false,
    
    // 课程相关
    courseManagement: false,
    teacherCourses: false,
    studentCourses: false,
    
    // 教师管理
    teacherManagement: false,
    
    // 学生管理
    studentManagement: false,
    
    // 素材相关
    materials: false,
    materialsList: false,
    materialsSearch: false,
    materialsStatistics: false,
    materialsUpload: false,
    materialsCategory: false,
    
    // 知识图谱相关
    knowledgeGraph: false,
    knowledgeGraphManagement: false,
    knowledgeGraphView: false,
    knowledgeGraphTest: false,
    
    // 申请管理
    applications: false,
    
    // 作业相关
    teacherAssignments: false,
    studentAssignments: false,
    
    // 评估相关
    evaluation: false,
    studentEvaluation: false,
    classEvaluation: false,
    
    // 学生相关
    studentProgress: false,
    studentLearningCenter: false,
    studentAchievements: false,
    studentCompetitions: false,
    studentPointsHistory: false,
    
    // 系统设置
    systemSettings: false,
    
    // API测试
    apiTest: false,
  };

  if (!userRole) return defaultVisibility;

  // 基于角色设置可见性
  if (userRole === 'admin') {
    return {
      ...defaultVisibility,
      // 仪表盘
      dashboard: true,
      
      // 课程相关
      courseManagement: true,
      
      // 教师管理
      teacherManagement: true,
      
      // 学生管理
      studentManagement: true,
      
      // 素材相关
      materials: true,
      materialsList: true,
      materialsSearch: true,
      materialsStatistics: true,
      materialsUpload: true,
      materialsCategory: true,
      
      // 知识图谱相关
      knowledgeGraph: true,
      knowledgeGraphManagement: true,
      knowledgeGraphView: true,
      knowledgeGraphTest: true,
      
      // 申请管理
      applications: true,
      
      // 评估相关
      evaluation: true,
      studentEvaluation: true,
      classEvaluation: true,
      
      // 系统设置
      systemSettings: true,
      
      // API测试 (仅在开发环境)
      apiTest: process.env.NODE_ENV === 'development',
    };
  }

  if (userRole === 'teacher') {
    return {
      ...defaultVisibility,
      // 仪表盘
      dashboard: true,
      
      // 课程相关
      teacherCourses: true,
      
      // 素材相关
      materials: true,
      materialsList: true,
      materialsSearch: true,
      materialsUpload: true,
      
      // 知识图谱相关
      knowledgeGraph: true,
      knowledgeGraphManagement: true,
      knowledgeGraphView: true,
      knowledgeGraphTest: true,
      
      // 作业相关
      teacherAssignments: true,
      
      // 评估相关
      evaluation: true,
      studentEvaluation: true,
      classEvaluation: true,
      
      // 通知管理
      notificationManagement: true,
    };
  }

  if (userRole === 'student') {
    return {
      ...defaultVisibility,
      // 仪表盘
      dashboard: true,
      
      // 课程相关
      studentCourses: true,
      
      // 素材相关
      materialsSearch: true,
      
      // 知识图谱相关
      knowledgeGraphView: true,
      
      // 作业相关
      studentAssignments: true,
      
      // 评估相关
      evaluation: true,
      studentEvaluation: true,
      
      // 学生相关
      studentProgress: true,
      studentLearningCenter: true,
      studentAchievements: true,
      studentCompetitions: true,
      studentPointsHistory: true,
    };
  }

  return defaultVisibility;
};

// 权限判断工具函数
export const hasPermissionByType = (
  permissions: any,
  permission: string | string[]
): boolean => {
  if (!permissions) return false;

  // 如果是数组，检查是否满足数组中的任一权限
  if (Array.isArray(permission)) {
    return permission.some(p => hasPermissionByType(permissions, p));
  }

  // 如果是包含点的权限格式，则按资源和动作分割
  if (permission.includes('.')) {
    const [resource, action] = permission.split('.');
    return resource && action && permissions[resource]?.[action];
  }

  // 否则直接检查权限对象中是否有该权限
  return !!permissions[permission];
};

// 判断用户角色是否在允许的角色列表中
export const hasRolePermission = (
  userRole: UserRole | undefined,
  allowedRoles: UserRole[]
): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

/**
 * 根据角色获取默认模块权限列表
 * @param role 用户角色
 * @returns 该角色允许访问的模块列表
 */
export const getDefaultModulePermissionsByRole = (role: UserRole | undefined): string[] => {
  if (!role) return [];
  
  // 根据不同角色返回默认权限
  switch (role) {
    case 'admin':
      return [
        'dashboard',
        'course_management',
        'teacher_management',
        'student_management',
        'material_management',
        'knowledge_graph',
        'application_management',
        'system_settings',
        'notifications',
        'feedback_management',
        'evaluation_management',
        'exam_management'
      ];
    case 'teacher':
      return [
        'dashboard',
        'course_view',
        'course_edit',
        'student_view',
        'material_view',
        'material_edit',
        'knowledge_graph_view',
        'knowledge_graph_edit',
        'feedback_management',
        'evaluation_management',
        'notification_management',
        'exam_management',
        'exam_creation',
        'exam_grading',
        'teacher_courses',
        'teacher_assignments',
        'teacher_evaluations'
      ];
    case 'student':
      return [
        'dashboard',
        'course_view',
        'material_view',
        'knowledge_graph_view',
        'feedback_submit',
        'exam_take',
        'student_courses',
        'student_assignments',
        'student_progress',
        'student_evaluation',
        'student_achievements'
      ];
    default:
      return [];
  }
};

/**
 * 检查用户对特定模块的权限
 * @param role 用户角色
 * @param permissions 用户拥有的权限列表
 * @param module 要检查的模块
 * @returns 是否有权限
 */
export const checkModulePermission = (
  role: UserRole | undefined,
  permissions: string[],
  module: string
): boolean => {
  // 如果没有角色信息，则无权限
  if (!role) return false;
  
  // 管理员拥有所有权限
  if (role === 'admin') return true;
  
  // 检查是否在权限列表中
  return permissions.includes(module);
};

/**
 * 检查特定功能是否对角色可用
 * @param feature 功能名称
 * @param role 用户角色
 * @returns 是否可用
 */
export const isFeatureAvailableForRole = (feature: string, role: UserRole | undefined): boolean => {
  if (!role) return false;
  
  // 管理员可以访问所有功能
  if (role === 'admin') return true;
  
  // 功能对角色的映射
  const featureRoleMap: Record<string, UserRole[]> = {
    'dashboard': ['admin', 'teacher', 'student'],
    'course_management': ['admin'],
    'course_view': ['admin', 'teacher', 'student'],
    'course_edit': ['admin', 'teacher'],
    'teacher_management': ['admin'],
    'student_management': ['admin', 'teacher'],
    'material_management': ['admin', 'teacher'],
    'material_view': ['admin', 'teacher', 'student'],
    'material_edit': ['admin', 'teacher'],
    'knowledge_graph_management': ['admin', 'teacher'],
    'knowledge_graph_view': ['admin', 'teacher', 'student'],
    'application_management': ['admin'],
    'system_settings': ['admin'],
    'feedback_management': ['admin', 'teacher'],
    'feedback_submit': ['admin', 'teacher', 'student'],
    'evaluation_management': ['admin', 'teacher'],
    'exam_management': ['admin', 'teacher'],
    'exam_creation': ['admin', 'teacher'],
    'exam_grading': ['admin', 'teacher'],
    'exam_take': ['student'],
    'student_progress': ['student'],
    'student_achievements': ['student'],
    'student_competitions': ['student'],
    'teacher_evaluations': ['admin', 'teacher'],
    'student_evaluation': ['admin', 'teacher', 'student'],
    'teacher_courses': ['teacher'],
    'student_courses': ['student'],
    'teacher_assignments': ['teacher'],
    'student_assignments': ['student'],
    'notification_management': ['admin', 'teacher']
  };
  
  // 检查功能是否对该角色可用
  const allowedRoles = featureRoleMap[feature] || [];
  return allowedRoles.includes(role);
};

// 导出更多实用函数
export const hasAdminAccess = (role: UserRole | undefined): boolean => role === 'admin';
export const hasTeacherAccess = (role: UserRole | undefined): boolean => role === 'admin' || role === 'teacher';
export const hasStudentAccess = (role: UserRole | undefined): boolean => true; // 所有角色都可以访问学生可见内容 