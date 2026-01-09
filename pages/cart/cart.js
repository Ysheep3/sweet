Page({
  data: {
    cartItems: [],
    totalPrice: 0,
    isAllSelected: true
  },

  onShow() {
    this.loadCart();
  },
  
  // 加载购物车
  loadCart() {
    const app = getApp();
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    my.request({
      method: 'GET',
      headers: {
        authentication: app.globalData.authentication
      },
      url: `${apiBaseUrl}shopping-cart/list`,
      success: (res) => {

        if (res && res.data && res.data.code === 1) {
          console.log("res", res);
          const normalizedCart = res.data.data.map(item => ({
            ...item,
            selected: typeof item.selected === "boolean" ? item.selected : true
          }))

          const isAllSelected =
            normalizedCart.length > 0 &&
            normalizedCart.every(item => item.selected)

          const totalPrice = normalizedCart.reduce(
            (sum, item) =>
            item.selected ? sum + item.amount * item.number : sum,
            0
          )

          this.setData({
            cartItems: normalizedCart,
            totalPrice: totalPrice.toFixed(2),
            isAllSelected
          })
        }
      },
      fail: (err) => {
        my.showToast({
          title: "加载失败",
          content: res.data.msg,
          type: 'fail'
        })
      }
    })

    // 更新底部导航栏徽章
    this.updateTabBarBadge();
  },

  // 减少数量
  decreaseQuantity(e) {
    const {
      id,
      dishId,
      setmealId
    } = e.currentTarget.dataset;

    const cartItems = [...this.data.cartItems]
    const itemIndex = cartItems.findIndex(item => item.id === id)
    if (itemIndex === -1) return

    const item = cartItems[itemIndex]
    if (item.number <= 1) {
      this.deleteItem(e);
      return;
    }

    const newNumber = item.number - 1

    const cartData = {
      dishId: dishId,
      setmealId: setmealId
    };
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    my.request({
      url: `${apiBaseUrl}shopping-cart/delete`,
      method: 'POST',
      data: cartData,
      headers: {
        'Content-Type': 'application/json',
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          // 删除成功
          cartItems[itemIndex].number = newNumber
          this.updateCartState(cartItems)
        } else {
          my.showToast({
            content: res.data.msg || "更新失败",
            type: "fail"
          })
        }
      },
      fail: () => {
        my.showToast({
          content: "网络错误，请重试",
          type: "fail"
        })
      }
    })
  },

  // 增加数量
  increaseQuantity(e) {
    const {
      id,
      dishId,
      setmealId
    } = e.currentTarget.dataset;
    const cartItems = [...this.data.cartItems]
    const itemIndex = cartItems.findIndex(item => item.id === id)
    if (itemIndex === -1) return

    const item = cartItems[itemIndex]
    const newNumber = item.number + 1

    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    const cartData = {
      dishId: dishId,
      setmealId: setmealId
    };

    my.request({
      url: `${apiBaseUrl}shopping-cart/add`,
      method: 'POST',
      data: cartData,
      headers: {
        'Content-Type': 'application/json',
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          // 更新本地显示
          cartItems[itemIndex].number = newNumber
          this.updateCartState(cartItems)
        } else {
          my.showToast({
            content: res.data.msg || "更新失败",
            type: "fail"
          })
        }
      },
      fail: () => {
        my.showToast({
          content: "网络错误，请重试",
          type: "fail"
        })
      }
    })
  },

  // 删除商品
  deleteItem(e) {
    const {
      id
    } = e.currentTarget.dataset;

    my.confirm({
      content: '确定删除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

          my.request({
            url: `${apiBaseUrl}shopping-cart/${id}`,
            method: 'DELETE',
            headers: {
              authentication: app.globalData.authentication
            },
            success: (res) => {
              if (res.data && res.data.code === 1) {
                my.showToast({
                  content: "删除成功",
                  type: "success"
                })
                
                this.loadCart();
                this.updateCartState(cartItems)
              } else {
                my.showToast({
                  content: res.data.msg || "更新失败",
                  type: "fail"
                })
              }
            },
            fail: () => {
              my.showToast({
                content: "网络错误，请重试",
                type: "fail"
              })
            }
          })
        }
      }
    });
  },

  // 勾选/取消勾选单个商品
  toggleItemSelect(e) {
    const id = e.currentTarget.dataset.id
    const cartItems = this.data.cartItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          selected: !item.selected
        }
      }
      return item
    })
    const isAllSelected = cartItems.length > 0 && cartItems.every(item => item.selected)
    const totalPrice = cartItems.reduce((sum, item) => item.selected ? sum + item.amount * item.number : sum, 0)
    this.setData({
      cartItems,
      isAllSelected,
      totalPrice: totalPrice.toFixed(2)
    })
  },

  // 全选/取消全选
  toggleSelectAll() {
    let isAllSelected = this.data.isAllSelected
    const cartItems = this.data.cartItems.map(item => ({
      ...item,
      selected: !isAllSelected
    }))
    isAllSelected = cartItems.length > 0 && cartItems.every(item => item.selected)
    const totalPrice = cartItems.reduce((sum, item) => item.selected ? sum + item.amount * item.number : sum, 0)
    this.setData({
      cartItems,
      isAllSelected,
      totalPrice: totalPrice.toFixed(2)
    })
  },

  // 更新购物车状态（数量、勾选、合计）
  updateCartState(cartItems) {
    const isAllSelected = cartItems.length > 0 && cartItems.every(item => item.selected)
    const totalPrice = cartItems.reduce((sum, item) => item.selected ? sum + item.amount * item.number : sum, 0)
    this.setData({
      cartItems,
      isAllSelected,
      totalPrice: totalPrice.toFixed(2)
    })

    this.updateTabBarBadge();
  },

  // 提交订单（去结算）
  submitOrder() {
    if (this.data.cartItems.length === 0) {
      my.showToast({
        content: '购物车为空',
        type: 'fail'
      });
      return;
    }

    const selectedItems = this.data.cartItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      my.showToast({
        content: '请先勾选需要结算的商品',
        type: 'none'
      });
      return;
    }

    // 将本次勾选的商品单独存储给结算页使用
    my.setStorageSync({
      key: 'checkoutItems',
      data: selectedItems
    });

    // 只负责跳转到结算页面
    my.navigateTo({
      url: '/pages/checkout/checkout'
    });
  },

  // 更新底部导航栏购物车徽章
  updateTabBarBadge() {
    const app = getApp();
    if (app && app.updateTabBarBadge) {
      app.updateTabBarBadge();
    }
  }
});