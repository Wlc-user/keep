# 权限系统使用文档

本文档详细说明了在线学习系统中权限系统的实现和使用方法。

## 概述

权限系统基于角色的访问控制（RBAC）模型，主要包含以下组件：

1. **权限工具类**：提供权限检查的核心函数
2. **权限Hook**：方便在函数组件中使用权限检查
3. **权限Guard组件**：控制页面内部组件的显示
4. **PrivateRoute组件**：控制整个页面的访问权限

## 角色层级

系统定义了三种角色，按权限从高到低排序：

- `admin`：管理员，拥有全部权限
- `teacher`：教师，拥有教学相关权限
- `student`：学生，拥有学习相关权限

每个角色拥有不同的权限点，决定了用户可以执行的操作。

## 核心组件

### 1. permissionUtils.ts

提供权限检查的核心工具函数。

```typescript
// 检查用户是否有特定角色权限
hasPermission(userRole, allowedRoles)

// 检查用户角色是否达到所需的角色层级
hasRoleLevel(userRole, requiredRole)

// 获取菜单可见性配置
getMenuVisibility(userRole)
```

### 2. usePermission.tsx

自定义Hook，方便在组件中使用权限功能。

```typescript
const { 
  userRole,             // 当前用户角色
  checkPermission,      // 检查角色权限
  checkRoleLevel,       // 检查角色层级
  permissions,          // 权限状态对象
  menuVisibility        // 菜单可见性配置
} = usePermission();
```

### 3. PermissionGuard.tsx

用于控制页面内部组件的显示。

```jsx
// 基于角色控制
<PermissionGuard allowedRoles={['admin', 'teacher']}>
  <RestrictedComponent />
</PermissionGuard>

// 基于权限点控制
<PermissionGuard requiredPermission={['courses.manage']}>
  <RestrictedComponent />
</PermissionGuard>

// 使用备用内容
<PermissionGuard 
  allowedRoles={['admin']} 
  fallback={<AlternativeComponent />}
>
  <RestrictedComponent />
</PermissionGuard>

// 无权限时不显示任何内容
<PermissionGuard allowedRoles={['admin']} noDeniedFeedback>
  <RestrictedComponent />
</PermissionGuard>
```

### 4. PrivateRoute.tsx

用于控制整个页面的访问权限。

```jsx
<Route path="/admin-only" element={
  <PrivateRoute allowedRoles={['admin']}>
    <AdminOnlyPage />
  </PrivateRoute>
} />
```

## 权限点定义

系统权限点按模块划分，每个模块包含多个操作权限。

```typescript
export const Permissions = {
  DASHBOARD: {
    VIEW: ['admin', 'teacher', 'student'],
    MANAGE: ['admin'],
  },
  COURSES: {
    VIEW: ['admin', 'teacher', 'student'],
    MANAGE: ['admin', 'teacher'],
    CREATE: ['admin', 'teacher'],
    DELETE: ['admin'],
  },
  // ...其他模块权限
};
```

## 菜单可见性

侧边菜单显示根据用户角色动态生成，确保用户只能看到其有权访问的菜单项。

```typescript
const { menuVisibility } = usePermission();

// 菜单项示例
menuVisibility.dashboard && {
  key: '/dashboard',
  icon: <DashboardOutlined />,
  label: '仪表盘',
}
```

## 在组件中使用权限检查

```jsx
import usePermission from '../hooks/usePermission';

const MyComponent = () => {
  const { permissions } = usePermission();
  
  return (
    <div>
      {permissions.courses.create && (
        <Button type="primary">创建课程</Button>
      )}
    </div>
  );
};
```

## 权限演示页面

系统提供了一个权限演示页面，可以用于测试和理解权限系统的工作方式。访问路径为：`/permission-demo`。

演示页面包含：
- 角色切换功能
- 基于角色的组件控制示例
- 基于权限点的功能控制示例
- 菜单可见性配置显示

## 最佳实践

1. **合理使用权限控制**：根据业务需要选择适当的权限控制方式
2. **尽量使用权限点**：相比直接检查角色，使用权限点更加灵活
3. **提供良好的用户体验**：当用户没有权限时，提供友好的提示和可选的备用内容
4. **定期审查权限配置**：确保权限设置符合业务需求并保持更新

## 权限系统扩展

如需扩展权限系统，可以：

1. 在`permissionUtils.ts`中添加新的权限点
2. 在`usePermission.tsx`中更新权限状态对象
3. 根据需要调整`PermissionGuard`和`PrivateRoute`组件

## 常见问题

**Q: 如何处理动态权限？**
A: 可以通过API获取用户权限，并在AppContext中存储，然后在权限系统中使用。

**Q: 如何处理细粒度权限？**
A: 可以扩展权限点定义，增加更多的权限类型，或引入资源ID级别的权限控制。 