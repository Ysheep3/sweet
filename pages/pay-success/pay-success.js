Page({
  data: {
    amount: '0.00',
    orderNo: '',
    shopName: '糖水甜品店',
    paymentMethod: '账户余额',
    payTime: '',
    countdown: 10
  },

  onLoad(query) {
    // 从路由参数获取订单信息
    const {
      amount,
      orderNo,
      paymentMethod
    } = query;

    // 格式化当前时间
    const now = new Date();
    const payTime = this.formatTime(now);

    this.setData({
      amount: amount || '0.00',
      orderNo: orderNo || '',
      paymentMethod: this.getPaymentMethodName(paymentMethod),
      payTime
    });

    this.timer = setInterval(() => {
      if (this.data.countdown <= 1) {
        clearInterval(this.timer);
        my.reLaunch({
          url: '/pages/order/order'
        });
      } else {
        this.setData({
          countdown: this.data.countdown - 1
        });
      }
    }, 1000);
  },

  // 格式化时间
  formatTime(date) {
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    const hour = this.padZero(date.getHours());
    const minute = this.padZero(date.getMinutes());
    const second = this.padZero(date.getSeconds());

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  },

  // 补零
  padZero(num) {
    return num < 10 ? '0' + num : String(num);
  },

  // 获取支付方式名称
  getPaymentMethodName(method) {
    const methodMap = {
      balance: '账户余额',
      huabei: '花呗',
      bankCard: '银行卡(储蓄卡尾号1234)'
    };
    return methodMap[method] || '账户余额';
  },

  copyOrderNo() {
    my.setClipboard({
      text: this.data.orderNo
    });
    my.showToast({
      content: '订单号已复制'
    });
  },

  // 查看订单
  viewOrder() {
    const app = getApp();
    app.loadCart = true;
    my.redirectTo({
      url: '/pages/order/order'
    });
  },

  // 返回首页
  backToHome() {
    my.switchTab({
      url: '/pages/index/index'
    });
  }
});