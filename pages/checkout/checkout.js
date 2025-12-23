Page({
  data: {
    cartItems: [],
    totalCount: 0,
    goodsAmount: '0.00',
    deliveryFee: '3.00',
    discountAmount: '0.00',
    payAmount: '0.00',
    selectedAddress: null,
    couponList: [],
    availableCoupons: [],
    selectedCoupon: null,
    pendingCouponId: null,
    availableCouponCount: 0,
    showCouponPopup: false,
    remark: ''
  },

  onLoad() {
    this.loadCart();
    this.loadAddress();
    this.loadCoupons();
    this.calcAmount();
  },

  onShow() {
    this.loadCart();
    this.loadAddress();
    this.loadCoupons();
    this.calcAmount();
  },

  // 加载购物车
  loadCart() {
    // 优先使用结算页专用的 checkoutItems（来自购物车勾选）
    const checkoutItems =
      my.getStorageSync({ key: 'checkoutItems' }).data || null;
    const cart = checkoutItems || my.getStorageSync({ key: 'cart' }).data || [];
    const goodsAmount = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    this.setData({
      cartItems: cart,
      goodsAmount: goodsAmount.toFixed(2),
      totalCount
    });
  },

  // 加载地址
  loadAddress() {
    const address = my.getStorageSync({ key: 'selectedAddress' }).data;
    this.setData({ selectedAddress: address || null });
  },

  // 加载优惠券（与优惠券管理页面共用同一份数据）
  loadCoupons() {
    let coupons = my.getStorageSync({ key: 'coupons' }).data || [];
    const availableCoupons = coupons.filter(c => c.status === 'available');
    const availableCouponCount = availableCoupons.length;

    // 当前已选优惠券 id
    const selectedCouponId =
      my.getStorageSync({ key: 'selectedCouponId' }).data || null;
    const selectedCoupon =
      coupons.find(c => c.id === selectedCouponId && c.status === 'available') ||
      null;

    this.setData({
      couponList: coupons,
      availableCouponCount,
      availableCoupons,
      selectedCoupon,
      pendingCouponId: selectedCoupon ? selectedCoupon.id : null
    });
  },

  // 选择地址
  selectAddress() {
    my.navigateTo({
      url: '/pages/address/address?select=true'
    });
  },

  // 打开优惠券选择弹窗
  chooseCoupon() {
    if (this.data.availableCoupons.length === 0) {
      my.showToast({
        content: '暂无可用优惠券',
        type: 'none'
      });
      return;
    }

    this.setData({
      showCouponPopup: true,
      pendingCouponId: this.data.selectedCoupon
        ? this.data.selectedCoupon.id
        : null
    });
  },

  // 关闭优惠券弹窗
  closeCouponPopup() {
    this.setData({ showCouponPopup: false });
  },

  // 选择某张优惠券
  selectCoupon(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ pendingCouponId: Number(id) });
  },

  // 不使用优惠券
  clearCoupon() {
    my.removeStorageSync({ key: 'selectedCouponId' });
    this.setData(
      {
        selectedCoupon: null,
        pendingCouponId: null,
        showCouponPopup: false
      },
      () => {
        this.calcAmount();
      }
    );
  },

  // 确认使用优惠券
  confirmCoupon() {
    const coupon =
      this.data.availableCoupons.find(c => c.id === this.data.pendingCouponId) ||
      null;

    if (coupon) {
      my.setStorageSync({ key: 'selectedCouponId', data: coupon.id });
    } else {
      my.removeStorageSync({ key: 'selectedCouponId' });
    }

    this.setData(
      {
        selectedCoupon: coupon,
        showCouponPopup: false
      },
      () => {
        this.calcAmount();
      }
    );
  },

  // 备注输入
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  // 计算金额
  calcAmount() {
    const goodsAmount = Number(this.data.goodsAmount) || 0;
    const deliveryFee = Number(this.data.deliveryFee) || 0;
    let discountAmount = 0;

    if (this.data.selectedCoupon) {
      discountAmount = this.data.selectedCoupon.amount || 0;
      if (discountAmount > goodsAmount) {
        discountAmount = goodsAmount;
      }
    }

    const payAmount = goodsAmount + deliveryFee - discountAmount;

    this.setData({
      discountAmount: discountAmount.toFixed(2),
      payAmount: payAmount.toFixed(2)
    });
  },

  // 提交订单
  submitOrder() {
    if (this.data.cartItems.length === 0) {
      my.showToast({
        content: '购物车为空',
        type: 'fail'
      });
      return;
    }

    if (!this.data.selectedAddress) {
      my.showToast({
        content: '请选择收货地址',
        type: 'fail'
      });
      return;
    }

    // 客户位置由后端通过地理编码API获取，前端只保存地址文本
    const customerAddress = this.data.selectedAddress ? 
      `${this.data.selectedAddress.province}${this.data.selectedAddress.city}${this.data.selectedAddress.district}${this.data.selectedAddress.detail}` : '';

    const order = {
      id: Date.now(),
      items: this.data.cartItems,
      address: this.data.selectedAddress,
      // customerLocation 由后端处理，前端不设置
      customerName: this.data.selectedAddress ? this.data.selectedAddress.name : '',
      customerPhone: this.data.selectedAddress ? this.data.selectedAddress.phone : '',
      customerAddress: customerAddress,
      goodsAmount: this.data.goodsAmount,
      deliveryFee: this.data.deliveryFee,
      discountAmount: this.data.discountAmount,
      payAmount: this.data.payAmount,
      couponId: this.data.selectedCoupon ? this.data.selectedCoupon.id : null,
      remark: this.data.remark,
      status: 'pending',
      createTime: new Date().toISOString()
    };

    let orders = my.getStorageSync({ key: 'orders' }).data || [];
    orders.unshift(order);
    my.setStorageSync({ key: 'orders', data: orders });

    // 同时将订单添加到骑手订单列表（供骑手端使用）
    // 注意：customerLocation 应该由后端通过地理编码API获取后返回
    let riderOrders = my.getStorageSync({ key: 'riderOrders' }).data || [];
    const riderOrder = {
      id: 'D' + order.id,
      status: 'pending',
      statusText: '待接单',
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      customerLocation: null, // 由后端填充，前端不设置
      amount: order.payAmount,
      createTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      shopLocation: { latitude: 23.128, longitude: 113.262 } // 店铺位置（固定）
    };
    riderOrders.unshift(riderOrder);
    my.setStorageSync({ key: 'riderOrders', data: riderOrders });

    // 清空购物车与已选优惠券、结算临时数据
    my.removeStorageSync({ key: 'cart' });
    my.removeStorageSync({ key: 'selectedCouponId' });
    my.removeStorageSync({ key: 'checkoutItems' });

    // 更新 tabBar 徽章
    const app = getApp();
    if (app && app.updateTabBarBadge) {
      app.updateTabBarBadge();
    }

    my.showToast({
      content: '订单提交成功',
      type: 'success'
    });

    setTimeout(() => {
      my.navigateTo({
        url: '/pages/order/order'
      });
    }, 1500);
  }
});


