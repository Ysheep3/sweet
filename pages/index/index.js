Page({
  data: {
    searchKeyword: '',
    activeCategoryId: 0,
    categories: [],
    products: []
  },

  onLoad() {
    this.loadCategories();
    this.loadProducts(0); // 0表示全部
    this.updateTabBarBadge();
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

  // 加载商品数据
  loadProducts(categoryId) {
    const app = getApp();
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/'

    my.request({
      url: `${apiBaseUrl}items/user/dish/all`,
      data: {
        'categoryId': categoryId
      },
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const Dish = require('../../models/Dish');
          const products = res.data.data.map(item => Dish.fromApi(item));
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
        })
      }
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
          const products = res.data.data.map(item => Dish.fromApi(item));
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
          const products = res.data.data.map(item => Setmeal.fromApi(item));
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
            const products = res.data.data.map(item => Dish.fromApi(item));
            this.setData({
              products
            });
          } else {
            this.setData({
              products: []
            });
          }
        },
        fail: () => {
          my.showToast({
            type: 'fail',
            content: res.data.msg
          });
        },
      });
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
    my.navigateTo({
      url: `/pages/product-detail/product-detail?id=${productId}`
    });
  },

  // 添加到购物车
  addToCart(e) {
    const productId = e.currentTarget.dataset.id;
    const product = this.data.products.find(p => p.id === productId);

    if (!product) return;


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