/**
 * 防重复加载修复脚本
 * 通过拦截DOM操作来防止重复加载资源
 */
(function() {
  // 已加载资源URL集合
  const loadedResources = new Set();
  
  // 检查资源是否已加载
  function isResourceLoaded(url) {
    return loadedResources.has(url);
  }
  
  // 标记资源为已加载
  function markResourceLoaded(url) {
    loadedResources.add(url);
    console.log(`[LoadingFix] 资源已标记为加载: ${url}`);
  }
  
  // 查找已存在的资源
  function findExistingResource(tagName, attr, value) {
    const elements = document.getElementsByTagName(tagName);
    for (let i = 0; i < elements.length; i++) {
      if (elements[i][attr] === value) {
        return elements[i];
      }
    }
    return null;
  }
  
  // 拦截创建元素方法
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = function(tagName) {
    const element = originalCreateElement(tagName);
    
    if (tagName.toLowerCase() === 'link' || tagName.toLowerCase() === 'script') {
      // 拦截设置属性
      const originalSetAttribute = element.setAttribute.bind(element);
      element.setAttribute = function(name, value) {
        if ((name === 'href' || name === 'src') && typeof value === 'string') {
          // 检查是否已存在相同资源
          const existingElement = findExistingResource(tagName, name === 'href' ? 'href' : 'src', value);
          if (existingElement || isResourceLoaded(value)) {
            console.log(`[LoadingFix] 阻止重复加载资源: ${value}`);
            return element; // 阻止设置
          }
          
          // 标记为已加载
          markResourceLoaded(value);
        }
        
        return originalSetAttribute.call(this, name, value);
      };
      
      // 拦截属性直接赋值
      const urlProp = tagName.toLowerCase() === 'link' ? 'href' : 'src';
      const originalPropDescriptor = Object.getOwnPropertyDescriptor(element.__proto__, urlProp);
      
      if (originalPropDescriptor && originalPropDescriptor.set) {
        Object.defineProperty(element, urlProp, {
          set: function(value) {
            if (typeof value === 'string') {
              // 检查是否已存在相同资源
              const existingElement = findExistingResource(tagName, urlProp, value);
              if (existingElement || isResourceLoaded(value)) {
                console.log(`[LoadingFix] 阻止重复加载资源: ${value}`);
                return; // 阻止设置
              }
              
              // 标记为已加载
              markResourceLoaded(value);
            }
            
            return originalPropDescriptor.set.call(this, value);
          },
          get: originalPropDescriptor.get
        });
      }
    }
    
    return element;
  };
  
  // 拦截appendChild方法
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(node) {
    // 处理link和script元素
    if (node.tagName === 'LINK' && node.rel === 'stylesheet' && node.href) {
      const existingLink = findExistingResource('link', 'href', node.href);
      if (existingLink) {
        console.log(`[LoadingFix] 阻止追加重复CSS: ${node.href}`);
        return existingLink; // 返回已存在的元素
      }
      markResourceLoaded(node.href);
    } else if (node.tagName === 'SCRIPT' && node.src) {
      const existingScript = findExistingResource('script', 'src', node.src);
      if (existingScript) {
        console.log(`[LoadingFix] 阻止追加重复脚本: ${node.src}`);
        return existingScript; // 返回已存在的元素
      }
      markResourceLoaded(node.src);
    }
    
    return originalAppendChild.call(this, node);
  };
  
  // 拦截insertBefore方法
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(node, referenceNode) {
    // 处理link和script元素
    if (node.tagName === 'LINK' && node.rel === 'stylesheet' && node.href) {
      const existingLink = findExistingResource('link', 'href', node.href);
      if (existingLink) {
        console.log(`[LoadingFix] 阻止插入重复CSS: ${node.href}`);
        return existingLink; // 返回已存在的元素
      }
      markResourceLoaded(node.href);
    } else if (node.tagName === 'SCRIPT' && node.src) {
      const existingScript = findExistingResource('script', 'src', node.src);
      if (existingScript) {
        console.log(`[LoadingFix] 阻止插入重复脚本: ${node.src}`);
        return existingScript; // 返回已存在的元素
      }
      markResourceLoaded(node.src);
    }
    
    return originalInsertBefore.call(this, node, referenceNode);
  };
  
  console.log('[LoadingFix] 资源加载拦截器已初始化');
})(); 