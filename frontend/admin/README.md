# 在线学习系统管理端

这是在线学习系统的管理前端部分，基于React、TypeScript和Ant Design开发。

## 功能模块

系统包含以下主要功能模块：

- 仪表盘：系统概览和统计数据
- 课程管理：课程的创建、编辑、发布和统计
- 资料管理：学习资料上传、分类和管理
- 考试管理：考试创建、试题编辑、考试评分和分析
- 知识图谱：知识点的关联管理、学习路径生成和分析
- 通知系统：系统消息、教师通知和个人消息管理
- 教师分组：教研组管理、教学活动安排和讨论
- 学生评价：学生成绩、表现和综合评价管理

## 技术架构

### 前端框架与库

- React：用于构建用户界面的JavaScript库
- TypeScript：JavaScript的超集，提供类型系统
- Ant Design：UI组件库
- React Router：页面路由管理
- D3.js：数据可视化库，用于知识图谱展示
- Chart.js/Recharts：图表可视化
- Axios：HTTP客户端，用于API请求

### 数据流管理

- React Context：全局状态管理
- 自定义Hooks：封装业务逻辑

### API通信

系统使用模块化的API服务与后端通信：

- apiService：基础API请求服务
- 各模块服务：如notificationService、examService等，用于特定业务模块

## 测试工具

### API测试工具

系统内置了一个API测试工具，可以用于测试系统中各种API服务的连接状态和数据格式。

访问路径：`/api-test-page`（需要管理员权限）

功能特点：
- 分类显示所有可用API
- 支持设置请求参数
- 实时显示请求响应和错误信息
- 记录测试历史，方便对比和调试

使用方法：
1. 选择API分组（通知、考试、知识图谱等）
2. 选择具体的API方法
3. 设置必要的参数
4. 点击"发送请求"按钮执行测试
5. 查看响应结果

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

### 构建生产版本

```bash
npm run build
```

### API服务开发

添加新的API服务：

1. 在`src/services`目录下创建新的服务文件，如`newFeatureService.ts`
2. 实现必要的API方法和数据处理逻辑
3. 在需要使用该服务的组件中导入并使用

```typescript
// 服务实现示例
import apiService from './apiService';

class NewFeatureService {
  async getData(params) {
    try {
      const response = await apiService.get('/new-feature', params);
      return response.data;
    } catch (error) {
      console.error('获取数据失败:', error);
      // 错误处理和回退逻辑
      return [];
    }
  }
}

export default new NewFeatureService();
```

## 未来改进计划

- 优化API错误处理和重试机制
- 完善知识图谱文档导入功能
- 增强教师分组协作功能
- 扩展视频学习资源的测试点功能 