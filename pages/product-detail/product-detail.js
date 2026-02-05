Page({
  data: {
    product: {},
    sweet: '',
    temperature: '',
    isFavorite: false,
    loading: true,

    cartQuantity: 0,

    cartCount: 0,
    cartTotalPrice: '0.00',
    showBottomBar: false,

    showCartPopup: false,
    cartItems: [],

    flyBalls: []
  },

  onLoad(query) {
    const id = query.id || 0
    const type = Number(query.type || 1)

    if (!id) {
      my.showToast({
        content: '商品不存在',
        type: 'fail'
      })
      my.navigateBack()
      return
    }

    this.productId = id
    this.productType = type

    Promise.all([
      this.loadProductDetail(id, type),
      this.checkFavoriteStatus(id, type)
    ]).finally(() => {
      this.loadCartAndSync()
    })
  },

  onShow() {
    this.loadCartAndSync()
  },

  noop() {},

  /* ================== 商品详情 ================== */

  loadProductDetail(id, type) {
    const app = getApp()
    const apiBaseUrl = app.globalData.apiBaseUrl

    return new Promise((resolve) => {
      const url =
        type === 2 ?
        apiBaseUrl + 'items/user/setmeal/' + id :
        apiBaseUrl + 'items/user/dish/' + id

      my.request({
        url,
        method: 'GET',
        headers: {
          authentication: app.globalData.authentication
        },
        success: (res) => {
          if (res && res.data && res.data.code === 1) {
            let product
            if (type === 2) {
              const Setmeal = require('../../models/Setmeal')
              product = Setmeal.fromApi(res.data.data)
            } else {
              const Dish = require('../../models/Dish')
              product = Dish.fromApi(res.data.data)
            }

            this.setData({
              product,
              sweet: product.sweetOptions ? product.sweetOptions[0] : '',
              temperature: product.tempOptions ? product.tempOptions[0] : ''
            })
          }
          resolve()
        },
        fail: () => resolve()
      })
    })
  },

  /* ================== 收藏 ================== */

  checkFavoriteStatus(id, type) {
    const app = getApp()
    return new Promise((resolve) => {
      my.request({
        url: app.globalData.apiBaseUrl + 'items/user/favorite/check',
        method: 'POST',
        data: {
          productId: id,
          type
        },
        headers: {
          authentication: app.globalData.authentication
        },
        success: (res) => {
          if (res && res.data && res.data.code === 1) {
            this.setData({
              isFavorite: res.data.data
            })
          }
          resolve()
        },
        fail: () => resolve()
      })
    })
  },

  toggleFavorite() {
    const app = getApp()
    const {
      product,
      isFavorite
    } = this.data

    console.log("product",product);
    const url = isFavorite ?
      app.globalData.apiBaseUrl + 'items/user/favorite/delete' :
      app.globalData.apiBaseUrl + 'items/user/favorite/add'

    my.request({
      url,
      method: 'POST',
      data: {
        productId: product.id,
        type: product.type,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      headers: {
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res && res.data && res.data.code === 1) {
          this.setData({
            isFavorite: !isFavorite
          });
          if (isFavorite === true) {
            my.showToast({
              content: '已取消收藏',
              type: 'success'
            })
            return
          } else {
            my.showToast({
              content: '收藏成功',
              type: 'success'
            })
          }
        }
      }
    })
  },

  /* ================== 购物车核心同步 ================== */

  loadCartAndSync(callback) {
    const app = getApp()
    const apiBaseUrl = app.globalData.apiBaseUrl
    const product = this.data.product

    my.request({
      url: apiBaseUrl + 'shopping-cart/list',
      method: 'GET',
      headers: {
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res && res.data && res.data.code === 1) {
          const cartItems = res.data.data || []

          let cartCount = 0
          let cartTotalPrice = 0
          let currentQuantity = 0

          cartItems.forEach(i => {
            cartCount += i.number || 0
            cartTotalPrice += (i.amount || 0) * (i.number || 0)

            if (product && product.id) {
              if (product.type === 1 && Number(i.dishId) === Number(product.id)) {
                currentQuantity = i.number
              }
              if (product.type === 2 && Number(i.setmealId) === Number(product.id)) {
                currentQuantity = i.number
              }
            }
          })

          this.setData({
            cartItems,
            cartCount,
            cartQuantity: currentQuantity,
            cartTotalPrice: cartTotalPrice.toFixed(2),
            showBottomBar: cartCount > 0
          }, () => {
            // ✅ setData 完成后再回调
            if (callback) callback(cartCount)
          })
        }
      }
    })
  },


  /* ================== 详情页加减 ================== */

  addToCart() {
    this.increaseQuantity()
  },

  increaseQuantity() {
    const app = getApp()
    const product = this.data.product

    this.createFlyBall()

    const data =
      product.type === 1 ? {
        dishId: product.id
      } : {
        setmealId: product.id
      }

    my.request({
      url: app.globalData.apiBaseUrl + 'shopping-cart/add',
      method: 'POST',
      data,
      headers: {
        authentication: app.globalData.authentication
      },
      success: () => {
        this.loadCartAndSync()
        app.needUpdateCartBadge = true;
      }
    })
  },

  decreaseQuantity() {
    const app = getApp()
    const product = this.data.product

    if (this.data.cartQuantity <= 0) return

    const data =
      product.type === 1 ? {
        dishId: product.id
      } : {
        setmealId: product.id
      }

    my.request({
      url: app.globalData.apiBaseUrl + 'shopping-cart/delete',
      method: 'POST',
      data,
      headers: {
        authentication: app.globalData.authentication
      },
      success: () => {
        this.loadCartAndSync();
        app.needUpdateCartBadge = true;
      }
    })
  },

  /* ================== 弹层 ================== */

  openCartPopup() {
    this.setData({
      showCartPopup: true
    })
    this.loadCartAndSync()
  },

  closeCartPopup() {
    this.setData({
      showCartPopup: false
    })
  },

  popupIncrease(e) {
    const item = e.currentTarget.dataset.item
    const app = getApp()

    const data = item.dishId ? {
      dishId: item.dishId
    } : {
      setmealId: item.setmealId
    }

    my.request({
      url: app.globalData.apiBaseUrl + 'shopping-cart/add',
      method: 'POST',
      data,
      headers: {
        authentication: app.globalData.authentication
      },
      success: () => {
        this.loadCartAndSync()
      }
    })
  },

  popupDecrease(e) {
    const item = e.currentTarget.dataset.item
    const app = getApp()

    const data = item.dishId ? {
      dishId: item.dishId
    } : {
      setmealId: item.setmealId
    }

    my.request({
      url: app.globalData.apiBaseUrl + 'shopping-cart/delete',
      method: 'POST',
      data,
      headers: {
        authentication: app.globalData.authentication
      },
      success: () => {
        this.loadCartAndSync((cartCount) => {
          // ✅ 购物车空了，自动关弹层
          if (cartCount <= 0) {
            this.closeCartPopup()
          }
        })
      }
    })
  },

  clearCart() {
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"
    my.confirm({
      content: "确定要清空购物车吗？",
      success: (res) => {
        if (res.confirm) {
          my.request({
            url: `${apiBaseUrl}shopping-cart/clear`,
            method: 'DELETE',
            headers: {
              authentication: app.globalData.authentication
            },
            success: () => {
              this.loadCartAndSync((cartCount) => {
                // ✅ 购物车空了，自动关弹层
                if (cartCount <= 0) {
                  this.closeCartPopup()
                }
              })
            },
            fail: (res) => {
              my.showToast({
                type: 'fail',
                content: '操作失败'
              })
            }
          })
        }
      }
    })
  },

  /* ================== 飞球 ================== */

  createFlyBall() {
    const query = my.createSelectorQuery()
    query.select('#detail-add-btn').boundingClientRect()
    query.exec(res => {
      if (!res || !res[0]) return

      const rect = res[0]
      const systemInfo = my.getSystemInfoSync()

      const ball = {
        id: Date.now(),
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        dx: systemInfo.windowWidth / 2 - rect.left,
        dy: systemInfo.windowHeight - rect.top - 60
      }

      this.setData({
        flyBalls: this.data.flyBalls.concat(ball)
      })

      setTimeout(() => {
        this.setData({
          flyBalls: this.data.flyBalls.filter(b => b.id !== ball.id)
        })
      }, 800)
    })
  },

  /* ================== 其他 ================== */

  goToCheckout() {
    my.navigateTo({
      url: '/pages/checkout/checkout'
    })
  }
})