import { useContext, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { 
  getDefaultModulePermissionsByRole, 
  checkModulePermission as checkModule,
  isFeatureAvailableForRole 
} from '../utils/permissionUtils';

export interface MenuVisibility {
  dashboard?: boolean;
  courseManagement?: boolean;
  teacherCourses?: boolean;
  studentCourses?: boolean;
  teacherManagement?: boolean;
  studentManagement?: boolean;
  materials?: boolean;
  materialsList?: boolean;
  materialsSearch?: boolean;
  materialsStatistics?: boolean;
  materialsUpload?: boolean;
  materialsCategory?: boolean;
  knowledgeGraph?: boolean;
  knowledgeGraphManagement?: boolean;
  knowledgeGraphView?: boolean;
  knowledgeGraphTest?: boolean;
  applications?: boolean;
  teacherAssignments?: boolean;
  studentAssignments?: boolean;
  evaluation?: boolean;
  studentEvaluation?: boolean;
  classEvaluation?: boolean;
  studentProgress?: boolean;
  studentLearningCenter?: boolean;
  studentAchievements?: boolean;
  studentCompetitions?: boolean;
  studentPointsHistory?: boolean;
  systemSettings?: boolean;
  apiTest?: boolean;
  notificationManagement?: boolean;
  // 教师分组相关菜单项
  teacherGroups?: boolean; 
  teacherResearchGroup?: boolean;
  teacherPreparationGroup?: boolean;
  teacherReviewGroup?: boolean;
  knowledgeGraphReview?: boolean;
  evaluationSystemReview?: boolean;
  // 考试中心相关菜单项
  examCenter?: boolean;
  examManagement?: boolean;
  examCreation?: boolean;
  examReview?: boolean;
  studentExams?: boolean;
  examAnalytics?: boolean;
}

/**
 * 权限钩子，用于检查和管理用户权限
 */
const usePermission = () => {
  const { user, userPermissions } = useAppContext();
  
  // 用户角色
  const userRole = user?.role;
  
  // 检查教师是否在特定分组中
  const isInTeacherGroup = (groupType: string): boolean => {
    if (!user || user.role !== 'teacher' || !user.teacherGroups) return false;
    return user.teacherGroups.some(group => group.type === groupType);
  };
  
  // 检查是否是特定分组的组长
  const isTeacherGroupLeader = (groupType: string): boolean => {
    if (!user || user.role !== 'teacher' || !user.teacherGroups || !user.isGroupLeader) return false;
    return user.teacherGroups.some(group => group.type === groupType && group.leaderId === user.id);
  };
  
  // 权限和模块权限
  const permissions = useMemo(() => userPermissions || {}, [userPermissions]);
  const modulePermissions = useMemo(() => {
    if (!userRole) return [];
    // 如果用户有自定义模块权限列表，使用它
    if (user?.modulePermissions && Array.isArray(user.modulePermissions)) {
      return user.modulePermissions;
    }
    // 否则根据角色返回默认模块权限
    return getDefaultModulePermissionsByRole(userRole);
  }, [userRole, user?.modulePermissions]);
  
  // 检查是否有特定模块权限
  const checkModulePermission = (module: string): boolean => {
    return checkModule(userRole, modulePermissions, module);
  };
  
  // 检查功能是否对当前角色可用
  const isFeatureAvailable = (feature: string): boolean => {
    return isFeatureAvailableForRole(feature, userRole);
  };
  
  // 判断是否是学生
  const isStudent = userRole === 'student';
  
  // 判断是否是教师
  const isTeacher = userRole === 'teacher';
  
  // 判断是否是管理员
  const isAdmin = userRole === 'admin';
  
  // 判断是否在教研组
  const isInResearchGroup = isInTeacherGroup('research');
  
  // 判断是否在备课组
  const isInPreparationGroup = isInTeacherGroup('preparation');
  
  // 判断是否在审查组
  const isInReviewGroup = isInTeacherGroup('review');
  
  // 判断是否在知识图谱审查组
  const isInKnowledgeGraphReviewGroup = isInTeacherGroup('knowledge_graph');
  
  // 判断是否在评价系统审查组
  const isInEvaluationReviewGroup = isInTeacherGroup('evaluation');
  
  // 菜单可见性配置
  const menuVisibility = useMemo<MenuVisibility>(() => ({
    dashboard: true,
    courseManagement: isAdmin,
    teacherCourses: isTeacher,
    studentCourses: isStudent,
    teacherManagement: isAdmin,
    studentManagement: isAdmin,
    materials: isAdmin || isTeacher,
    materialsList: isAdmin || isTeacher,
    materialsSearch: true,
    materialsStatistics: isAdmin,
    materialsUpload: isAdmin || isTeacher,
    materialsCategory: isAdmin,
    knowledgeGraph: isAdmin || isTeacher,
    knowledgeGraphManagement: isAdmin || isTeacher,
    knowledgeGraphView: true,
    knowledgeGraphTest: isAdmin || isTeacher,
    applications: isAdmin,
    teacherAssignments: isTeacher,
    studentAssignments: isStudent,
    evaluation: isAdmin || isTeacher,
    studentEvaluation: true,
    classEvaluation: isAdmin || isTeacher,
    studentProgress: isStudent,
    studentLearningCenter: isStudent,
    studentAchievements: isStudent,
    studentCompetitions: isStudent,
    studentPointsHistory: isStudent,
    systemSettings: isAdmin,
    apiTest: isAdmin && process.env.NODE_ENV === 'development',
    notificationManagement: isAdmin || isTeacher,
    // 教师分组菜单项
    teacherGroups: isAdmin || isTeacher,
    teacherResearchGroup: isAdmin || isInResearchGroup,
    teacherPreparationGroup: isAdmin || isInPreparationGroup,
    teacherReviewGroup: isAdmin || isInReviewGroup,
    knowledgeGraphReview: isAdmin || isInKnowledgeGraphReviewGroup,
    evaluationSystemReview: isAdmin || isInEvaluationReviewGroup,
    // 考试中心相关菜单项
    examCenter: true,
    examManagement: isAdmin || isTeacher,
    examCreation: isTeacher,
    examReview: isAdmin,
    studentExams: isStudent,
    examAnalytics: isAdmin || isTeacher
  }), [isAdmin, isTeacher, isStudent, isInResearchGroup, isInPreparationGroup, isInReviewGroup, isInKnowledgeGraphReviewGroup, isInEvaluationReviewGroup]);
  
  return {
    userRole,
    permissions,
    modulePermissions,
    checkModulePermission,
    isFeatureAvailable,
    isStudent,
    isTeacher,
    isAdmin,
    // 教师分组相关
    isInResearchGroup,
    isInPreparationGroup, 
    isInReviewGroup,
    isInKnowledgeGraphReviewGroup,
    isInEvaluationReviewGroup,
    isTeacherGroupLeader,
    menuVisibility
  };
};

export default usePermission; 