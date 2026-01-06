App({
  // API 基础地址配置
  globalData: {
    apiBaseUrl: 'http://172.20.10.2:8080/' // TODO: 替换为实际的后端API地址
  },

  
  // 更新底部导航栏购物车徽章和图标（保留你原来的实现）
  updateTabBarBadge() {
    const apiBaseUrl = this.globalData.apiBaseUrl || 'http://localhost:8080/';
    
    my.request({
      url: `${apiBaseUrl}cart/count`,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const cartCount = res.data.data || 0;
          
          // 更新购物车徽章
          if (cartCount > 0) {
            my.setTabBarBadge({
              index: 2, // 购物车所在tab索引
              text: cartCount.toString()
            });
          } else {
            my.removeTabBarBadge({
              index: 2
            });
          }
        }
      },
      fail: (error) => {
        console.error('获取购物车数量失败:', error);
      }
    });
  }
});