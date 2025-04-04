# 前后端集成方案

本文档提供了在线学习系统前后端集成方案，详细说明如何将前端应用与后端API服务集成。

## 1. 系统架构

### 1.1 前端架构
- **框架**：React + TypeScript
- **UI库**：Ant Design
- **状态管理**：React Hooks
- **路由**：React Router
- **HTTP客户端**：Axios
- **图表库**：@ant-design/plots

### 1.2 后端架构
- **API基础路径**：`http://localhost:5000/api`（开发环境）或`/api`（生产环境）
- **认证方式**：JWT令牌（Bearer Authentication）
- **数据格式**：JSON

## 2. 集成配置

### 2.1 环境配置
配置文件位于`src/config/env.ts`：

```typescript
interface EnvConfig {
  API_BASE_URL: string;      // API基础URL
  API_TIMEOUT: number;       // 请求超时时间(毫秒)
  USE_MOCK_DATA: boolean;    // 是否使用模拟数据
  USE_MSW: boolean;          // 是否使用MSW进行API模拟
}

// 根据环境选择不同配置
const env = process.env.NODE_ENV || 'development';
```

### 2.2 API服务配置
API服务封装在`src/services/api.ts`中：

```typescript
const apiService = new ApiService({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 使用示例
apiService.get('/users');
apiService.post('/auth/login', { username, password });
```

## 3. 认证与授权

### 3.1 登录流程
1. 用户输入用户名和密码
2. 前端调用`apiService.auth.login(username, password)`
3. 后端验证凭据并返回JWT令牌
4. 前端存储令牌到`localStorage`
5. 后续请求自动携带令牌

### 3.2 令牌管理
- 令牌存储在`localStorage`中的`token`键
- 请求拦截器自动添加令牌到请求头：
  ```
  Authorization: Bearer {token}
  ```
- 响应拦截器检测令牌失效（401错误），自动重定向到登录页

## 4. 数据服务集成

### 4.1 服务模块
系统按功能模块组织API服务：

- **认证服务**：`apiService.auth.xxx`
- **用户服务**：`apiService.users.xxx`
- **课程服务**：`apiService.courses.xxx`
- **素材服务**：`apiService.materials.xxx`
- **评价服务**：`apiService.evaluations.xxx`
- **通知服务**：`apiService.notifications.xxx`
- **系统服务**：`apiService.system.xxx`
- **知识图谱服务**：`apiService.knowledgeGraphs.xxx`

### 4.2 评价系统API规范

#### 学生评价
- **获取学生评价**：`GET /evaluations/students/{studentId}`
  ```typescript
  apiService.evaluations.getStudentEvaluation(studentId, { 
    academicYear, semester, courseId 
  });
  ```

- **保存学生评价**：`POST /evaluations/students`
  ```typescript
  apiService.evaluations.saveStudentEvaluation(evaluationData);
  ```

- **获取评价历史**：`GET /evaluations/students/{studentId}/history`
  ```typescript
  apiService.evaluations.getEvaluationHistory(studentId, { limit: 5 });
  ```

- **导出评价报告**：`GET /evaluations/students/{studentId}/export`
  ```typescript
  apiService.evaluations.exportEvaluation(studentId, 'pdf');
  ```

#### 班级评价
- **获取班级评价**：`GET /evaluations/classes/{classId}`
  ```typescript
  apiService.evaluations.getClassEvaluation(classId, { 
    academicYear, semester 
  });
  ```

## 5. 数据模型

### 5.1 学生评价模型
```typescript
interface StudentEvaluation {
  studentId: string;
  studentName: string;
  academicYear: string;
  semester: string;
  courseId?: string;
  courseName?: string;
  evaluations: EvaluationData[];
  overallComment?: string;
  evaluatedBy?: string;
  evaluatedAt?: string;
}

interface EvaluationData {
  dimension: EvaluationDimension;
  score: number;
  level: EvaluationLevel;
  comment?: string;
}
```

### 5.2 评价历史模型
```typescript
interface EvaluationHistory {
  id: string;
  date: string;
  academicYear: string;
  semester: string;
  evaluation: StudentEvaluation;
  evaluator: string;
  courseId?: string;
  courseName?: string;
}
```

## 6. 错误处理与降级策略

### 6.1 错误处理
- API服务自动处理常见HTTP错误码
- 401错误自动重定向到登录页
- 错误信息通过Ant Design消息组件显示

### 6.2 降级策略
- 开发环境中API请求失败会降级使用模拟数据
- 配置`USE_MOCK_DATA: true`可强制使用模拟数据
- 模拟数据在相应服务文件中实现，如`evaluationService.ts`

## 7. 部署配置

### 7.1 开发环境
- API基础路径：`http://localhost:5000/api`
- 模拟数据：启用
- 跨域处理：启用CORS

### 7.2 生产环境
- API基础路径：`/api`（相对路径，前后端同一域名）
- 模拟数据：禁用
- 构建命令：`npm run build`

## 8. 测试与调试

### 8.1 API测试
- 使用ApiTest页面(`/admin/api-test`)测试API连接性
- 测试脚本位于`src/utils/apiConnectionTest.ts`
- 开发工具：浏览器开发者工具 Network 面板

### 8.2 Mock数据切换
- 编辑`src/config/env.ts`中的`USE_MOCK_DATA`值
- 临时切换：浏览器控制台执行`localStorage.setItem('useMockData', 'true')`

## 9. 常见问题解决

### 9.1 CORS 问题
确保后端正确配置CORS头：
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 9.2 认证问题
- 检查令牌格式和有效性
- 确保请求头正确设置：`Authorization: Bearer {token}`
- 排查令牌过期问题

### 9.3 数据格式不匹配
- 检查API响应结构是否与前端模型一致
- 在服务中添加数据转换逻辑
- 考虑使用适配器模式处理不同格式 