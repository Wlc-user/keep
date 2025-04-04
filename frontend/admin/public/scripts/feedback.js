// 反馈脚本
(function() {
  console.log('反馈脚本已加载');
  
  // 初始化反馈系统
  function initFeedback() {
    console.log('反馈系统已初始化');
    
    // 创建反馈按钮
    createFeedbackButton();
  }
  
  // 创建反馈按钮
  function createFeedbackButton() {
    // 这里是创建反馈按钮的代码
    // 实际项目中可能会创建一个悬浮按钮
  }
  
  // 提交反馈
  window.submitFeedback = function(type, content, email) {
    console.log('提交反馈:', { type, content, email });
    // 在这里发送反馈数据
    return Promise.resolve({ success: true });
  };
  
  // 当DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeedback);
  } else {
    initFeedback();
  }
})(); 