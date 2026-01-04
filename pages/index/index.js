Page({
  data: {
    searchKeyword: '',
    activeCategoryId: 0,
    categories: [],
    products: []
  },

  onLoad() {
    this.updateTabBarBadge();
    // 先加载分类，加载完成后再加载商品
    this.loadCategories();
    this.loadProducts(0); // 0表示全部

  },

  onShow() {
    this.updateTabBarBadge();
  },

  loadCategories() {
    const app = getApp();
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/'
    my.request({
      url: `${apiBaseUrl}items/user/category/list`,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const categories = res.data.data.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            sort: item.sort,
            status: item.status
          }));
          this.setData({
            categories
          });
        }
      },
      fail: (error) => {
        my.showToast({
          type: 'fail',
          content: res.data.msg
        });
      }
    });
  },

  // 加载商品数据（并行请求菜品和套餐）
  async loadProducts(categoryId) {
    this.setData({
      loading: true
    });

    try {
      // 并行请求菜品和套餐
      const [dishes, setmeals] = await Promise.all([
        this.getDishes(categoryId),
        this.getSetmeals(categoryId)
      ]);

      // 合并结果
      const products = [...dishes, ...setmeals];

      this.setData({
        products,
        loading: false
      });

    } catch (error) {
      console.error('加载商品失败:', error);
      this.setData({
        products: [],
        loading: false
      });
    }
  },

  // 获取菜品
  getDishes(categoryId) {
    return new Promise((resolve) => {
      const app = getApp();
      const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/';

      my.request({
        url: `${apiBaseUrl}items/user/dish/list`,
        data: categoryId >= 0 ? {
          categoryId
        } : {},
        method: 'GET',
        success: (res) => {
          if (res.data && res.data.code === 1) {
            const Dish = require('../../models/Dish');
            const dishes = res.data.data.map(item => {
              const dish = Dish.fromApi(item);
              return dish;
            });
            resolve(dishes);
          } else {
            resolve([]);
          }
        },
        fail: () => {
          resolve([]);
        }
      });
    });
  },

  // 获取套餐
  getSetmeals(categoryId) {
    return new Promise((resolve) => {
      const app = getApp();
      const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/';

      my.request({
        url: `${apiBaseUrl}items/user/setmeal/list`,
        data: categoryId >= 0 ? {
          categoryId
        } : {},
        method: 'GET',
        success: (res) => {
          if (res.data && res.data.code === 1) {
            const Setmeal = require('../../models/Setmeal');
            const setmeals = res.data.data.map(item => {
              const setmeal = Setmeal.fromApi(item);
              return setmeal;
            });
            resolve(setmeals);
          } else {
            resolve([]);
          }
        },
        fail: () => {
          resolve([]);
        }
      });
    });
  },

  // 切换分类
  switchCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    const type = e.currentTarget.dataset.type;

    // 更新选中状态
    this.setData({
      activeCategoryId: categoryId,
      searchKeyword: ''
    });

    // 1为菜品，2为套餐
    if (type === 1) {
      this.loadDishes(categoryId);
    } else if (type === 2) {
      this.loadSetmeals(categoryId);
    } else {
      this.loadProducts(categoryId);
    }
  },

  // 加载菜品
  loadDishes(categoryId) {
    const app = getApp();
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/'

    my.request({
      url: `${apiBaseUrl}items/user/dish/list`,
      data: {
        'categoryId': categoryId
      },
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const Dish = require('../../models/Dish');
          const products = res.data.data.map(item => {
            const dish = Dish.fromApi(item);
            return dish;
          });
          this.setData({
            products
          });
        } else {
          this.setData({
            products: []
          });
        }
      },
      fail: (error) => {
        my.showToast({
          type: 'fail',
          content: res.data.msg
        });
      }
    });
  },

  // 加载套餐
  loadSetmeals(categoryId) {
    const app = getApp();
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/'

    my.request({
      url: `${apiBaseUrl}items/user/setmeal/list`,
      data: {
        'categoryId': categoryId
      },
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const Setmeal = require('../../models/Setmeal');
          const products = res.data.data.map(item => {
            const setmeal = Setmeal.fromApi(item);
            return setmeal;
          });
          this.setData({
            products
          });
        }
      },
      fail: (error) => {
        my.showToast({
          type: 'fail',
          content: res.data.msg
        });
      }
    });
  },

  // 搜索输入
  onSearchConfirm(e) {
    const keyword = e.detail.value;
    console.log('搜索词：', keyword);
    this.setData({
      searchKeyword: keyword
    });

    const app = getApp();
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/'

    if (keyword.trim()) {
      my.request({
        url: `${apiBaseUrl}items/user/dish/search`,
        method: 'GET',
        data: {
          keyword: keyword
        },
        success: (res) => {
          if (res.data && res.data.code === 1) {
            const Dish = require('../../models/Dish');
            const Setmeal = require('../../models/Setmeal');

            console.log("res:",res.data.data);
            const products = res.data.data.map(item => {

              if (item.type) {
                // 如果后端返回了type字段
                const type = parseInt(item.type);
                if (type === 2) {
                  const setmeal = Setmeal.fromApi(item);
                  return setmeal;
                } else {
                  const dish = Dish.fromApi(item);
                  return dish;
                }
              }
            });

            this.setData({
              products
            });
          } else {
            this.setData({
              products: []
            });
          }
        },
        fail: (error) => {
          console.error('搜索失败:', error);
          my.showToast({
            type: 'fail',
            content: '搜索失败'
          });
        }
      });
    } else {
      // 如果搜索词为空，重新加载当前分类
      const {
        activeCategoryId
      } = this.data;
      if (activeCategoryId === 0) {
        this.loadProducts(0);
      } else {
        const currentCategory = this.data.categories.find(cat => cat.id === activeCategoryId);
        if (currentCategory && currentCategory.type === 1) {
          this.loadDishes(activeCategoryId);
        } else if (currentCategory && currentCategory.type === 2) {
          this.loadSetmeals(activeCategoryId);
        }
      }
    }
  },


  // 清空搜索
  clearSearch() {
    const {
      activeCategoryId
    } = this.data;

    this.setData({
      activeCategoryId: 0,
      searchKeyword: ''
    });

    this.loadProducts(0);
  },

  // 查看商品详情
  viewProductDetail(e) {
    const productId = e.currentTarget.dataset.id;
    const productType = e.currentTarget.dataset.type; // 1表示菜品，2表示套餐

    console.log("type:", productType);
    // 如果没有传递type，尝试从products数组中查找
    let type = productType;
    if (!type) {
      const product = this.data.products.find(p => p.id === productId);
      type = product ? product.type : 1; // 默认当作菜品处理
    }

    my.navigateTo({
      url: `/pages/product-detail/product-detail?id=${productId}&type=${type}`
    });
  },

  // 添加到购物车
  addToCart(e) {
    const productId = e.currentTarget.dataset.id;
    const product = this.data.products.find(p => p.id === productId);

    if (!product) return;

    // 获取购物车
    let cart = my.getStorageSync({
      key: 'cart'
    }).data || [];

    // 检查商品是否已在购物车
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1
      });
    }

    // 保存购物车
    my.setStorageSync({
      key: 'cart',
      data: cart
    });

    this.updateTabBarBadge();

    my.showToast({
      content: '已添加到购物车',
      type: 'success'
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