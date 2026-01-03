const { userInfo } = require("os");

Page({
  data: {
    userInfo: {
      avatar: '/image/default-avatar.png',
      nickname: '点击登录',
      isLoggedIn: false,
    },
    favorites: []
  },

  onLoad() {
    this.loadUserInfo();
    this.loadFavorites();
  },

  onShow() {
    // 每次页面显示时刷新一下（防止从其他页面回来数据没更新）
    this.loadUserInfo();
    this.loadFavorites();
  },

  loadFavorites() {
    const favorites = my.getStorageSync({ key: 'favorites' }).data || [];
    this.setData({ favorites: favorites.slice(0, 3) });
  },

  // 从后端API获取用户信息
  loadUserInfo() {
    const app = getApp();
    if (app.globalData.userInfo) {
      const userInfoData = app.globalData.userInfo
      this.setData({ userInfo: {
        avatar: userInfoData.avatar,
        nickname: userInfoData.nickname,
        isLoggedIn: true,
      } });  // 直接用
      // console.log("用户信息：", userInfoData)
    }
    
    // 根据角色从不同的API获取用户信息
    // if (!role) {
    //   // 未登录状态
    //   this.setData({
    //     userInfo: {
    //       avatar: '/image/default-avatar.png',
    //       nickname: '点击登录',
    //       isLoggedIn: false,
    //       role: null
    //     }
    //   });
    //   return;
    // }
    
    // TODO: 从后端API获取当前登录用户信息
    // 示例：
    // const apiUrl = role === 'customer' 
    //   ? `${apiBaseUrl}user/current` 
    //   : `${apiBaseUrl}employee/current`;
    // 
    // my.request({
    //   url: apiUrl,
    //   method: 'GET',
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data) {
    //       const User = require('../../models/User');
    //       const Employee = require('../../models/Employee');
    //       const userData = role === 'customer' 
    //         ? User.fromApi(res.data)
    //         : Employee.fromApi(res.data);
    //       
    //       this.setData({
    //         userInfo: {
    //           avatar: userData.avatar || '/image/default-avatar.png',
    //           nickname: userData.nickname || userData.name || '用户',
    //           isLoggedIn: true,
    //           role: role
    //         }
    //       });
    //     }
    //   },
    //   fail: (err) => {
    //     console.error('获取用户信息失败:', err);
    //     // 获取失败，显示未登录状态
    //     this.setData({
    //       userInfo: {
    //         avatar: '/image/default-avatar.png',
    //         nickname: '点击登录',
    //         isLoggedIn: false,
    //         role: null
    //       }
    //     });
    //   }
    // });
    
    // 临时：根据角色显示默认信息
    // this.setData({
    //   userInfo: {
    //     avatar: '/image/default-avatar.png',
    //     nickname: role === 'customer' ? '顾客' : '骑手',
    //     isLoggedIn: true,
    //     role: role
    //   }
    // });
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
          // 清除全局角色信息
          const app = getApp();
          if (app.globalData) {
            app.globalData.userInfo = null;
          }

          // TODO: 调用后端退出登录接口
          // const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8081/';
          // my.request({
          //   url: `${apiBaseUrl}logout`,
          //   method: 'POST',
          //   success: () => {
          //     console.log('退出登录成功');
          //   }
          // });

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