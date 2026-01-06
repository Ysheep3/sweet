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

  loadUserInfo() {
    const app = getApp();
    if (app.globalData.userInfo) {
      const userInfoData = app.globalData.userInfo
      this.setData({
        userInfo: {
          avatar: userInfoData.avatar,
          nickname: userInfoData.nickname,
          isLoggedIn: true,
        }
      }); // 直接用
      // console.log("用户信息：", userInfoData)
    }
  },

  // 跳转到角色选择（重新登录 / 切换角色）
  goToRoleSelect() {
    my.reLaunch({
      url: '/pages/role-select/roleSelect'
    });
  },

  // 加载收藏列表
  loadFavorites() {
    const app = getApp();
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/';

    my.request({
      url: `${apiBaseUrl}items/user/favorite/list`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authentication: app.globalData.authentication
      },
      success: (res) => {
        console.log("res:", res);
        if (res && res.data.code === 1) {
          this.setData({
            favorites: res.data.data
          });
        }
      },
      fail: (err) => {
        my.showToast({
          type: 'fail',
          content: err.message,
          duration: 1000
        });
      }
    })
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

    // 加入购物车


    my.showToast({
      content: "已添加到购物车",
      type: "success",
      duration: 1500,
    })
  },

  // 移除收藏
  removeFavorite(e) {
    const id = e.currentTarget.dataset.id
    const app = getApp();
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/';

    my.confirm({
      title: "移除收藏",
      content: "确定要移除这个收藏吗？",
      confirmButtonText: "移除",
      cancelButtonText: "取消",
      success: (res) => {
        if (res.confirm) {
          my.request({
            url: `${apiBaseUrl}items/user/favorite/${id}`,
            method: 'DELETE',
            headers: {
              authentication: app.globalData.authentication
            },
            success: (res) => {
              if (res.data && res.data.code === 1) {
                my.showToast({
                  content: '操作成功',
                  type: 'success'
                });
                this.loadFavorites();
              } else {
                my.showToast({
                  content: res.data.msg || '操作失败',
                  type: 'fail'
                });
              }
            },
            fail: (error) => {
              console.error('收藏操作失败:', error);
              my.showToast({
                content: '网络错误，请重试',
                type: 'fail'
              });
            }
          });
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