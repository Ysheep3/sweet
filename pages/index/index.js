Page({
    data: {
      searchKeyword: '',
      activeCategoryId: 0,
      categories: [
        { id: 0, name: '全部' },
        { id: 1, name: '蛋糕' },
        { id: 2, name: '甜品' },
        { id: 3, name: '饮品' },
        { id: 4, name: '面包' },
        { id: 5, name: '小食' }
      ],
      products: [],
      filteredProducts: []
    },
  
    onLoad() {
      this.loadProducts();
      this.updateTabBarBadge();
      // 移除自动授权调用，避免重复
    },
  
    onShow() {
      this.updateTabBarBadge();
    },
  
    // 加载商品数据
    loadProducts() {
      // 模拟数据，实际应该从API获取
      const products = [
        { id: 1, name: '草莓蛋糕', price: 58, image: '/image/products/cake1.jpg', categoryId: 1, description: '新鲜草莓制作，口感香甜' },
        { id: 2, name: '巧克力蛋糕', price: 68, image: '/image/products/cake2.jpg', categoryId: 1, description: '浓郁巧克力，入口即化' },
        { id: 3, name: '提拉米苏', price: 45, image: '/image/products/tiramisu.jpg', categoryId: 2, description: '经典意式甜品' },
        { id: 4, name: '芒果布丁', price: 28, image: '/image/products/pudding.jpg', categoryId: 2, description: '新鲜芒果制作' },
        { id: 5, name: '拿铁咖啡', price: 32, image: '/image/products/coffee.jpg', categoryId: 3, description: '香醇浓郁' },
        { id: 6, name: '珍珠奶茶', price: 25, image: '/image/products/tea.jpg', categoryId: 3, description: 'Q弹珍珠，丝滑奶茶' },
        { id: 7, name: '法式面包', price: 18, image: '/image/products/bread1.jpg', categoryId: 4, description: '外酥内软' },
        { id: 8, name: '可颂', price: 22, image: '/image/products/croissant.jpg', categoryId: 4, description: '酥脆可口' },
        { id: 9, name: '鸡翅', price: 28, image: '/image/products/wings.jpg', categoryId: 5, description: '香辣鸡翅' },
        { id: 10, name: '薯条', price: 20, image: '/image/products/fries.jpg', categoryId: 5, description: '酥脆薯条' }
      ];
      
      this.setData({
        products,
        filteredProducts: products
      });
    },
  
    // 切换分类
    switchCategory(e) {
      const categoryId = e.currentTarget.dataset.id;
      this.setData({
        activeCategoryId: categoryId,
        searchKeyword: ''
      });
      this.filterProducts();
    },
  
    // 搜索输入
    onSearchInput(e) {
      this.setData({
        searchKeyword: e.detail.value
      });
      this.filterProducts();
    },
  
    // 筛选商品
    filterProducts() {
      const { products, activeCategoryId, searchKeyword } = this.data;
      let filtered = products;
  
      // 按分类筛选
      if (activeCategoryId !== 0) {
        filtered = filtered.filter(item => item.categoryId === activeCategoryId);
      }
  
      // 按关键词搜索
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword)
        );
      }
  
      this.setData({
        filteredProducts: filtered
      });
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
  
      // 从本地存储获取购物车
      let cart = my.getStorageSync({ key: 'cart' }).data || [];
      
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