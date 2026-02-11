App({
  // API 基础地址配置
  globalData: {
    apiBaseUrl: 'http://172.20.10.2:8080/' // TODO: 替换为实际的后端API地址
  },

  onLaunch(options) {
    let tableNo = null;

    if (options.query && options.query.tableNo) {
      tableNo = options.query.tableNo;
    }

    if (!tableNo) {
      const tableList = ['A01', 'A02', 'A03', 'A04'];
      const randomIndex = Math.floor(Math.random() * tableList.length);
      tableNo = tableList[randomIndex];

      my.setStorageSync({
        key: 'tableNo',
        data: tableNo
      });

      // 🔥 同时记录来源
      my.setStorageSync({
        key: 'tableNoFromScan',
        data: true
      });
    }
  },

  // 更新底部导航栏购物车徽章和图标（保留你原来的实现）
  updateTabBarBadge() {
    const app = getApp();
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/';

    my.request({
      url: `${apiBaseUrl}shopping-cart/count`,
      method: 'GET',
      headers: {
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const cartCount = res.data.data || 0;

          // 更新购物车徽章
          if (cartCount > 0) {
            const iconPath = 'assets/image/carted.png';
            my.setTabBarItem({
              index: 1,
              iconPath: iconPath,
              selectedIconPath: iconPath,
              success: () => {
                console.log('已设置购物车图标为carted.png');
              },
              fail: (err) => {
                console.error('设置图标失败，尝试使用icon参数:', err);
                my.setTabBarItem({
                  index: 1,
                  icon: iconPath,
                  selectedIcon: iconPath
                });
              }
            })
            my.setTabBarBadge({
              index: 1,
              text: cartCount.toString()
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
      }
    })
  }
});