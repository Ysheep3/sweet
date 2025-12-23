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

  // 加载用户信息
  loadUserInfo() {
    const userInfo = my.getStorageSync({ key: "userInfo" }).data
    if (userInfo && userInfo.isLoggedIn) {
      this.setData({
        userInfo: {
          ...userInfo,
          isLoggedIn: true,
        },
      })
    } else {
      this.setData({
        userInfo: {
          avatar: "/image/default-avatar.png",
          nickname: "点击登录",
          isLoggedIn: false,
        },
      })
    }
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
          my.setStorageSync({
            key: "userInfo",
            data: {
              avatar: "/image/default-avatar.png",
              nickname: "点击登录",
              isLoggedIn: false,
            },
          })

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
