# 在线学习系统 (Online Learning System)

这是一个基于前后端分离架构的在线学习系统，为学生、教师和管理员提供完整的在线教育解决方案。

## 项目结构

项目分为前端和后端两部分：

- `frontend/` - 基于React和Ant Design的前端界面
  - `admin/` - 管理界面，包含所有用户角色的功能
  
- `backend/` - .NET Core后端API服务

## 功能特点

系统根据不同用户角色提供不同的功能模块：

### 管理员功能

- **教育资源库**: 资源管理、上传、分类和搜索
- **学习分析中心**: 学生表现、课程分析、学习行为和考试分析
- **交互式学习**: 知识图谱、模拟实验室、虚拟课堂和互动测验
- **教研社区**: 教研组、学术资源、教学方法和同行评审

### 教师功能

- **教学资源**: 资源搜索、上传和管理
- **学生分析**: 班级评估、学生表现和考试分析
- **交互式教学**: 知识图谱、考试创建和在线教室
- **教研活动**: 教研小组、教学方法和学术交流

### 学生功能

- **学习资源**: 资源搜索、推荐和收藏
- **学习进度**: 进度跟踪、学习分析和学习路径
- **互动学习**: 知识图谱、虚拟实验和互动测验
- **学习任务**: 作业、考试和每日挑战
- **学习社区**: 学习小组、讨论区和反馈提交

## 技术栈

### 前端

- React 18
- TypeScript
- Ant Design
- Vite
- React Router
- Axios
- Context API

### 后端

- .NET Core
- Entity Framework Core
- SQL Server/SQLite
- ASP.NET Core Web API

## 开发环境设置

### 前端

1. 确保已安装Node.js 16+
2. 在frontend/admin目录中运行：

```bash
npm install
npm run dev
```

3. 前端将在 http://localhost:5173 运行

### 后端

1. 确保已安装.NET 6.0+ SDK
2. 在backend目录中运行：

```bash
dotnet restore
dotnet build
dotnet run
```

3. 后端API将在 http://localhost:5188 运行

## 模拟数据模式

前端支持在后端API尚未就绪的情况下使用模拟数据进行开发和测试。模拟数据模式由配置文件`admin/src/config/env.ts`控制，默认已启用。

## 部署

### 前端

```bash
cd frontend/admin
npm run build
```

生成的静态文件位于`dist`目录，可部署到任何静态文件服务器。

### 后端

```bash
cd backend
dotnet publish -c Release
```

生成的发布文件可托管在IIS、Azure App Service或其他支持.NET应用的托管服务上。 