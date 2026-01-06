Page({
  data: {
    product: {},
    sweet: '',
    temperature: '',
    isFavorite: false,
    loading: true
  },

  onLoad(query) {
    console.log('详情页接收参数:', query);

    const id = Number(query.id || 0);
    const type = Number(query.type || 1); // 默认为菜品

    if (!id) {
      my.showToast({
        content: '商品不存在',
        type: 'fail'
      });
      my.navigateBack();
      return;
    }

    this.setData({
      loading: true
    });

    // 并行加载商品详情和收藏状态
    Promise.all([
      this.loadProductDetail(id, type),
      this.checkFavoriteStatus(id, type)
    ]).finally(() => {
      this.setData({
        loading: false
      });
    });
  },

  // 加载商品详情
  loadProductDetail(id, type) {
    return new Promise((resolve, reject) => {
      const app = getApp();
      const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/';

      // 根据商品类型选择API
      let apiUrl;
      if (type === 2) {
        // 套餐详情接口
        apiUrl = `${apiBaseUrl}items/user/setmeal/${id}`;
      } else {
        // 菜品详情接口
        apiUrl = `${apiBaseUrl}items/user/dish/${id}`;
      }

      console.log('请求详情URL:', apiUrl);

      if (!app.globalData.authentication) {
        my.showToast("没有token,请求失败");
      }

      my.request({
        url: apiUrl,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authentication: app.globalData.authentication
        },
        success: (res) => {
          console.log('详情接口响应:', res);

          if (res.data && res.data.code === 1) {
            this.handleProductData(res.data.data, id, type);
            resolve();
          } else {
            // 详情接口失败，尝试从列表接口获取
            console.log('详情接口返回失败，尝试列表接口');
            this.loadProductFromList(id, type).then(resolve).catch(reject);
          }
        },
        fail: (error) => {
          console.error('详情接口请求失败:', error);
          // 详情接口失败，尝试从列表接口获取
          this.toLogin();
        }
      });
    });
  },

  toLogin() {
    my.confirm({
      title: '登录账号',
      content: '请登录账号',
      confirmButtonText: '登录',
      cancelButtonText: '取消',
      success: (res) => {
        if (res.confirm) {
          my.reLaunch({
            url: '/pages/role-select/roleSelect'
          });
        } else {
          my.switchTab({
            url: '/pages/index/index'
          });
        }
      }
    });
  },

  // 检查收藏状态
  checkFavoriteStatus(id, type) {
    return new Promise((resolve) => {
      const app = getApp();
      const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/';

      if (!app.globalData.authentication) {
        my.showToast("没有token,请求失败");
      }

      my.request({
        url: `${apiBaseUrl}items/user/favorite/check`,
        method: 'POST',
        data: {
          'productId': id,
          'type': type
        },
        headers: {
          'Content-Type': 'application/json',
          authentication: app.globalData.authentication
        },
        success: (res) => {
          if (res.data && res.data.code === 1) {
            this.setData({
              isFavorite: res.data.data
            });
          } else {
            console.log('获取收藏状态失败:', res.data.msg);
          }
          resolve();
        },
        fail: (error) => {
          console.error('请求收藏状态失败:', error);
          resolve();
        }
      });
    });
  },

  // 处理商品数据
  handleProductData(data, id, type) {
    console.log('处理商品数据:', data);

    let product;

    if (type === 2) {
      // 套餐
      const Setmeal = require('../../models/Setmeal');
      product = Setmeal.fromApi(data);
    } else {
      // 菜品
      const Dish = require('../../models/Dish');
      product = Dish.fromApi(data);
    }

    // 设置默认甜度和温度
    let sweet = '';
    let temperature = '';

    if (product.sweetOptions && product.sweetOptions.length > 0) {
      sweet = product.sweetOptions[0];
    }

    if (product.tempOptions && product.tempOptions.length > 0) {
      temperature = product.tempOptions[0];
    }

    this.setData({
      product,
      sweet,
      temperature
    });

    console.log('商品详情加载完成:', product);
  },

  onSweetChange(e) {
    this.setData({
      sweet: e.currentTarget.dataset.value
    });
  },

  onTempChange(e) {
    this.setData({
      temperature: e.currentTarget.dataset.value
    });
  },

  // 收藏/取消收藏
  toggleFavorite() {
    const {
      product,
      isFavorite
    } = this.data;

    const app = getApp();
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/';

    // 根据当前状态选择接口
    const apiUrl = isFavorite ?
      `${apiBaseUrl}items/user/favorite/delete` :
      `${apiBaseUrl}items/user/favorite/add`;

    if (!app.globalData.authentication) {
      my.showToast("没有token,请求失败");
    }

    my.request({
      url: apiUrl,
      method: 'POST',
      data: {
        productId: product.id,
        type: product.type,
        name: product.name,
        price: product.price
      },
      headers: {
        'Content-Type': 'application/json',
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const newStatus = !isFavorite;
          this.setData({
            isFavorite: newStatus
          });

          my.showToast({
            content: newStatus ? '已加入收藏' : '已取消收藏',
            type: newStatus ? 'success' : 'none'
          });
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
  },

  // 加入购物车
  addToCart() {
    const {
      product,
      sweet,
      temperature,
      productType
    } = this.data;

    if (!product || !product.id) {
      my.showToast({
        content: '商品信息不完整',
        type: 'fail'
      });
      return;
    }

    const app = getApp();
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/';

    // 构建购物车数据
    const cartData = {
      productId: product.id,
      productType: productType,
      quantity: 1
    };

    // 如果是菜品，添加甜度和温度
    if (productType === 1) {
      cartData.sweet = sweet;
      cartData.temperature = temperature;
    }

    my.request({
      url: `${apiBaseUrl}cart/add`,
      method: 'POST',
      data: cartData,
      success: (res) => {
        if (res.data && res.data.code === 1) {
          // 更新底部导航栏购物车徽章
          this.updateCartBadge();

          my.showToast({
            content: '已加入购物车',
            type: 'success'
          });
        } else {
          my.showToast({
            content: res.data.msg || '加入购物车失败',
            type: 'fail'
          });
        }
      },
      fail: (error) => {
        console.error('加入购物车失败:', error);
        my.showToast({
          content: '网络错误，请重试',
          type: 'fail'
        });
      }
    });
  },

  // 更新购物车徽章
  updateCartBadge() {
    const app = getApp();
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/';

    my.request({
      url: `${apiBaseUrl}cart/count`,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const cartCount = res.data.data || 0;

          // 更新购物车徽章
          if (cartCount > 0) {
            my.setTabBarBadge({
              index: 2, // 假设购物车在第三个tab
              text: cartCount.toString()
            });
          } else {
            my.removeTabBarBadge({
              index: 2
            });
          }
        }
      },
      fail: (error) => {
        console.error('获取购物车数量失败:', error);
      }
    });
  }
});