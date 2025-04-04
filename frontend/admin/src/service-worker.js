/**
 * 在线学习系统服务工作线程
 * 提供资源缓存和离线访问能力
 */

// 缓存版本和名称
const CACHE_VERSION = 'v1';
const CACHE_NAME = `online-learning-system-${CACHE_VERSION}`;

// 需要缓存的静态资源
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/logo.svg',
  '/manifest.json',
  '/assets/default-avatar.png',
  '/fonts/roboto-v20-latin-regular.woff2',
  '/fonts/roboto-v20-latin-500.woff2',
  '/fonts/roboto-v20-latin-700.woff2',
  '/styles/critical.css',
];

// 需要缓存的API请求
const API_CACHE_URLS = [
  '/api/config',
  '/api/courses/popular',
  '/api/categories',
];

// 安装事件 - 预缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安装');
  
  // 跳过等待，立即激活
  self.skipWaiting();
  
  // 预缓存静态资源
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 预缓存静态资源');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.error('[Service Worker] 预缓存失败:', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活');
  
  // 立即接管所有客户端
  event.waitUntil(self.clients.claim());
  
  // 清理旧版本缓存
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('online-learning-system-') && cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[Service Worker] 删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
  );
});

// 请求拦截 - 缓存优先策略
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 忽略非GET请求
  if (event.request.method !== 'GET') {
    return;
  }
  
  // 忽略浏览器扩展请求
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // 静态资源 - 缓存优先，网络回退
  if (isStaticResource(url.pathname)) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }
  
  // API请求 - 网络优先，缓存回退
  if (isApiRequest(url.pathname)) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }
  
  // HTML请求 - 网络优先，缓存回退
  if (url.pathname.endsWith('/') || url.pathname.endsWith('.html')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }
  
  // 其他请求 - 仅网络
  event.respondWith(fetch(event.request));
});

/**
 * 判断是否为静态资源
 * @param {string} pathname 路径名
 * @returns {boolean} 是否为静态资源
 */
function isStaticResource(pathname) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', 
    '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'
  ];
  
  return staticExtensions.some(ext => pathname.endsWith(ext)) || 
         STATIC_CACHE_URLS.includes(pathname);
}

/**
 * 判断是否为API请求
 * @param {string} pathname 路径名
 * @returns {boolean} 是否为API请求
 */
function isApiRequest(pathname) {
  return pathname.startsWith('/api/') || 
         API_CACHE_URLS.includes(pathname);
}

/**
 * 缓存优先策略
 * 先从缓存获取，如果没有则从网络获取并缓存
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // 返回缓存的响应
    return cachedResponse;
  }
  
  // 从网络获取
  try {
    const networkResponse = await fetch(request);
    
    // 检查响应是否有效
    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
      return networkResponse;
    }
    
    // 缓存响应的副本（因为响应流只能使用一次）
    const responseToCache = networkResponse.clone();
    
    caches.open(CACHE_NAME)
      .then((cache) => {
        cache.put(request, responseToCache);
      });
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] 缓存优先策略失败:', error);
    
    // 如果网络请求失败，尝试返回离线页面
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    return new Response('网络请求失败', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

/**
 * 网络优先策略
 * 先从网络获取，如果失败则从缓存获取
 * @param {Request} request 请求对象
 * @returns {Promise<Response>} 响应对象
 */
async function networkFirstStrategy(request) {
  try {
    // 从网络获取
    const networkResponse = await fetch(request);
    
    // 检查响应是否有效
    if (!networkResponse || networkResponse.status !== 200) {
      throw new Error('无效的网络响应');
    }
    
    // 缓存响应的副本
    const responseToCache = networkResponse.clone();
    
    caches.open(CACHE_NAME)
      .then((cache) => {
        cache.put(request, responseToCache);
      });
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] 网络请求失败，尝试从缓存获取:', request.url);
    
    // 从缓存获取
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 如果缓存中也没有，尝试返回离线页面
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    // 如果是API请求，返回空数据
    if (isApiRequest(new URL(request.url).pathname)) {
      return new Response(JSON.stringify({ error: 'offline' }), {
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      });
    }
    
    // 其他情况返回服务不可用
    return new Response('网络请求失败，缓存中也没有数据', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// 后台同步事件 - 处理离线操作
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-course-progress') {
    event.waitUntil(syncCourseProgress());
  }
});

/**
 * 同步课程进度
 * @returns {Promise<void>}
 */
async function syncCourseProgress() {
  try {
    // 从 IndexedDB 获取待同步的课程进度
    const db = await openDatabase();
    const tx = db.transaction('courseProgress', 'readwrite');
    const store = tx.objectStore('courseProgress');
    const pendingItems = await store.getAll();
    
    // 没有待同步的数据
    if (pendingItems.length === 0) {
      return;
    }
    
    console.log('[Service Worker] 同步课程进度:', pendingItems.length, '条记录');
    
    // 逐个同步
    for (const item of pendingItems) {
      try {
        // 发送同步请求
        const response = await fetch('/api/courses/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(item)
        });
        
        if (response.ok) {
          // 同步成功，从待同步列表中删除
          await store.delete(item.id);
          console.log('[Service Worker] 同步成功:', item.id);
        } else {
          console.error('[Service Worker] 同步失败:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('[Service Worker] 同步项目失败:', error);
      }
    }
    
    await tx.complete;
  } catch (error) {
    console.error('[Service Worker] 同步课程进度失败:', error);
  }
}

/**
 * 打开 IndexedDB 数据库
 * @returns {Promise<IDBDatabase>} 数据库对象
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OnlineLearningSystem', 1);
    
    request.onerror = () => {
      reject(request.error);
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // 创建课程进度存储
      if (!db.objectStoreNames.contains('courseProgress')) {
        const store = db.createObjectStore('courseProgress', { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('courseId', 'courseId', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// 推送通知事件
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || '您有一条新通知',
      icon: data.icon || '/logo.svg',
      badge: data.badge || '/favicon.svg',
      data: data.data || {},
      actions: data.actions || [],
      vibrate: data.vibrate || [100, 50, 100],
      tag: data.tag || 'default',
      renotify: data.renotify || false
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || '在线学习系统', options)
    );
  } catch (error) {
    console.error('[Service Worker] 处理推送通知失败:', error);
    
    // 尝试显示基本通知
    event.waitUntil(
      self.registration.showNotification('在线学习系统', {
        body: '您有一条新通知',
        icon: '/logo.svg'
      })
    );
  }
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data || {};
  const url = data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // 查找已打开的窗口
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // 如果没有打开的窗口，则打开新窗口
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// 消息事件 - 处理从页面发送的消息
self.addEventListener('message', (event) => {
  const data = event.data;
  
  if (!data) {
    return;
  }
  
  // 处理清除缓存请求
  if (data.action === 'clearCache') {
    event.waitUntil(
      caches.delete(CACHE_NAME)
        .then(() => {
          console.log('[Service Worker] 缓存已清除');
          event.ports[0].postMessage({ result: 'success' });
        })
        .catch((error) => {
          console.error('[Service Worker] 清除缓存失败:', error);
          event.ports[0].postMessage({ result: 'error', message: error.message });
        })
    );
  }
  
  // 处理更新缓存请求
  if (data.action === 'updateCache') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('[Service Worker] 更新缓存');
          return cache.addAll(STATIC_CACHE_URLS);
        })
        .then(() => {
          event.ports[0].postMessage({ result: 'success' });
        })
        .catch((error) => {
          console.error('[Service Worker] 更新缓存失败:', error);
          event.ports[0].postMessage({ result: 'error', message: error.message });
        })
    );
  }
}); 