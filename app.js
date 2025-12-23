// ... 现有代码开头 ...
App({
  onLaunch(options) {
    console.info('App onLaunch');
    // 只做初始化工作，不再在这里发起用户授权
    // this.updateTabBarBadge();
  },

  onShow(options) {
    // 从后台回来，只更新购物车徽章
    //this.updateTabBarBadge();
  },

  // 全局获取用户信息方法（保持不变）
  getUserInfo() {
    return my.getStorageSync({ key: 'userInfo' }).data;
  },

  // 可选：全局获取/设置角色
  setUserRole(role) {
    // role: 'customer' | 'rider'
    my.setStorageSync({
      key: 'userRole',
      data: role
    });
  },

  getUserRole() {
    return my.getStorageSync({ key: 'userRole' }).data;
  },

  // 更新底部导航栏购物车徽章和图标（保留你原来的实现）
  updateTabBarBadge() {
    const cart = my.getStorageSync({ key: 'cart' }).data || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    console.log('更新购物车图标，数量：', count);

    if (count > 0) {
      const iconPath = 'assets/image/carted1.png';
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