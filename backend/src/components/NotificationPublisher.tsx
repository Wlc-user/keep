  // 澶勭悊鍙戝竷閫氱煡
  const handlePublish = async (values: any) => {
    try {
      setLoading(true);

      // 鍒涘缓閫氱煡鏁版嵁瀵硅薄
      const notificationData = {
        title: values.title,
        content: values.content,
        type: values.type || 'info',
        importance: values.importance || 'medium',
        link: values.link || '',
        category: values.category || 'system',
        // 娣诲姞鍙戦€佽€呬俊鎭?
        sender: {
          name: user?.name || (isAdmin ? '绠＄悊鍛? : '鏁欏笀'),
          avatar: user?.avatar
        }
      };

      console.log('鍙戝竷閫氱煡:', notificationData);

      // 直接使用导入的notificationService实例
      const result = await notificationService.sendNotification(notificationData);

      if (result) {
        message.success('閫氱煡鍙戝竷鎴愬姛');
        form.resetFields();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error('閫氱煡鍙戝竷澶辫触');
      }
    } catch (error) {
      console.error('鍙戝竷閫氱煡閿欒:', error);
      message.error('閫氱煡鍙戝竷澶辫触锛岃閲嶈瘯');
    } finally {
      setLoading(false);
    }
  }; 