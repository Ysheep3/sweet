Page({
  data: {
    product: {},
    sweet: '',
    temperature: '',
    isFavorite: false
  },

  onLoad(query) {
    const id = Number(query.id || 0);
    if (!id) {
      my.showToast({ content: '商品不存在', type: 'fail' });
      return;
    }
    this.initProduct(id);
  },

  // 初始化商品数据
  initProduct(id) {
    // TODO: 从后端API获取商品详情数据
    // 示例：
    // my.request({
    //   url: `https://your-api.com/api/dish/${id}`,
    //   method: 'GET',
    //   success: (res) => {
    //     const Dish = require('../../models/Dish');
    //     const product = Dish.fromApi(res.data);
    //     const favorites = my.getStorageSync({ key: 'favorites' }).data || [];
    //     const isFavorite = favorites.some(item => item.id === id);
    //     this.setData({
    //       product,
    //       sweet: product.sweetOptions ? product.sweetOptions[0] : '',
    //       temperature: product.tempOptions ? product.tempOptions[0] : '',
    //       isFavorite
    //     });
    //   },
    //   fail: () => {
    //     my.showToast({ content: '商品不存在', type: 'fail' });
    //   }
    // });
    
    my.showToast({ content: '商品不存在', type: 'fail' });
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


