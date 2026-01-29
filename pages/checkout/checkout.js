Page({
  data: {
    // 订单类型：0 堂食, 1 外送
    orderType: 1,
    orderNo: '',
    tableNo: '',
    selectedAddress: null,
    cartItems: [],
    totalCount: 0,
    goodsAmount: 0,
    deliveryFee: 3,
    discountAmount: 0,
    payAmount: 0,
    remark: '',
    selectedCoupon: null,
    availableList: [],
    availableCount: 0,
    showCouponPopup: false,
    pendingCouponId: null,

    // ========== 收银台相关 ==========
    // 是否显示收银台
    showCashier: false,
    // 花呗优惠
    huabeiPromo: '分期免息',
  },

  onLoad(options = {}) {
    const { orderNo } = options;   // ✅ 在函数最外层解构
  
    if (orderNo) {
      this.setData({ orderNo });
    }
  
    // 统一入口：有 orderNo → 查订单；没有 → 查购物车
    this.loadCheckoutData(orderNo);
  
    this.loadCoupons();
    this.loadDefaultAddress();
  },
  

  onShow() {
    const selectedRes = my.getStorageSync({
      key: 'selectedAddress'
    });
    console.log("selectedRes: ", selectedRes);
    if (selectedRes && selectedRes.data) {
      this.setData({
        selectedAddress: selectedRes.data
      });
      return;
    }

    this.loadCartItems();
    // 页面显示时重新计算价格
    this.calculatePrice();
  },

  // 切换订单类型
  switchOrderType(e) {
    const type = Number(e.currentTarget.dataset.type);
    this.setData({
      orderType: type
    });
    // 重新计算价格（堂食无配送费）
    this.calculatePrice();
  },

  // 桌号输入
  onTableInput(e) {
    this.setData({
      tableNo: e.detail.value
    });
  },

  // 加载购物车数据
  loadCheckoutData(orderNo) {
    const app = getApp();
    const apiBaseUrl = app.globalData.apiBaseUrl || 'http://localhost:8080/';

    // 👉 有订单号：走订单详情（继续支付）
    if (orderNo) {
      console.log('load order detail:', orderNo);

      my.request({
        url: `${apiBaseUrl}order/user/detail/${orderNo}`,
        method: 'GET',
        headers: {
          authentication: app.globalData.authentication
        },
        success: (res) => {
          if (res.data && res.data.code === 1) {
            const cartItems = res.data.data.orderDetails || [];
            this.processCartItems(cartItems);
          } else {
            my.showToast({
              type: 'fail',
              content: '获取订单详情失败'
            });
          }
        },
        fail: () => {
          my.showToast({
            type: 'fail',
            content: '网络异常'
          });
        }
      });

      return;
    }

    // 👉 没订单号：走购物车（新下单）
    my.request({
      url: apiBaseUrl + 'shopping-cart/list',
      method: 'GET',
      headers: {
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const cartItems = res.data.data || [];
          this.processCartItems(cartItems);
        } else {
          my.showToast({
            type: 'fail',
            content: '获取购物车失败'
          });
        }
      },
      fail: () => {
        my.showToast({
          type: 'fail',
          content: '网络异常'
        });
      }
    });
  },

  processCartItems(cartItems = []) {
    let totalCount = 0;
    let goodsAmount = 0;

    cartItems.forEach(item => {
      totalCount += item.number || 0;
      goodsAmount += (item.amount || 0) * (item.number || 0);
    });

    this.setData({
      cartItems,
      totalCount,
      goodsAmount: goodsAmount.toFixed(2)
    }, () => {
      this.calculatePrice();
    });
  },


  // 加载可用优惠券
  loadCoupons() {
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"
    //const status = this.data.currentTab === 3 ? 0 : this.data.currentTab;
    const status = 0;

    my.request({
      url: `${apiBaseUrl}user-coupon/user/list/${status}`,
      method: 'GET',
      headers: {
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          console.log("availableList", res.data.data);
          const availableList = res.data.data || [];
          const goodsAmount = this.data.goodsAmount

          const availableCount = this.calcAvailableCount(goodsAmount, availableList)

          this.setData({
            availableList,
            availableCount
          })
        } else {
          my.showToast({
            type: 'fail',
            content: res.data.msg
          })
        }
      },
      fail: () => {
        my.showToast({
          type: 'fail',
          content: "网络异常"
        })
      }
    })
  },

  // 加载默认地址
  loadDefaultAddress() {
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    my.request({
      url: `${apiBaseUrl}address/default`,
      method: 'GET',
      headers: {
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          console.log(res.data.data);
          const defaultAddress = res.data.data;
          this.setData({
            selectedAddress: defaultAddress
          })
        } else {
          my.showToast({
            type: 'fail',
            content: res.data.msg
          })
        }
      },
      fail: () => {
        my.showToast({
          type: 'fail',
          content: '网络异常'
        })
      }
    })
  },

  // 选择地址
  selectAddress() {
    my.navigateTo({
      url: '/pages/address/address?select=1'
    });
  },

  // 计算当前金额下可用优惠券数量
  calcAvailableCount(goodsAmount, couponList) {
    return couponList.filter(item => {
      // 无门槛券，永远可用
      if (item.type === 3) return true

      // 满减券 / 折扣券，需要满足金额
      return parseFloat(goodsAmount) >= item.conditionAmount
    }).length
  },

  // 计算价格
  calculatePrice() {
    const {
      goodsAmount,
      deliveryFee,
      selectedCoupon,
      orderType,
      availableList
    } = this.data;

    let discount = 0;
    const goodsPrice = parseFloat(goodsAmount);

    // 计算优惠金额
    if (selectedCoupon) {
      const {
        type,
        conditionAmount,
        reduceAmount,
        discount: discountRate
      } = selectedCoupon;

      // 是否满足使用条件（无门槛券默认满足）
      const canUse =
        type === 3 || goodsPrice >= conditionAmount;

      if (canUse) {
        // 满减券
        if (type === 1) {
          discount = reduceAmount;
        }

        // 折扣券
        if (type === 2) {
          const afterDiscount = goodsPrice * discountRate;
          console.log(afterDiscount, goodsPrice, discountRate);
          discount = goodsPrice - afterDiscount;
        }

        // 无门槛券
        if (type === 3) {
          discount = reduceAmount;
        }
      }
    }

    // 堂食无配送费
    const actualDeliveryFee = orderType === 1 ? deliveryFee : 0;

    const payAmount = (
      goodsPrice +
      actualDeliveryFee -
      discount
    ).toFixed(2);

    // 同步更新可用优惠券数量（修复你刚才那个 bug）
    const availableCount = this.calcAvailableCount(
      goodsPrice,
      availableList
    );

    this.setData({
      discountAmount: discount.toFixed(2),
      payAmount: Math.max(0, payAmount),
      availableCount
    });
  },


  // 打开优惠券选择
  chooseCoupon() {
    this.setData({
      showCouponPopup: true,
      pendingCouponId: this.data.selectedCoupon ? this.data.selectedCoupon.id : null
    });
  },

  // 关闭优惠券弹窗
  closeCouponPopup() {
    this.setData({
      showCouponPopup: false
    });
  },

  // 选择优惠券
  selectCoupon(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      pendingCouponId: id
    });
  },

  // 确认使用优惠券
  confirmCoupon() {
    const {
      pendingCouponId,
      availableList
    } = this.data;
    const coupon = availableList.find(c => c.id == pendingCouponId);

    if (
      coupon &&
      coupon.type !== 3 &&
      parseFloat(this.data.goodsAmount) < coupon.conditionAmount
    ) {
      my.showToast({
        type: 'fail',
        content: '该优惠券未满足使用条件'
      })
      return
    }


    this.setData({
      selectedCoupon: coupon || null,
      showCouponPopup: false
    });

    this.calculatePrice();
  },

  // 不使用优惠券
  clearCoupon() {
    this.setData({
      selectedCoupon: null,
      pendingCouponId: null,
      showCouponPopup: false
    });
    this.calculatePrice();
  },

  // 备注输入
  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    });
  },

  // 提交订单
  submitOrder() {
    const {
      orderType,
      selectedAddress,
      tableNo,
      cartItems,
      payAmount
    } = this.data;

    // 校验
    if (cartItems.length === 0) {
      my.showToast({
        content: '购物车为空',
        type: 'fail'
      });
      return;
    }

    if (orderType === 1 && !selectedAddress) {
      my.showToast({
        content: '请选择收货地址',
        type: 'fail'
      });
      return;
    }

    if (orderType === 0 && !tableNo.trim()) {
      my.showToast({
        content: '请输入桌号',
        type: 'fail'
      });
      return;
    }

    // 组装订单数据
    const orderData = {
      orderType,
      tableNo: orderType === 0 ? tableNo : '',
      addressId: orderType === 1 ? selectedAddress.id : null,
      cartItems: cartItems,
      amount: payAmount,
      remark: this.data.remark,
      userCoupon: this.data.selectedCoupon,
      consignee: orderType === 1 ? selectedAddress.consignee : null,
      phone: orderType === 1 ? selectedAddress.phone : null,
      address: orderType === 1 ? selectedAddress.province +
        selectedAddress.city +
        selectedAddress.district +
        selectedAddress.detailAddress : null,

    };

    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    my.request({
      url: `${apiBaseUrl}order/user/submit`,
      method: 'POST',
      data: orderData,
      headers: {
        'Content-Type': 'application/json',
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {

          this.data.orderNo = res.data.data.orderNo
          this.data.payAmount = res.data.data.orderAmount

          my.showLoading({
            content: '正在拉起支付...'
          })

          // 打开收银台弹层
          setTimeout(() => {
            my.hideLoading();

            this.setData({
              showCashier: true
            });
          }, 1500);

        } else {
          my.showToast({
            content: res.data.msg || '提交订单失败',
            type: 'fail'
          })
        }
      },
      fail: () => {
        my.showToast({
          content: '网络异常',
          type: 'fail'
        })
      }
    })
  },

  // ========== 关闭收银台 ==========
  handleCancelPay() {
    // 1️⃣ 先关闭收银台
    this.setData({
      showCashier: false
    });

    // 2️⃣ 再跳转订单页，携带 status=1
    setTimeout(() => {
      my.redirectTo({
        url: '/pages/order/order?status=1'
      });
    }, 0);
  },
  // ========== 处理支付 ==========
  handlePay(e) {
    const {
      amount,
      paymentMethod,
      complete
    } = e;
    const {
      payAmount,
      orderNo
    } = this.data;

    // 这里调用实际的订单提交和支付接口
    my.showLoading({
      content: '支付中...'
    });

    const app = getApp();
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8080/';

    const orderPayData = {
      orderNo: orderNo,
      amount: payAmount,
    };

    setTimeout(() => {
      my.hideLoading();
      my.request({
        url: `${apiBaseUrl}order/user/pay`,
        method: 'POST',
        data: orderPayData,
        headers: {
          'Content-Type': 'application/json',
          authentication: app.globalData.authentication,
        },
        success: (res) => {

          if (res.data && res.data.code === 1) {
            // 通知组件支付完成
            complete(true);

            // 关闭收银台
            this.setData({
              showCashier: false
            });

            // 跳转到支付成功页面
            my.redirectTo({
              url: `/pages/pay-success/pay-success?amount=${payAmount}&orderNo=${orderNo}&paymentMethod=${paymentMethod}`,
            });
          } else {
            my.showToast({
              type: 'fail',
              content: res.data.msg || '支付失败，请重试',
              duration: 2000,
            });
            complete(false);
          }
        },
        fail: () => {
          my.hideLoading();
          my.showToast({
            type: 'fail',
            content: '网络异常',
            duration: 2000,
          });
          complete(false);
        },
      });
    }, 2000);
  }
})