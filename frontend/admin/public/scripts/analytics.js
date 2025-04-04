// 分析脚本
(function() {
  console.log('分析脚本已加载');
  
  // 初始化分析
  function initAnalytics() {
    // 这里是分析代码的实现
    console.log('分析已初始化');
    
    // 页面浏览事件
    trackPageView();
    
    // 监听路由变化
    window.addEventListener('popstate', function() {
      trackPageView();
    });
  }
  
  // 跟踪页面浏览
  function trackPageView() {
    const page = window.location.pathname;
    console.log('页面浏览:', page);
    // 在这里发送页面浏览数据
  }
  
  // 跟踪事件
  window.trackEvent = function(category, action, label, value) {
    console.log('事件跟踪:', { category, action, label, value });
    // 在这里发送事件数据
  };
  
  // 当DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalytics);
  } else {
    initAnalytics();
  }
})(); 