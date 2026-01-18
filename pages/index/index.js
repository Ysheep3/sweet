Page({
  data: {
    searchKeyword: "",
    activeCategoryId: 0,
    categories: [],
    products: [],
    showFlyBall: false,
    ballStartX: 0,
    ballStartY: 0,
    flyBalls: [],
    showBottomBar: false, // 是否显示底部导航栏
    cartCount: 0, // 购物车数量
    cartTotalPrice: '0.00', // 购物车总价
    showCartPopup: false, // 是否显示弹层
    cartItems: [], // 购物车商品列表
  },

  onLoad() {
    this.updateTabBarBadge()
    this.loadCategories()
    this.loadProducts(0)
  },

  onShow() {
    // 检查购物车状态，如果有商品则显示底部导航栏
    const app = getApp()
    if (app.needUpdateCartBadge) {
      this.updateTabBarBadge()
      app.needUpdateCartBadge = false
    }
  },


  noop() {},

  loadCategories() {
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"
    my.request({
      url: `${apiBaseUrl}items/user/category/list`,
      method: "GET",
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const categories = res.data.data.map((category) => ({
            id: category.id,
            name: category.name,
            type: category.type,
            sort: category.sort,
            status: category.status,
          }))
          this.setData({
            categories,
            activeCategoryId: categories.length > 0 ? categories[0].id : 0
          })
        }
      },
      fail: (error) => {
        my.showToast({
          type: "fail",
          content: "请求失败",
        })
      },
    })
  },

  async loadProducts(categoryId) {
    this.setData({
      loading: true,
    })

    try {
      const [dishes, setmeals] = await Promise.all([this.getDishes(categoryId), this.getSetmeals(categoryId)])

      const products = [...dishes, ...setmeals].map(item => ({
        ...item,
        cartQuantity: 0
      }))

      this.setData({
        products,
        loading: false
      }, () => {
        this.loadCartAndSync()
      })

      // 更新购物车数量
      //this.loadCartInfo()
    } catch (error) {
      console.error("加载商品失败:", error)
      this.setData({
        products: [],
        loading: false,
      })
    }
  },

  getDishes(categoryId) {
    return new Promise((resolve) => {
      const app = getApp()
      const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

      my.request({
        url: `${apiBaseUrl}items/user/dish/list`,
        data: categoryId >= 0 ? {
          categoryId,
        } : {},
        method: "GET",
        success: (res) => {
          if (res.data && res.data.code === 1) {
            const Dish = require("../../models/Dish")
            const dishes = res.data.data.map((item) => {
              const dish = Dish.fromApi(item)
              return dish
            })
            resolve(dishes)
          } else {
            resolve([])
          }
        },
        fail: () => {
          resolve([])
        },
      })
    })
  },

  getSetmeals(categoryId) {
    return new Promise((resolve) => {
      const app = getApp()
      const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

      my.request({
        url: `${apiBaseUrl}items/user/setmeal/list`,
        data: categoryId >= 0 ? {
          categoryId,
        } : {},
        method: "GET",
        success: (res) => {
          if (res.data && res.data.code === 1) {
            const Setmeal = require("../../models/Setmeal")
            const setmeals = res.data.data.map((item) => {
              const setmeal = Setmeal.fromApi(item)
              return setmeal
            })
            resolve(setmeals)
          } else {
            resolve([])
          }
        },
        fail: () => {
          resolve([])
        },
      })
    })
  },

  switchCategory(e) {
    const categoryId = e.currentTarget.dataset.id
    const type = e.currentTarget.dataset.type

    this.setData({
      activeCategoryId: categoryId,
      searchKeyword: "",
    })

    if (type === 1) {
      this.loadDishes(categoryId)
    } else if (type === 2) {
      this.loadSetmeals(categoryId)
    } else {
      this.loadProducts(categoryId)
    }
  },

  loadDishes(categoryId) {
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    my.request({
      url: `${apiBaseUrl}items/user/dish/list`,
      data: {
        categoryId: categoryId,
      },
      method: "GET",
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const Dish = require("../../models/Dish")
          const products = res.data.data.map((item) => {
            const dish = Dish.fromApi(item)
            return {
              ...dish,
              cartQuantity: 0
            }
          })
          this.setData({
            products
          }, () => {
            this.loadCartAndSync()
          })

          // 更新购物车数量
          //this.loadCartInfo()
        } else {
          this.setData({
            products: [],
          })
        }
      },
      fail: (error) => {
        my.showToast({
          type: "fail",
          content: "请求失败",
        })
      },
    })
  },

  loadSetmeals(categoryId) {
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    my.request({
      url: `${apiBaseUrl}items/user/setmeal/list`,
      data: {
        categoryId: categoryId,
      },
      method: "GET",
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const Setmeal = require("../../models/Setmeal")
          const products = res.data.data.map((item) => {
            const setmeal = Setmeal.fromApi(item)
            return {
              ...setmeal,
              cartQuantity: 0
            }
          })
          this.setData({
            products
          }, () => {
            this.loadCartAndSync()
          })

          // 更新购物车数量
          //this.loadCartInfo()
        }
      },
      fail: (error) => {
        my.showToast({
          type: "fail",
          content: "请求失败",
        })
      },
    })
  },

  onSearchConfirm(e) {
    const keyword = e.detail.value
    console.log("搜索词：", keyword)
    this.setData({
      searchKeyword: keyword,
    })

    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    if (keyword.trim()) {
      my.request({
        url: `${apiBaseUrl}items/user/dish/search`,
        method: "GET",
        data: {
          keyword: keyword,
        },
        success: (res) => {
          if (res.data && res.data.code === 1) {
            const Dish = require("../../models/Dish")
            const Setmeal = require("../../models/Setmeal")

            console.log("res:", res.data.data)
            const products = res.data.data.map((item) => {
              if (item.type) {
                const type = Number.parseInt(item.type)
                if (type === 2) {
                  const setmeal = Setmeal.fromApi(item)
                  return {
                    ...setmeal,
                    cartQuantity: 0
                  }
                } else {
                  const dish = Dish.fromApi(item)
                  return {
                    ...dish,
                    cartQuantity: 0
                  }
                }
              }
            })

            this.setData({
              products
            }, () => {
              this.loadCartAndSync()
            })

            // 更新购物车数量
            //this.loadCartInfo()
          } else {
            this.setData({
              products: [],
            })
          }
        },
        fail: (error) => {
          console.error("搜索失败:", error)
          my.showToast({
            type: "fail",
            content: "搜索失败",
          })
        },
      })
    } else {
      const {
        activeCategoryId
      } = this.data
      if (activeCategoryId === 0) {
        this.loadProducts(0)
      } else {
        const currentCategory = this.data.categories.find((cat) => cat.id === activeCategoryId)
        if (currentCategory && currentCategory.type === 1) {
          this.loadDishes(activeCategoryId)
        } else if (currentCategory && currentCategory.type === 2) {
          this.loadSetmeals(activeCategoryId)
        }
      }
    }
  },

  clearSearch() {
    const {
      activeCategoryId
    } = this.data

    this.setData({
      activeCategoryId: 0,
      searchKeyword: "",
    })

    this.loadProducts(0)
  },

  viewProductDetail(e) {
    const productId = e.currentTarget.dataset.id
    const productType = e.currentTarget.dataset.type

    console.log("type:", productType)
    let type = productType
    if (!type) {
      const product = this.data.products.find((p) => p.id === productId)
      type = product ? product.type : 1
    }

    my.navigateTo({
      url: `/pages/product-detail/product-detail?id=${productId}&type=${type}`,
    })
  },

  addToCart(e) {
    const {
      id,
      type,
      index
    } = e.currentTarget.dataset

    const product = this.data.products[index];
    // 如果商品已在购物车中，则增加数量
    if (product && product.cartQuantity > 0) {
      this.increaseQuantity(e);
      return;
    }

    this.createFlyBall(index);

    console.log("type:", type)

    const cartData = type === 1 ? {
      dishId: id
    } : {
      setmealId: id
    }

    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"


    my.request({
      url: `${apiBaseUrl}shopping-cart/add`,
      method: "POST",
      data: cartData,
      headers: {
        "Content-Type": "application/json",
        authentication: app.globalData.authentication,
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          // 立即更新当前商品的购物车数量
          const products = [...this.data.products];
          if (products[index]) {
            products[index] = {
              ...products[index],
              cartQuantity: (products[index].cartQuantity || 0) + 1
            };
          }

          // 显示底部导航栏
          this.setData({
            showBottomBar: true,
            products: products
          });

          // 更新购物车信息
          this.loadCartInfo();

          // 更新底部导航栏徽章
          this.updateTabBarBadge()

          my.showToast({
            content: "已添加到购物车",
            type: "success",
          })
        } else {
          my.showToast({
            content: res.data.msg || "加入购物车失败",
            type: "fail",
          })
        }
      },
      fail: (error) => {
        console.error("加入购物车失败:", error)
        my.showToast({
          content: "网络错误，请重试",
          type: "fail",
        })
      },
    })
  },

  // 动画小球
  createFlyBall(index) {
    const query = my.createSelectorQuery()
    query.select(`#add-btn-${index}`).boundingClientRect()
    query.exec(res => {
      if (!res || !res[0]) return

      const rect = res[0]
      const startX = rect.left + rect.width / 2
      const startY = rect.top + rect.height / 2

      const systemInfo = my.getSystemInfoSync()
      const targetX = systemInfo.windowWidth / 2
      const targetY = systemInfo.windowHeight - 50

      const ballId = Date.now() + Math.random()

      const flyBall = {
        id: ballId,
        startX,
        startY,
        dx: targetX - startX,
        dy: targetY - startY
      }

      this.setData({
        flyBalls: [...this.data.flyBalls, flyBall]
      })

      setTimeout(() => {
        this.setData({
          flyBalls: this.data.flyBalls.filter(item => item.id !== ballId)
        })
      }, 900)
    })
  },

  syncCartToProducts(cartItems) {
    const products = this.data.products.map(product => {
      let cartItem = null

      if (product.type === 1) {
        cartItem = cartItems.find(
          i => Number(i.dishId) === Number(product.id)
        )
      } else if (product.type === 2) {
        cartItem = cartItems.find(
          i => Number(i.setmealId) === Number(product.id)
        )
      }

      return {
        ...product,
        cartQuantity: cartItem ? cartItem.number : 0
      }
    })

    this.setData({
      products
    })
  },

  // 减少数量
  decreaseQuantity(e) {
    const {
      id,
      type,
      index
    } = e.currentTarget.dataset

    const product = this.data.products[index];
    if (!product || !product.cartQuantity || product.cartQuantity <= 0) return;

    const cartData = type === 1 ? {
      dishId: id
    } : {
      setmealId: id
    }

    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    // 立即更新界面
    const products = [...this.data.products];
    const newQuantity = Math.max(0, (products[index].cartQuantity || 0) - 1);
    products[index] = {
      ...products[index],
      cartQuantity: newQuantity
    };
    this.setData({
      products: products
    });

    my.request({
      url: `${apiBaseUrl}shopping-cart/delete`,
      method: "POST",
      data: cartData,
      headers: {
        "Content-Type": "application/json",
        authentication: app.globalData.authentication,
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          // 更新购物车信息
          this.loadCartInfo();

          // 更新底部导航栏徽章
          this.updateTabBarBadge()
        } else {
          // 如果失败，恢复原来的数量
          this.loadCartInfo();
          my.showToast({
            content: res.data.msg || "操作失败",
            type: "fail",
          })
        }
      },
      fail: (error) => {
        // 如果失败，恢复原来的数量
        this.loadCartInfo();
        console.error("操作失败:", error)
        my.showToast({
          content: "网络错误，请重试",
          type: "fail",
        })
      },
    })
  },

  // 增加数量
  increaseQuantity(e) {
    const {
      id,
      type,
      index
    } = e.currentTarget.dataset

    const cartData = type === 1 ? {
      dishId: id
    } : {
      setmealId: id
    }

    this.createFlyBall(index);

    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    // 立即更新界面
    const products = [...this.data.products];
    if (products[index]) {
      products[index] = {
        ...products[index],
        cartQuantity: (products[index].cartQuantity || 0) + 1
      };
    }
    this.setData({
      products: products
    });

    my.request({
      url: `${apiBaseUrl}shopping-cart/add`,
      method: "POST",
      data: cartData,
      headers: {
        "Content-Type": "application/json",
        authentication: app.globalData.authentication,
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          // 更新购物车信息
          this.loadCartInfo();

          // 更新底部导航栏徽章
          this.updateTabBarBadge()
        } else {
          // 如果失败，恢复原来的数量
          this.loadCartInfo();
          my.showToast({
            content: res.data.msg || "操作失败",
            type: "fail",
          })
        }
      },
      fail: (error) => {
        // 如果失败，恢复原来的数量
        this.loadCartInfo();
        console.error("操作失败:", error)
        my.showToast({
          content: "网络错误，请重试",
          type: "fail",
        })
      },
    })
  },

  // 加载购物车信息（数量和总价）
  loadCartInfo() {
    const app = getApp();
    const apiBaseUrl = app.globalData.apiBaseUrl || 'http://localhost:8080/';

    my.request({
      url: `${apiBaseUrl}shopping-cart/list`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const cartItems = res.data.data || [];
          const totalCount = cartItems.reduce((sum, i) => sum + (i.number || 0), 0);
          const totalPrice = cartItems.reduce(
            (sum, i) => sum + (i.amount || 0) * (i.number || 0),
            0
          );

          this.setData({
            cartCount: totalCount,
            cartTotalPrice: totalPrice.toFixed(2),
            showBottomBar: totalCount > 0
          });
        }
      }
    });
  },

  /* ================== 购物车核心同步 ================== */

  loadCartAndSync(callback) {
    const app = getApp()
    const apiBaseUrl = app.globalData.apiBaseUrl || 'http://localhost:8080/'

    my.request({
      url: apiBaseUrl + 'shopping-cart/list',
      method: 'GET',
      headers: {
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res && res.data && res.data.code === 1) {
          const cartItems = res.data.data || []

          // 1️⃣ 同步商品列表数量（关键）
          this.syncCartToProducts(cartItems)

          // 2️⃣ 统计底部栏
          const cartCount = cartItems.reduce(
            (sum, i) => sum + (i.number || 0),
            0
          )

          const cartTotalPrice = cartItems.reduce(
            (sum, i) => sum + (i.amount || 0) * (i.number || 0),
            0
          )

          this.setData({
            cartItems,
            cartCount,
            cartTotalPrice: cartTotalPrice.toFixed(2),
            showBottomBar: cartCount > 0
          }, () => {
            if (callback) callback(cartCount);
            this.updateTabBarBadge();
          })
        }
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

  // 跳转到结算页面
  goToCheckout() {
    my.navigateTo({
      url: '/pages/checkout/checkout'
    });
  },

  updateTabBarBadge() {
    const app = getApp()
    if (app && app.updateTabBarBadge) {
      app.updateTabBarBadge()
    }
  },
})