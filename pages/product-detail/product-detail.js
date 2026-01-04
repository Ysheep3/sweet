Page({
  data: {
    product: {},
    sweet: '',
    temperature: '',
    isFavorite: false
  },

  onLoad(query) {
    const id = Number(query.id || 0);
    const type = Number(query.type || 1); // 1表示菜品，2表示套餐
    
    if (!id) {
      my.showToast({ content: '商品不存在', type: 'fail' });
      return;
    }
    
    this.initProduct(id, type);
  },

  // 初始化商品数据
  initProduct(id, type) {
    const app = getApp();
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/';
    
    // 根据type判断是菜品还是套餐
    let url = '';
    let Model = null;
    
    if (type === 2) {
      // 套餐
      url = `${apiBaseUrl}items/user/setmeal/${id}`;
      Model = require('../../models/Setmeal');
    } else {
      // 菜品（默认为1）
      url = `${apiBaseUrl}items/user/dish/${id}`;
      Model = require('../../models/Dish');
    }
    
    my.request({
      url: url,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const product = Model.fromApi(res.data.data);
          
          // 获取收藏列表
          const favorites = my.getStorageSync({ key: 'favorites' }).data || [];
          const isFavorite = favorites.some(item => item.id === id);
          
          // 设置默认的甜度和温度（如果存在）
          const sweet = product.sweetOptions && product.sweetOptions.length > 0 
            ? product.sweetOptions[0] 
            : '';
          const temperature = product.tempOptions && product.tempOptions.length > 0 
            ? product.tempOptions[0] 
            : '';
          
          this.setData({
            product,
            sweet,
            temperature,
            isFavorite
          });
        } else {
          my.showToast({ 
            content: res.data.msg || '商品不存在', 
            type: 'fail' 
          });
        }
      },
      fail: (error) => {
        console.error('获取商品详情失败:', error);
        my.showToast({ 
          content: '获取商品详情失败', 
          type: 'fail' 
        });
      }
    });
  },

  onSweetChange(e) {
    this.setData({ sweet: e.currentTarget.dataset.value });
  },

  onTempChange(e) {
    this.setData({ temperature: e.currentTarget.dataset.value });
  },

  // 收藏/取消收藏
  toggleFavorite() {
    const { product, isFavorite } = this.data;
    let favorites = my.getStorageSync({ key: 'favorites' }).data || [];

    if (isFavorite) {
      favorites = favorites.filter(item => item.id !== product.id);
      my.showToast({ content: '已取消收藏', type: 'none' });
    } else {
      favorites.push(product);
      my.showToast({ content: '已加入收藏', type: 'success' });
    }

    my.setStorageSync({ key: 'favorites', data: favorites });
    this.setData({ isFavorite: !isFavorite });
  },

  // 加入购物车
  addToCart() {
    const { product, sweet, temperature } = this.data;
    if (!product.id) return;

    let cart = my.getStorageSync({ key: 'cart' }).data || [];
    const keyMatcher = item =>
      item.id === product.id &&
      item.sweet === sweet &&
      item.temperature === temperature;

    const existingItem = cart.find(keyMatcher);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...product,
        sweet,
        temperature,
        quantity: 1
      });
    }

    my.setStorageSync({ key: 'cart', data: cart });

    my.showToast({
      content: '已加入购物车',
      type: 'success'
    });
  }
});


