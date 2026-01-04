App({
  // API 基础地址配置
  globalData: {
    apiBaseUrl: 'http://172.20.10.2:8080/' // TODO: 替换为实际的后端API地址
  },

  // 可选：全局获取/设置角色（已移除本地存储）
  setUserRole(role) {
    // role: 'customer' | 'rider'
    // 不再存储角色信息
    this.globalData.currentRole = role;
  },

  getUserRole() {
    // 不再从本地存储读取
    return this.globalData.currentRole || null;
  },

  // 更新底部导航栏购物车徽章和图标（保留你原来的实现）
  updateTabBarBadge() {
    const cart = my.getStorageSync({ key: 'cart' }).data || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    console.log('更新购物车图标，数量：', count);

    if (count > 0) {
      const iconPath = 'assets/image/carted.png';
      my.setTabBarItem({
        index: 1,
        iconPath: iconPath,
        selectedIconPath: iconPath,
        success: () => {
          console.log('已设置购物车图标为carted1.png');
        },
        fail: (err) => {
          console.error('设置图标失败，尝试使用icon参数:', err);
          my.setTabBarItem({
            index: 1,
            icon: iconPath,
            selectedIcon: iconPath
          });
        }
      });

      my.setTabBarBadge({
        index: 1,
        text: count.toString()
      });
    } else {
      const iconPath = 'assets/image/cart.png';
      my.setTabBarItem({
        index: 1,
        iconPath: iconPath,
        selectedIconPath: iconPath,
        success: () => {
          console.log('已设置购物车图标为cart.png');
        },
        fail: (err) => {
          console.error('设置图标失败，尝试使用icon参数:', err);
          my.setTabBarItem({
            index: 1,
            icon: iconPath,
            selectedIcon: iconPath
          });
        }
      });

      my.removeTabBarBadge({
        index: 1
      });
    }
  }
});