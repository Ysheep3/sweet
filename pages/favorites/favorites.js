Page({
  data: {
    userInfo: {
      avatar: "/image/default-avatar.png",
      nickname: "点击登录",
      isLoggedIn: false,
    },
    favorites: [],
  },

  onLoad() {
    this.loadUserInfo()
    this.loadFavorites()
  },

  onShow() {
    // 每次显示页面时重新加载用户信息和收藏
    this.loadUserInfo()
    this.loadFavorites()
  },

  // 从后端API获取用户信息
  loadUserInfo() {
    const app = getApp();
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8081/';
    const role = app.getUserRole && app.getUserRole();
    
    // 根据角色从不同的API获取用户信息
    if (!role) {
      // 未登录状态
      this.setData({
        userInfo: {
          avatar: "/image/default-avatar.png",
          nickname: "点击登录",
          isLoggedIn: false,
        },
      });
      return;
    }
    
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
    //           avatar: userData.avatar || "/image/default-avatar.png",
    //           nickname: userData.nickname || userData.name || "用户",
    //           isLoggedIn: true,
    //         }
    //       });
    //     }
    //   },
    //   fail: (err) => {
    //     console.error('获取用户信息失败:', err);
    //     this.setData({
    //       userInfo: {
    //         avatar: "/image/default-avatar.png",
    //         nickname: "点击登录",
    //         isLoggedIn: false,
    //       }
    //     });
    //   }
    // });
    
    // 临时：根据角色显示默认信息
    this.setData({
      userInfo: {
        avatar: "/image/default-avatar.png",
        nickname: role === 'customer' ? '顾客' : '骑手',
        isLoggedIn: true,
      },
    });
  },

  // 加载收藏列表
  loadFavorites() {
    const favorites = my.getStorageSync({ key: "favorites" }).data || []
    this.setData({ favorites: favorites })
  },

  // 添加到购物车
  addToCart(e) {
    // 检查登录状态
    if (!this.data.userInfo.isLoggedIn) {
      my.showToast({
        content: "请先登录",
        type: "fail",
      })
      return
    }

    const productId = e.currentTarget.dataset.id
    const product = this.data.favorites.find((item) => item.id === productId)

    if (!product) {
      my.showToast({
        content: "找不到该商品",
        type: "fail",
      })
      return
    }

    // 获取购物车
    const cart = my.getStorageSync({ key: "cart" }).data || []

    // 检查商品是否已在购物车中
    const existingItem = cart.find((item) => item.id === productId)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        ...product,
        quantity: 1,
      })
    }

    // 保存购物车
    my.setStorageSync({
      key: "cart",
      data: cart,
    })

    my.showToast({
      content: "已添加到购物车",
      type: "success",
      duration: 1500,
    })
  },

  // 移除收藏
  removeFavorite(e) {
    const productId = e.currentTarget.dataset.id

    my.confirm({
      title: "移除收藏",
      content: "确定要移除这个收藏吗？",
      confirmButtonText: "移除",
      cancelButtonText: "取消",
      success: (res) => {
        if (res.confirm) {
          const favorites = this.data.favorites.filter((item) => item.id !== productId)

          // 保存更新后的收藏列表
          my.setStorageSync({
            key: "favorites",
            data: favorites,
          })

          this.setData({ favorites: favorites })

          my.showToast({
            content: "已移除收藏",
            type: "success",
            duration: 1500,
          })
        }
      },
    })
  },

  navigateToLogin() {
    my.navigateTo({
      url: "/pages/login/login",
    })
  },

  logout() {
    my.confirm({
      title: "退出登录",
      content: "确定要退出登录吗？",
      confirmButtonText: "退出",
      cancelButtonText: "取消",
      success: (res) => {
        if (res.confirm) {
          // 清除全局角色信息
          const app = getApp();
          if (app.globalData) {
            app.globalData.currentRole = null;
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

          this.setData({
            userInfo: {
              avatar: "/image/default-avatar.png",
              nickname: "点击登录",
              isLoggedIn: false,
            },
          })

          my.showToast({
            content: "已退出登录",
            type: "success",
            duration: 1500,
          })
          
          // 跳转到角色选择页面
          my.reLaunch({
            url: '/pages/role-select/roleSelect'
          });
        }
      },
    })
  },

  browsProducts() {
    my.switchTab({
      url: "/pages/index/index",
    })
  },
})
