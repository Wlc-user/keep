import React from 'react';

/**
 * 导出单例 React 实例
 * 这有助于防止多个 React 副本导致的钩子和上下文问题
 */
export const singletonReact = React;

/**
 * 检查 React 版本一致性，帮助调试问题
 */
export const checkReactVersion = () => {
  console.info('React 版本:', React.version);
  
  // 检查是否有多个 React 副本
  // @ts-ignore - 访问全局 window.__REACT_DEVTOOLS_GLOBAL_HOOK__ 属性
  const versions = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers
    ? Array.from(
        // @ts-ignore
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.values(),
        renderer => renderer.version
      )
    : [];
  
  if (versions.length > 1) {
    console.warn('检测到多个 React 版本:', versions);
    return false;
  }
  
  return true;
};

/**
 * 检查组件是否在 React 树中正确使用钩子的工具函数
 */
export const checkHookUsage = () => {
  try {
    // @ts-ignore - 访问内部 React 属性
    const currentDispatcher = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher?.current;
    
    if (!currentDispatcher) {
      console.warn('无法访问 React 内部调度器，可能在钩子外部调用钩子');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('检查钩子使用时出错', error);
    return false;
  }
};

/**
 * 替代 styled-components 中使用的一些基本样式功能
 * 避免使用 ThemeProvider 导致的上下文问题
 */
export const createStyledElement = (
  Component: React.ComponentType<any> | keyof JSX.IntrinsicElements,
  styleProps: React.CSSProperties,
  cssProps?: Record<string, any>
) => {
  return React.forwardRef<HTMLElement, any>((props, ref) => {
    // 合并样式
    const style = { ...styleProps, ...(props.style || {}) };
    return React.createElement(Component, { ...props, style, ref });
  });
};

export default {
  singletonReact,
  checkReactVersion,
  checkHookUsage,
  createStyledElement
}; 