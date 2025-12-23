Page({
    data: {
      cartItems: [],
      totalPrice: 0,
      isAllSelected: true
    },
  
    onLoad() {
      this.loadCart();
    },
  
    onShow() {
      this.loadCart();
    },
  
    // 加载购物车
    loadCart() {
      const cart = my.getStorageSync({ key: 'cart' }).data || [];

      // 默认勾选全部商品（如果之前没有 selected 字段）
      const normalizedCart = cart.map(item => ({
        ...item,
        selected: typeof item.selected === 'boolean' ? item.selected : true
      }));

      const isAllSelected =
        normalizedCart.length > 0 &&
        normalizedCart.every(item => item.selected);

      const totalPrice = normalizedCart.reduce(
        (sum, item) =>
          item.selected ? sum + item.price * item.quantity : sum,
        0
      );
      
      this.setData({
        cartItems: normalizedCart,
        totalPrice: totalPrice.toFixed(2),
        isAllSelected
      });
      
      // 更新底部导航栏徽章
      this.updateTabBarBadge();
    },
  
    // 减少数量
    decreaseQuantity(e) {
      const id = e.currentTarget.dataset.id;
      let cart = [...this.data.cartItems];
      const item = cart.find(i => i.id === id);
      
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      } else if (item && item.quantity === 1) {
        cart = cart.filter(i => i.id !== id);
      }
  
      this.saveCart(cart);
      this.loadCart();
    },
  
    // 增加数量
    increaseQuantity(e) {
      const id = e.currentTarget.dataset.id;
      let cart = [...this.data.cartItems];
      const item = cart.find(i => i.id === id);
      
      if (item) {
        item.quantity += 1;
      }
  
      this.saveCart(cart);
      this.loadCart();
    },
  
    // 删除商品
    deleteItem(e) {
      const id = e.currentTarget.dataset.id;
      my.confirm({
        content: '确定删除该商品吗？',
        success: (res) => {
          if (res.confirm) {
            let cart = this.data.cartItems.filter(item => item.id !== id);
            this.saveCart(cart);
            this.loadCart();
          }
        }
      });
    },
  
    // 保存购物车
    saveCart(cart) {
      my.setStorageSync({
        key: 'cart',
        data: cart
      });
    },

    // 勾选/取消勾选单个商品
    toggleItemSelect(e) {
      const id = e.currentTarget.dataset.id;
      const cart = this.data.cartItems.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      );
      this.saveCart(cart);
      this.loadCart();
    },

    // 全选/取消全选
    toggleSelectAll() {
      const next = !this.data.isAllSelected;
      const cart = this.data.cartItems.map(item => ({
        ...item,
        selected: next
      }));
      this.saveCart(cart);
      this.loadCart();
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