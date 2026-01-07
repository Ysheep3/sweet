Page({
  data: {
    searchKeyword: "",
    activeCategoryId: 0,
    categories: [],
    products: [],
    showFlyBall: false,
    ballStartX: 0,
    ballStartY: 0,
    flyBalls: []
  },

  onLoad() {
    this.updateTabBarBadge()
    this.loadCategories()
    this.loadProducts(0)
  },

  onShow() {
    this.updateTabBarBadge()
  },

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

      const products = [...dishes, ...setmeals]

      this.setData({
        products,
        loading: false,
      })
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
            return dish
          })
          this.setData({
            products,
          })
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
            return setmeal
          })
          this.setData({
            products,
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
                  return setmeal
                } else {
                  const dish = Dish.fromApi(item)
                  return dish
                }
              }
            })

            this.setData({
              products,
            })
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

    // ====== ① 创建飞球 ======
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

      // 动画结束后只删除自己
      setTimeout(() => {
        this.setData({
          flyBalls: this.data.flyBalls.filter(item => item.id !== ballId)
        })
      }, 900)
    })

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

  updateTabBarBadge() {
    const app = getApp()
    if (app && app.updateTabBarBadge) {
      app.updateTabBarBadge()
    }
  },
})