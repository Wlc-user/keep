/**
 * 登录检查
 * @param username 用户名
 * @param password 密码
 * @returns 登录结果
 */
export const checkLogin = (username: string, password: string) => {
  console.log('模拟登录检查: 用户=' + username + ', 密码=' + password);
  
  // 模拟管理员账号
  if (username === 'admin' && password === 'Admin123!') {
    return {
      success: true,
      token: 'mock-token-admin-' + Date.now(),
      refreshToken: 'mock-refresh-token-admin-' + Date.now(),
      user: {
        id: 'admin-001',
        username: 'admin',
        name: '管理员',
        email: 'admin@example.com',
        role: 'admin',
        department: '系统管理部',
        createdAt: '2023-01-01T00:00:00Z',
        lastLogin: new Date().toISOString()
      }
    };
  }
  
  // 模拟教师账号
  if (username === 'teacher' && password === 'Teacher123!') {
    return {
      success: true,
      token: 'mock-token-teacher-' + Date.now(),
      refreshToken: 'mock-refresh-token-teacher-' + Date.now(),
      user: {
        id: 'teacher-001',
        username: 'teacher',
        name: '张教师',
        email: 'teacher@example.com',
        role: 'teacher',
        department: '教学部',
        title: '高级讲师',
        teacherGroups: [
          {
            id: 'group-001',
            name: '计算机系教研组',
            type: 'research',
            description: '负责计算机课程教学研究'
          }
        ],
        isGroupLeader: false,
        createdAt: '2023-01-02T00:00:00Z',
        lastLogin: new Date().toISOString()
      }
    };
  }
  
  // 模拟学生账号
  if (username === 'student' && password === 'Student123!') {
    return {
      success: true,
      token: 'mock-token-student-' + Date.now(),
      refreshToken: 'mock-refresh-token-student-' + Date.now(),
      user: {
        id: 'student-001',
        username: 'student',
        name: '李同学',
        email: 'student@example.com',
        role: 'student',
        studentId: '2023001',
        classId: 'class-001',
        className: '计算机科学2301班',
        grade: '大一',
        enrollmentYear: 2023,
        major: '计算机科学与技术',
        createdAt: '2023-09-01T00:00:00Z',
        lastLogin: new Date().toISOString()
      }
    };
  }
  
  // 登录失败
  return {
    success: false,
    message: '用户名或密码错误'
  };
}; 