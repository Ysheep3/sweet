Page({
  data: {
    userInfo: {
      avatar: '/image/default-avatar.png',
      nickname: '点击登录',
      isLoggedIn: false,
      role: null
    },
    favorites: []
  },

  onLoad() {
    this.loadUserInfo();
    this.loadFavorites();
  },

  onShow() {
    this.loadUserInfo();
    this.loadFavorites();
  },

  loadFavorites() {
    const favorites = my.getStorageSync({ key: 'favorites' }).data || [];
    this.setData({ favorites: favorites.slice(0, 3) });
  },

  // 只从 storage 读取登录信息
  loadUserInfo() {
    const userInfo = my.getStorageSync({ key: 'userInfo' }).data;
    if (userInfo && userInfo.isLoggedIn) {
      this.setData({
        userInfo: {
          avatar: userInfo.avatar,
          nickname: userInfo.nickname,
          isLoggedIn: true,
          role: userInfo.role || 'customer'
        }
      });
    } else {
      this.setData({
        userInfo: {
          avatar: '/image/default-avatar.png',
          nickname: '点击登录',
          isLoggedIn: false,
          role: null
        }
      });
    }
  },
 
  // 跳转到角色选择（重新登录 / 切换角色）
  goToRoleSelect() {
    my.reLaunch({
      url: '/pages/role-select/roleSelect'
    });
  },

  // 退出登录
  handleLogout() {
    my.confirm({
      title: '退出登录',
      content: '确定要退出登录吗？退出后需要重新选择角色并登录。',
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      success: (res) => {
        if (res.confirm) {
          my.removeStorageSync({ key: 'userInfo' });
          my.removeStorageSync({ key: 'userRole' });

          this.setData({
            userInfo: {
              avatar: '/image/default-avatar.png',
              nickname: '点击登录',
              isLoggedIn: false,
              role: null
            }
          });

          my.reLaunch({
            url: '/pages/role-select/roleSelect'
          });
          
          my.showToast({
            content: '已退出登录',
            type: 'success'
          });
        }
      }
    });
  },

  // 下面保持你原有的业务（地址/订单/收藏等），只在需要登录的地方调用 checkLogin()
  manageAddress() {
    if (!this.checkLogin()) return;
    my.navigateTo({ url: '/pages/address/address' });
  },

  manageCart() {
    my.switchTab({ url: '/pages/cart/cart' });
  },

  // 优惠券管理
  manageCoupons() {
    if (!this.checkLogin()) return;
    my.navigateTo({ url: '/pages/coupon/coupon' });
  },

  manageOrder() {
    if (!this.checkLogin()) return;
    my.navigateTo({ url: '/pages/order/order' });
  },

  manageFavorites() {
    if (!this.checkLogin()) return;
    my.navigateTo({ url: '/pages/favorites/favorites' });
  },

  checkLogin() {
    if (!this.data.userInfo.isLoggedIn) {
      my.showToast({
        content: '请先登录',
        type: 'fail'
      });
      return false;
    }
    return true;
  }
});