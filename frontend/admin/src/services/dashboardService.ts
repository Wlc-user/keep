import apiService from './api';
import { isDevelopment, getMockData } from '../utils/mockUtils';

/**
 * 仪表盘数据服务
 * 处理获取仪表盘统计数据、图表数据等功能
 */
export class DashboardService {
  /**
   * 获取仪表盘统计数据
   * @param userRole 用户角色（可选）
   * @returns 统计数据
   */
  async getStatistics(userRole?: string): Promise<any> {
    try {
      console.log('获取仪表盘统计数据');
      
      // 在开发环境直接返回模拟数据
      if (import.meta.env.DEV) {
        console.log('使用模拟仪表盘数据');
        return this.getMockStatistics(userRole);
      }
      
      const url = userRole ? `/api/dashboard/statistics?role=${userRole}` : '/api/dashboard/statistics';
      
      // 通过API服务获取数据
      const response = await apiService.get(url);
      console.log('仪表盘统计数据:', response);
      return response;
    } catch (error) {
      console.error('获取仪表盘统计数据失败:', error);
      
      // 开发环境使用模拟数据
      if (import.meta.env.DEV) {
        console.log('使用模拟仪表盘数据');
        return this.getMockStatistics(userRole);
      }
      
      throw error;
    }
  }

  /**
   * 获取图表数据
   * @param chartType 图表类型
   * @param params 查询参数
   * @returns 图表数据
   */
  async getChartData(chartType: string, params?: any): Promise<any> {
    try {
      console.log(`获取${chartType}图表数据`);
      const url = `/api/dashboard/charts/${chartType}`;
      
      // 在开发环境直接返回模拟数据，避免数据格式错误
      if (import.meta.env.DEV) {
        console.log(`使用模拟${chartType}图表数据`);
        return this.getMockChartData(chartType);
      }
      
      // 通过API服务获取数据
      const response = await apiService.get(url, params);
      console.log(`${chartType}图表数据:`, response);
      
      // 确保返回数据是合适的格式
      if (chartType === 'courseCategories' || chartType === 'materialTypes') {
        if (Array.isArray(response)) {
          return response;
        } else if (response && Array.isArray(response.data)) {
          return response.data;
        } else if (response && Array.isArray(response.items)) {
          return response.items;
        } else {
          return [];
        }
      }
      
      // 对于 teacherSchedule 和 studentSchedule，确保 events 属性是数组
      if (chartType === 'teacherSchedule' || chartType === 'studentSchedule') {
        if (response && typeof response === 'object') {
          if (Array.isArray(response.events)) {
            return {
              ...response,
              events: response.events
            };
          } 
        }
        return { events: [] };
      }
      
      return response;
    } catch (error) {
      console.error(`获取${chartType}图表数据失败:`, error);
      
      // 开发环境使用模拟数据
      if (import.meta.env.DEV) {
        console.log(`使用模拟${chartType}图表数据`);
        return this.getMockChartData(chartType);
      }
      
      // 如果是需要返回数组的图表类型，确保返回空数组而不是空对象
      if (chartType === 'courseCategories' || chartType === 'materialTypes') {
        return [];
      }
      
      // 对于需要返回带 events 属性对象的图表类型
      if (chartType === 'teacherSchedule' || chartType === 'studentSchedule') {
        return { events: [] };
      }
      
      throw error;
    }
  }

  /**
   * 获取最近活动数据
   * @param activityType 活动类型
   * @param limit 限制数量
   * @returns 活动数据列表
   */
  public async getRecentActivities(activityType: string, limit: number = 5): Promise<any[]> {
    console.log(`获取最近${activityType}活动数据`);
    
    // 在开发环境使用模拟数据
    if (isDevelopment()) {
      console.log(`使用模拟${activityType}活动数据`);
      return await this.getMockActivities(activityType, limit);
    }
    
    try {
      const response = await apiService.get('/dashboard/activities', {
        type: activityType,
        limit: limit
      });
      
      return response || [];
    } catch (error) {
      console.error(`获取${activityType}活动数据失败:`, error);
      
      // 在错误情况下返回模拟数据（开发环境）
      if (isDevelopment()) {
        console.log(`使用备用模拟${activityType}活动数据`);
        return await this.getMockActivities(activityType, limit);
      }
      
      return [];
    }
  }

  /**
   * 获取用户特定统计数据
   * @param userId 用户ID
   * @returns 用户统计数据
   */
  async getUserStatistics(userId: string): Promise<any> {
    try {
      console.log(`获取用户${userId}统计数据`);
      
      // 在开发环境直接返回模拟数据
      if (import.meta.env.DEV) {
        console.log(`使用模拟用户统计数据`);
        return this.getMockUserStatistics(userId);
      }
      
      const url = `/api/dashboard/user-statistics/${userId}`;
      
      // 通过API服务获取数据
      const response = await apiService.get(url);
      console.log(`用户${userId}统计数据:`, response);
      return response;
    } catch (error) {
      console.error(`获取用户${userId}统计数据失败:`, error);
      
      // 开发环境使用模拟数据
      if (import.meta.env.DEV) {
        console.log(`使用模拟用户统计数据`);
        return this.getMockUserStatistics(userId);
      }
      
      throw error;
    }
  }

  /**
   * 获取学习效率分析数据
   * @param userId 用户ID
   * @returns 学习效率分析数据
   */
  async getLearningEfficiencyAnalysis(userId: string): Promise<any> {
    try {
      console.log(`获取用户${userId}学习效率分析数据`);
      
      // 在开发环境直接返回模拟数据
      if (import.meta.env.DEV) {
        console.log(`使用模拟学习效率分析数据`);
        return this.getMockLearningEfficiencyAnalysis(userId);
      }
      
      const url = `/api/dashboard/learning-efficiency/${userId}`;
      
      // 通过API服务获取数据
      const response = await apiService.get(url);
      console.log(`用户${userId}学习效率分析数据:`, response);
      return response;
    } catch (error) {
      console.error(`获取用户${userId}学习效率分析数据失败:`, error);
      
      // 开发环境使用模拟数据
      if (import.meta.env.DEV) {
        console.log(`使用模拟学习效率分析数据`);
        return this.getMockLearningEfficiencyAnalysis(userId);
      }
      
      throw error;
    }
  }

  /**
   * 获取模拟统计数据
   * @param userRole 用户角色
   * @returns 模拟统计数据
   */
  private getMockStatistics(userRole?: string): any {
    if (userRole === 'teacher') {
      return {
        totalCourses: 5,
        totalStudents: 128,
        pendingAssignments: 23,
        completedAssignments: 45,
        upcomingClasses: 3,
        averageRating: 4.7,
        courseCompletionRate: 85
      };
    } else if (userRole === 'student') {
      return {
        enrolledCourses: 4,
        completedCourses: 1,
        inProgressCourses: 3,
        pendingAssignments: 2,
        completedAssignments: 15,
        totalLearningTime: 37.5, // 小时
        averageScore: 88.5
      };
    } else {
      // 管理员仪表盘
      return {
        // 素材相关
        totalMaterials: 256,
        pendingMaterials: 18,
        approvedMaterials: 220,
        rejectedMaterials: 18,
        
        // 用户相关
        totalUsers: 1250,
        totalTeachers: 68,
        totalStudents: 1182,
        activeUsers: 780,
        
        // 课程相关
        totalCourses: 42,
        activeCourses: 36,
        totalLessons: 386,
        
        // 申请相关
        pendingApplications: 24,
        approvedApplications: 156,
        rejectedApplications: 18,
        
        // 系统相关
        totalCategories: 24,
        totalComments: 3680,
        totalViews: 28750
      };
    }
  }

  /**
   * 获取模拟图表数据
   * @param chartType 图表类型
   * @returns 模拟图表数据
   */
  private getMockChartData(chartType: string): any {
    const mockChartData: Record<string, any> = {
      // 用户增长数据
      userGrowth: {
        months: ['1月', '2月', '3月', '4月', '5月', '6月'],
        students: [120, 182, 191, 234, 290, 330],
        teachers: [12, 23, 34, 45, 56, 68]
      },
      
      // 课程分类数据
      courseCategories: [
        { value: 15, name: '编程' },
        { value: 10, name: '设计' },
        { value: 8, name: '语言' },
        { value: 5, name: '数学' },
        { value: 4, name: '科学' }
      ],
      
      // 学习活跃度数据
      activityData: {
        days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        values: [820, 932, 901, 934, 1290, 1330, 1320]
      },
      
      // 素材类型分布
      materialTypes: [
        { value: 120, name: '视频' },
        { value: 80, name: '文档' },
        { value: 40, name: '音频' },
        { value: 16, name: '图片' }
      ],
      
      // 学习时间分布
      learningTimeDistribution: {
        hours: ['0-6', '6-9', '9-12', '12-14', '14-18', '18-21', '21-24'],
        values: [5, 15, 30, 10, 25, 40, 20]
      },
      
      // 成绩分布
      scoreDistribution: {
        ranges: ['60以下', '60-70', '70-80', '80-90', '90-100'],
        values: [5, 15, 38, 42, 20]
      },
      
      // 教师日程
      teacherSchedule: {
        events: [
          { date: '2023-03-15', content: '人工智能导论课程', type: 'success' },
          { date: '2023-03-16', content: '机器学习基础课程', type: 'success' },
          { date: '2023-03-17', content: '深度学习实践课程', type: 'success' },
          { date: '2023-03-18', content: '数据挖掘技术课程', type: 'success' },
          { date: '2023-03-19', content: '计算机视觉课程', type: 'success' }
        ]
      },
      
      // 学生日程
      studentSchedule: {
        events: [
          { date: '2023-03-15', content: '人工智能导论课程', type: 'success' },
          { date: '2023-03-16', content: '机器学习基础课程', type: 'success' },
          { date: '2023-03-17', content: '深度学习实践课程', type: 'success' },
          { date: '2023-03-18', content: '数据挖掘技术课程', type: 'success' }
        ]
      },
      
      // 学生学习进度统计
      studentLearningProgress: {
        weeklyProgress: {
          labels: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '本周'],
          values: [65, 59, 80, 81, 56, 72, 85]
        },
        monthlyCompletion: 78,
        streakDays: 5,
        totalCompletedTasks: 42,
        taskCompletionRate: 85,
        subjectPerformance: [
          { subject: '数据结构', score: 86, improvement: 5 },
          { subject: '机器学习', score: 92, improvement: 8 },
          { subject: '网络安全', score: 72, improvement: -3 },
          { subject: '前端开发', score: 88, improvement: 12 }
        ],
        learningConsistency: 82,
        perfectDays: 12,
        lastWeekComparison: 7
      }
    };
    
    // 尝试进行部分匹配（对于缺少的图表类型）
    if (!mockChartData[chartType]) {
      console.warn(`未找到 ${chartType} 类型的模拟图表数据`);
      
      // 尝试匹配部分图表类型名称
      const partialMatches = Object.keys(mockChartData).filter(key => 
        key.includes(chartType) || chartType.includes(key)
      );
      
      if (partialMatches.length > 0) {
        console.log(`使用最接近的模拟图表类型: ${partialMatches[0]}`);
        return mockChartData[partialMatches[0]];
      }
    }
    
    // 针对特定图表类型，确保返回数组或正确的对象结构
    if (chartType === 'courseCategories' || chartType === 'materialTypes') {
      return mockChartData[chartType] || [];
    }
    
    if (chartType === 'teacherSchedule' || chartType === 'studentSchedule') {
      return mockChartData[chartType] || { events: [] };
    }
    
    return mockChartData[chartType] || {};
  }

  /**
   * 获取模拟活动数据
   */
  private async getMockActivities(activityType: string, limit: number): Promise<any[]> {
    console.log(`获取模拟活动数据: ${activityType}, 限制: ${limit}`);

    // 处理学习资源相关的活动类型
    if (activityType.includes('resource') || activityType.includes('learning') || activityType.includes('material')) {
      console.log(`活动类型${activityType}可能与学习资源相关，尝试从学习中心获取数据`);
      try {
        return await this.getMockLearningCenterData('recommendedResources', limit);
      } catch (error) {
        console.warn(`获取学习资源失败，使用默认数据:`, error);
      }
    }

    // 处理学习计划相关的活动类型
    if (activityType.includes('plan') || activityType.includes('schedule') || activityType.includes('curriculum')) {
      console.log(`活动类型${activityType}可能与学习计划相关，尝试从学习中心获取数据`);
      try {
        return await this.getMockLearningCenterData('learningPlans', limit);
      } catch (error) {
        console.warn(`获取学习计划失败，使用默认数据:`, error);
      }
    }

    // 处理学习路径相关的活动类型
    if (activityType.includes('path') || activityType.includes('roadmap') || activityType.includes('journey')) {
      console.log(`活动类型${activityType}可能与学习路径相关，尝试从学习中心获取数据`);
      try {
        return await this.getMockLearningCenterData('learningPaths', limit);
      } catch (error) {
        console.warn(`获取学习路径失败，使用默认数据:`, error);
      }
    }

    // 处理学习笔记相关的活动类型
    if (activityType.includes('note') || activityType.includes('memo') || activityType.includes('document')) {
      console.log(`活动类型${activityType}可能与学习笔记相关，尝试从学习中心获取数据`);
      try {
        return await this.getMockLearningCenterData('studyNotes', limit);
      } catch (error) {
        console.warn(`获取学习笔记失败，使用默认数据:`, error);
      }
    }

    // 原有的活动类型处理逻辑保持不变
    // ... existing code ...
  }

  /**
   * 获取模拟用户统计数据
   * @param userId 用户ID
   * @returns 模拟用户统计数据
   */
  private getMockUserStatistics(userId: string): any {
    // 这里可以根据用户ID返回不同的模拟数据
    // 为简化，这里返回通用的模拟数据
    return {
      totalLogins: 86,
      lastLogin: '2023-03-12 09:15:42',
      averageTimeSpent: 45, // 分钟/天
      totalActivities: 256,
      learningProgress: {
        completed: 12,
        inProgress: 3,
        notStarted: 2
      },
      performanceScore: 85,
      recentActivities: [
        { type: 'login', time: '2023-03-12 09:15:42', details: '登录系统' },
        { type: 'course', time: '2023-03-12 10:30:15', details: '观看课程: 人工智能导论' },
        { type: 'assignment', time: '2023-03-11 16:42:58', details: '提交作业: 机器学习基础 - 实验报告' },
        { type: 'material', time: '2023-03-11 14:20:33', details: '下载资料: 深度学习实践指南' },
        { type: 'quiz', time: '2023-03-10 11:05:27', details: '完成测验: 数据挖掘技术 - 第3章测验' }
      ]
    };
  }

  /**
   * 获取模拟学习效率分析数据
   * @param userId 用户ID
   * @returns 模拟学习效率分析数据
   */
  private getMockLearningEfficiencyAnalysis(userId: string): any {
    return {
      bestTimeOfDay: '晚上 8:00 - 10:00',
      optimalSessionLength: 45,
      productiveStreak: 5,
      focusScore: 78,
      recommendations: [
        '建议在学习期间关闭社交媒体通知',
        '每45分钟休息5分钟可提高专注力',
        '晚上8点至10点是你的学习效率高峰期',
        '增加数学科目的学习时间有助于提高整体成绩'
      ],
      distractions: [
        { type: '社交媒体', count: 12 },
        { type: '消息通知', count: 8 },
        { type: '其他应用', count: 5 }
      ],
      learningPatterns: {
        weekdayDistribution: [15, 22, 18, 25, 20, 8, 5], // 周一到周日的学习时长(%)
        timeOfDayDistribution: [2, 5, 8, 10, 12, 25, 38] // 早晨到深夜的学习时长(%)
      },
      improvementAreas: [
        { subject: '数学', currentScore: 75, potentialScore: 85 },
        { subject: '英语', currentScore: 80, potentialScore: 88 },
        { subject: '物理', currentScore: 65, potentialScore: 80 }
      ],
      recentProgress: {
        focusScores: [65, 70, 72, 75, 78], // 最近5次学习的专注力评分
        completionRates: [80, 85, 90, 85, 95] // 最近5次任务的完成率(%)
      }
    };
  }

  /**
   * 获取学习中心特定类型的数据
   * @param dataType 数据类型
   * @param limit 限制返回数量
   * @returns 模拟学习中心数据
   */
  private async getMockLearningCenterData(dataType: string, limit?: number): Promise<any[]> {
    console.log(`获取学习中心${dataType}数据`);
    try {
      // 使用mockUtils获取数据
      const mockData = await getMockData('learningCenterMock', dataType);
      
      if (mockData && Array.isArray(mockData)) {
        console.log(`成功获取到${dataType}数据，共${mockData.length}条`);
        return limit ? mockData.slice(0, limit) : mockData;
      } else {
        console.warn(`未找到${dataType}数据，返回默认值`);
      }
    } catch (error) {
      console.error(`获取${dataType}数据失败:`, error);
    }
    
    // 返回默认数据
    console.log(`返回 ${dataType} 的默认数据`);
    
    switch (dataType) {
      case 'recommendedResources':
        return [{
          id: 'default-res-1',
          title: '默认推荐资源',
          description: '当无法加载推荐资源时显示的默认资源',
          type: 'article',
          category: '通用',
          difficulty: 'beginner',
          duration: 30,
          author: '系统',
          thumbnail: '',
          url: '#',
          tags: ['默认'],
          rating: 4.0,
          popularity: 100,
          relevanceScore: 80
        }];
        
      case 'learningPlans':
        return [{
          id: 'default-plan-1',
          title: '默认学习计划',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          goal: '完成基础学习任务',
          progress: 0,
          completed: false,
          tasks: [
            {
              id: 'default-task-1',
              title: '查看学习中心功能',
              date: new Date().toISOString().split('T')[0],
              completed: false,
              importance: 'medium'
            }
          ]
        }];
        
      case 'learningPaths':
        return [{
          id: 'default-path-1',
          title: '默认学习路径',
          description: '当无法加载学习路径时显示的默认路径',
          progress: 0,
          stages: [
            {
              id: 'default-stage-1',
              title: '入门阶段',
              description: '学习基础知识',
              completed: false,
              locked: false,
              resources: [
                {
                  id: 'default-res-1',
                  title: '基础概念',
                  type: 'article',
                  completed: false
                }
              ]
            }
          ]
        }];
        
      case 'studyNotes':
        return [{
          id: 'default-note-1',
          title: '默认学习笔记',
          content: '这是一个默认的学习笔记，当无法加载真实数据时显示。',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['默认']
        }];
        
      default:
        return [{
          id: 'default-1',
          title: '默认数据',
          description: `未知类型 "${dataType}" 的默认数据`
        }];
    }
  }
  
  /**
   * 获取学习中心活动数据
   * @param activityType 活动类型
   * @param limit 限制返回数量
   * @returns 学习中心活动数据
   */
  public async getLearningCenterActivities(activityType: string, limit: number = 10): Promise<any[]> {
    console.log(`获取学习中心活动: ${activityType}, 限制: ${limit}`);
    
    // 在开发环境中返回模拟数据
    if (isDevelopment()) {
      return await this.getMockLearningCenterData(activityType, limit);
    }
    
    // 在生产环境中从API获取数据
    try {
      const response = await apiService.get(`/learning-center/${activityType}?limit=${limit}`);
      if (response && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error(`获取学习中心活动数据失败: ${activityType}`, error);
      // 发生错误时返回模拟数据
      return await this.getMockLearningCenterData(activityType, limit);
    }
    
    return [];
  }

  /**
   * 获取学生成就数据
   * @param userId 用户ID
   * @returns 学生成就数据数组
   */
  async getStudentAchievements(userId?: string): Promise<any[]> {
    try {
      // 开发环境使用模拟数据
      if (isDevelopment()) {
        console.log(`[DEV] 获取学生成就数据: userId=${userId}`);
        const mockData = await this.getMockAchievements();
        return mockData;
      }

      // 生产环境使用API
      const response = await apiService.get(`/achievements?userId=${userId || ''}`);
      return response || [];
    } catch (error) {
      console.error('获取学生成就数据失败:', error);
      // 出错时返回模拟数据以确保UI不会崩溃
      return this.getMockAchievements();
    }
  }

  /**
   * 获取学习挑战赛数据
   * @returns 学习挑战赛数据数组
   */
  async getCompetitions(): Promise<any[]> {
    try {
      // 开发环境使用模拟数据
      if (isDevelopment()) {
        console.log('[DEV] 获取学习挑战赛数据');
        const mockData = await this.getMockCompetitions();
        return mockData;
      }

      // 生产环境使用API
      const response = await apiService.get('/competitions');
      return response || [];
    } catch (error) {
      console.error('获取学习挑战赛数据失败:', error);
      // 出错时返回模拟数据以确保UI不会崩溃
      return this.getMockCompetitions();
    }
  }

  /**
   * 获取每日挑战数据
   * @returns 每日挑战数据数组
   */
  async getDailyChallenges(): Promise<any[]> {
    try {
      // 开发环境使用模拟数据
      if (isDevelopment()) {
        console.log('[DEV] 获取每日挑战数据');
        const mockData = await this.getMockDailyChallenges();
        return mockData;
      }

      // 生产环境使用API
      const response = await apiService.get('/daily-challenges');
      return response || [];
    } catch (error) {
      console.error('获取每日挑战数据失败:', error);
      // 出错时返回模拟数据以确保UI不会崩溃
      return this.getMockDailyChallenges();
    }
  }

  /**
   * 获取学生积分系统数据
   * @param userId 用户ID
   * @returns 积分系统数据
   */
  async getPointsSystem(userId: string): Promise<any> {
    try {
      // 开发环境使用模拟数据
      if (isDevelopment()) {
        console.log(`[DEV] 获取积分系统数据: userId=${userId}`);
        const mockData = await this.getMockPointsSystem(userId);
        return mockData;
      }

      // 生产环境使用API
      const response = await apiService.get(`/points-system?userId=${userId}`);
      return response || null;
    } catch (error) {
      console.error('获取积分系统数据失败:', error);
      // 出错时返回模拟数据以确保UI不会崩溃
      return this.getMockPointsSystem(userId);
    }
  }

  /**
   * 获取积分交易历史
   * @param userId 用户ID
   * @returns 积分交易历史数据数组
   */
  async getPointsTransactions(userId: string): Promise<any[]> {
    try {
      // 开发环境使用模拟数据
      if (isDevelopment()) {
        console.log(`[DEV] 获取积分交易历史: userId=${userId}`);
        const mockData = await this.getMockPointsTransactions(userId);
        return mockData;
      }

      // 生产环境使用API
      const response = await apiService.get(`/points-transactions?userId=${userId}`);
      return response || [];
    } catch (error) {
      console.error('获取积分交易历史失败:', error);
      // 出错时返回模拟数据以确保UI不会崩溃
      return this.getMockPointsTransactions(userId);
    }
  }

  /**
   * 获取模拟学生成就数据
   * @returns 模拟学生成就数据数组
   */
  private async getMockAchievements(): Promise<any[]> {
    // 模拟成就数据
    return [
      {
        id: '1',
        title: '学习初体验',
        description: '完成第一次课程学习',
        icon: 'BookOutlined',
        progress: 100,
        date: '2023-05-15',
        type: 'course',
        unlocked: true,
        points: 50,
        rarity: 'common'
      },
      {
        id: '2',
        title: '勤奋学习者',
        description: '连续7天登录学习',
        icon: 'FireOutlined',
        progress: 100,
        date: '2023-05-22',
        type: 'daily',
        unlocked: true,
        points: 100,
        rarity: 'uncommon'
      },
      {
        id: '3',
        title: '知识探索者',
        description: '浏览50个学习资源',
        icon: 'CompassOutlined',
        progress: 84,
        type: 'activity',
        unlocked: false,
        points: 150,
        rarity: 'rare',
        unlockedBy: '浏览50个学习资源（进度：42/50）'
      },
      {
        id: '4',
        title: '编程大师',
        description: '完成10个编程练习并获得满分',
        icon: 'CodeOutlined',
        progress: 70,
        type: 'skill',
        unlocked: false,
        points: 200,
        rarity: 'epic',
        unlockedBy: '完成10个编程练习并获得满分（进度：7/10）'
      },
      {
        id: '5',
        title: '完美主义者',
        description: '在一门课程的所有测验中获得满分',
        icon: 'TrophyOutlined',
        progress: 100,
        date: '2023-06-10',
        type: 'course',
        unlocked: true,
        points: 250,
        rarity: 'epic'
      },
      {
        id: '6',
        title: '社区贡献者',
        description: '回答10个其他学生的问题',
        icon: 'TeamOutlined',
        progress: 40,
        type: 'special',
        unlocked: false,
        points: 300,
        rarity: 'rare',
        unlockedBy: '回答10个其他学生的问题（进度：4/10）'
      },
      {
        id: '7',
        title: '学习冠军',
        description: '在学习挑战中获得第一名',
        icon: 'CrownOutlined',
        progress: 0,
        type: 'special',
        unlocked: false,
        points: 500,
        rarity: 'legendary',
        unlockedBy: '在任意学习挑战中获得第一名'
      },
      {
        id: '8',
        title: '全能学者',
        description: '完成所有学科的基础课程',
        icon: 'StarOutlined',
        progress: 100,
        date: '2023-07-05',
        type: 'course',
        unlocked: true,
        points: 400,
        rarity: 'epic'
      }
    ];
  }

  /**
   * 获取模拟学习挑战赛数据
   * @returns 模拟学习挑战赛数据数组
   */
  private async getMockCompetitions(): Promise<any[]> {
    // 获取当前日期
    const now = new Date();
    
    // 生成未来日期
    const futureDate = (days: number) => {
      const date = new Date(now);
      date.setDate(date.getDate() + days);
      return date.toISOString();
    };
    
    // 生成过去日期
    const pastDate = (days: number) => {
      const date = new Date(now);
      date.setDate(date.getDate() - days);
      return date.toISOString();
    };
    
    // 模拟学习挑战赛数据
    return [
      {
        id: '1',
        title: '编程马拉松',
        description: '72小时内完成一个完整的Web应用，展示你的编程能力',
        startDate: pastDate(5),
        endDate: futureDate(2),
        participants: 128,
        ranking: 12,
        prize: '500积分 + 特殊徽章',
        category: '编程',
        status: 'active',
        progress: 65,
        organizer: '计算机科学学院',
        levels: ['初级', '中级', '高级'],
        badges: [
          { name: '编程新星', image: '/assets/badges/coding-star.png' },
          { name: '代码大师', image: '/assets/badges/code-master.png' }
        ],
        leaderboard: [
          { userId: 'u1', name: '张三', score: 950, rank: 1 },
          { userId: 'u2', name: '李四', score: 920, rank: 2 },
          { userId: 'u3', name: '王五', score: 880, rank: 3 },
          { userId: 'u4', name: '赵六', score: 860, rank: 4 },
          { userId: 'u5', name: '陈七', score: 840, rank: 5 }
        ],
        tasks: [
          { id: 't1', title: '完成项目规划', completed: true, points: 50 },
          { id: 't2', title: '实现前端界面', completed: true, points: 100 },
          { id: 't3', title: '实现后端API', completed: true, points: 150 },
          { id: 't4', title: '完成数据库设计', completed: false, points: 100 },
          { id: 't5', title: '部署应用', completed: false, points: 100 }
        ]
      },
      {
        id: '2',
        title: '数学建模挑战',
        description: '建立数学模型解决实际问题，训练应用数学能力',
        startDate: futureDate(3),
        endDate: futureDate(10),
        participants: 86,
        prize: '400积分 + 学习证书',
        category: '数学',
        status: 'upcoming'
      },
      {
        id: '3',
        title: '英语演讲比赛',
        description: '围绕当代话题进行英语演讲，提升语言表达能力',
        startDate: pastDate(15),
        endDate: pastDate(8),
        participants: 64,
        ranking: 5,
        prize: '300积分 + 演讲证书',
        category: '语言',
        status: 'completed'
      },
      {
        id: '4',
        title: '创新创业计划',
        description: '提出创新创业方案，商业计划书编写与路演',
        startDate: pastDate(3),
        endDate: futureDate(4),
        participants: 45,
        ranking: 8,
        prize: '450积分 + 创业指导',
        category: '设计',
        status: 'active',
        progress: 40
      },
      {
        id: '5',
        title: '物理实验设计',
        description: '设计并实施一个创新物理实验，解释自然现象',
        startDate: futureDate(5),
        endDate: futureDate(15),
        participants: 32,
        prize: '350积分 + 实验器材',
        category: '科学',
        status: 'upcoming'
      },
      {
        id: '6',
        title: '数据分析大赛',
        description: '使用给定数据集完成分析任务，提出有价值的见解',
        startDate: pastDate(20),
        endDate: pastDate(5),
        participants: 98,
        ranking: 22,
        prize: '400积分 + 专业软件证书',
        category: '编程',
        status: 'completed'
      }
    ];
  }

  /**
   * 获取模拟每日挑战数据
   * @returns 模拟每日挑战数据数组
   */
  private async getMockDailyChallenges(): Promise<any[]> {
    // 生成过期时间 (24小时后)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // 模拟每日挑战数据
    return [
      {
        id: '1',
        title: '完成一节编程课程',
        description: '观看并完成至少一节编程相关的课程视频',
        type: 'study',
        difficulty: 'easy',
        pointsReward: 50,
        progress: 100,
        completed: true,
        expiresAt: expiresAt.toISOString()
      },
      {
        id: '2',
        title: '回答5个论坛问题',
        description: '在学习论坛中回答至少5个其他学生的问题',
        type: 'social',
        difficulty: 'medium',
        pointsReward: 80,
        progress: 60,
        completed: false,
        expiresAt: expiresAt.toISOString()
      },
      {
        id: '3',
        title: '完成一次编程测验',
        description: '完成一次编程相关的在线测验，得分至少80分',
        type: 'quiz',
        difficulty: 'medium',
        pointsReward: 100,
        progress: 0,
        completed: false,
        expiresAt: expiresAt.toISOString()
      },
      {
        id: '4',
        title: '阅读学术论文',
        description: '阅读并总结一篇与专业相关的学术论文',
        type: 'reading',
        difficulty: 'hard',
        pointsReward: 150,
        progress: 30,
        completed: false,
        expiresAt: expiresAt.toISOString()
      },
      {
        id: '5',
        title: '完成编程练习',
        description: '完成一个算法编程练习，通过所有测试用例',
        type: 'practice',
        difficulty: 'hard',
        pointsReward: 120,
        progress: 100,
        completed: true,
        expiresAt: expiresAt.toISOString()
      }
    ];
  }

  /**
   * 获取模拟积分系统数据
   * @param userId 用户ID
   * @returns 模拟积分系统数据
   */
  private async getMockPointsSystem(userId: string): Promise<any> {
    // 生成积分历史
    const generatePointsHistory = () => {
      const history = [];
      const now = new Date();
      
      // 生成过去30天的积分记录
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // 获得积分的记录（每天1-3条）
        const earnedCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < earnedCount; j++) {
          history.push({
            id: `e${i}-${j}`,
            date: date.toISOString(),
            points: Math.floor(Math.random() * 50) + 10,
            source: ['完成课程', '提交作业', '参与讨论', '完成测验', '每日登录'][Math.floor(Math.random() * 5)],
            details: `完成了[${'ABCDE'[Math.floor(Math.random() * 5)]}]活动`,
            type: 'earned'
          });
        }
        
        // 消耗积分的记录（每天0-1条）
        if (Math.random() > 0.7) {
          history.push({
            id: `s${i}`,
            date: date.toISOString(),
            points: Math.floor(Math.random() * 30) + 5,
            source: ['兑换物品', '购买课程', '解锁资源'][Math.floor(Math.random() * 3)],
            details: `兑换了[${'XYZ'[Math.floor(Math.random() * 3)]}]物品`,
            type: 'spent'
          });
        }
      }
      
      return history;
    };
    
    // 生成等级历史
    const generateLevelHistory = () => {
      const history = [];
      const now = new Date();
      
      // 当前等级
      history.push({
        level: 5,
        achievedDate: new Date(now).toISOString(),
        pointsRequired: 1000
      });
      
      // 之前的等级
      for (let i = 4; i >= 1; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - (5 - i));
        
        history.push({
          level: i,
          achievedDate: date.toISOString(),
          pointsRequired: i * 200
        });
      }
      
      return history;
    };
    
    // 生成等级特权
    const generateLevelBenefits = () => {
      return [
        {
          level: 1,
          benefits: [
            '可以访问基础学习资源',
            '可以参与课程讨论',
            '可以提交基础作业'
          ]
        },
        {
          level: 3,
          benefits: [
            '可以访问进阶学习资源',
            '可以参与每周学习挑战',
            '可以查看详细学习统计',
            '可以使用高级学习工具'
          ]
        },
        {
          level: 5,
          benefits: [
            '可以访问所有学习资源',
            '可以参与所有学习挑战',
            '可以申请学习证书',
            '可以获得学习指导服务',
            '可以参与线下学习活动'
          ]
        },
        {
          level: 8,
          benefits: [
            '可以获得限定主题个性化',
            '可以申请成为学习小组组长',
            '可以参与特殊教育活动',
            '可以获得学习荣誉证书',
            '可以成为学科助教'
          ]
        },
        {
          level: 10,
          benefits: [
            '可以定制个人学习路径',
            '可以获得实名认证证书',
            '可以获得1对1专家指导',
            '可以参与高端教育峰会',
            '可以获得推荐工作实习机会'
          ]
        }
      ];
    };
    
    // 计算今日和本周获得的积分
    const pointsHistory = generatePointsHistory();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    
    const pointsToday = pointsHistory
      .filter(h => h.type === 'earned' && h.date.startsWith(today))
      .reduce((sum, h) => sum + h.points, 0);
      
    const pointsThisWeek = pointsHistory
      .filter(h => h.type === 'earned' && new Date(h.date) >= weekStart)
      .reduce((sum, h) => sum + h.points, 0);
    
    // 计算总获得积分和当前积分
    const totalPointsEarned = pointsHistory
      .filter(h => h.type === 'earned')
      .reduce((sum, h) => sum + h.points, 0);
      
    const totalPointsSpent = pointsHistory
      .filter(h => h.type === 'spent')
      .reduce((sum, h) => sum + h.points, 0);
      
    const currentPoints = totalPointsEarned - totalPointsSpent;
    
    // 返回模拟积分系统数据
    return {
      currentPoints,
      totalPointsEarned,
      level: 5,
      nextLevelPoints: 1500,
      rank: Math.floor(Math.random() * 100) + 1,
      totalUsers: 1000,
      pointsToday,
      pointsThisWeek,
      pointsHistory,
      levelHistory: generateLevelHistory(),
      levelBenefits: generateLevelBenefits()
    };
  }

  /**
   * 获取模拟积分交易历史
   * @param userId 用户ID
   * @returns 模拟积分交易历史数据数组
   */
  private async getMockPointsTransactions(userId: string): Promise<any[]> {
    // 生成过去日期
    const pastDate = (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date.toISOString();
    };
    
    // 生成随机交易
    const generateTransactions = () => {
      const transactions = [];
      const categories = ['course', 'assignment', 'quiz', 'challenge', 'achievement', 'activity', 'reward', 'purchase'];
      
      // 生成收入交易
      for (let i = 0; i < 30; i++) {
        const category = categories[Math.floor(Math.random() * (categories.length - 1))]; // 排除 purchase
        let source = '';
        let details = '';
        
        switch (category) {
          case 'course':
            source = '完成课程';
            details = `完成[${['编程基础', '数据结构', '算法设计', '人工智能入门', '网络安全'][Math.floor(Math.random() * 5)]}]课程`;
            break;
          case 'assignment':
            source = '提交作业';
            details = `完成[${['第一周', '第二周', '第三周', '期中', '期末'][Math.floor(Math.random() * 5)]}]作业`;
            break;
          case 'quiz':
            source = '完成测验';
            details = `完成[${['单元测验', '章节测验', '课程测验', '期中测验', '期末测验'][Math.floor(Math.random() * 5)]}]`;
            break;
          case 'challenge':
            source = '挑战任务';
            details = `完成[${['每日挑战', '每周挑战', '特殊挑战', '团队挑战', '学院挑战'][Math.floor(Math.random() * 5)]}]`;
            break;
          case 'achievement':
            source = '解锁成就';
            details = `解锁[${['初学者', '进阶者', '专家级', '大师级', '传奇级'][Math.floor(Math.random() * 5)]}]成就`;
            break;
          case 'activity':
            source = '参与活动';
            details = `参与[${['讨论区', '直播课', '学习小组', '问答环节', '头脑风暴'][Math.floor(Math.random() * 5)]}]活动`;
            break;
          case 'reward':
            source = '系统奖励';
            details = `获得[${['登录奖励', '连续学习', '帮助他人', '反馈贡献', '推荐奖励'][Math.floor(Math.random() * 5)]}]`;
            break;
        }
        
        transactions.push({
          id: `earn-${i}`,
          date: pastDate(Math.floor(Math.random() * 30)),
          points: Math.floor(Math.random() * 100) + 10,
          source,
          details,
          type: 'earned',
          category
        });
      }
      
      // 生成支出交易
      for (let i = 0; i < 10; i++) {
        const category = 'purchase';
        const source = '积分兑换';
        const details = `兑换[${['学习资料', '虚拟物品', '学习工具', '个性化主题', '特殊权限'][Math.floor(Math.random() * 5)]}]`;
        
        transactions.push({
          id: `spend-${i}`,
          date: pastDate(Math.floor(Math.random() * 30)),
          points: Math.floor(Math.random() * 50) + 20,
          source,
          details,
          type: 'spent',
          category
        });
      }
      
      // 按日期排序
      return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };
    
    return generateTransactions();
  }
}

// 导出服务实例
const dashboardService = new DashboardService();
export default dashboardService; 