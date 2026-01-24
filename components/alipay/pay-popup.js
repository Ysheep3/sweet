Component({
  // 组件属性
  props: {
    // 是否显示收银台
    visible: false,
    // 支付金额
    amount: '0.00',
    // 商户名称
    merchantName: '糖水甜品店',
    // 账户余额
    balance: '0.00',
    // 花呗待还
    huabeiOwed: '0.00',
    // 花呗优惠标签
    huabeiPromo: '',
    // 银行名称
    // 默认支付方式: balance / huabei / bankcard
    defaultPayment: 'balance',
    // 关闭事件
    onClose: () => {},
    // 确认支付事件
    onPay: () => {},
    onCancelPay: () => {}
  },

  // 组件内部状态
  data: {
    paymentMethod: 'balance',
    paying: false,
  },

  // 组件生命周期
  didMount() {
    // 初始化默认支付方式
    this.setData({
      paymentMethod: this.props.defaultPayment || 'balance',
    });
  },

  didUpdate(prevProps) {
    // 当 visible 从 false 变为 true 时，重置状态
    if (!prevProps.visible && this.props.visible) {
      this.setData({
        paymentMethod: this.props.defaultPayment || 'balance',
        paying: false,
      });
    }
  },

  // 组件方法
  methods: {
    handleCloseWithConfirm() {
      // 正在支付中，不允许关闭
      if (this.data.paying) return;

      my.confirm({
        title: '确认取消付款？',
        content: '订单将不会被支付',
        confirmButtonText: '取消付款',
        cancelButtonText: '继续付款',

        success: (res) => {
          const app = getApp();
          // 点击「取消付款」
          if (res.confirm) {
            app.loadCart = true;
            // 通知页面层
            if (typeof this.props.onCancelPay === 'function') {
              this.props.onCancelPay();
            }
          }
          // 点击「继续付款」：什么都不做
        }
      });
    },

    // 关闭收银台
    onClose() {
      this.handleCloseWithConfirm();
      if (this.data.paying) return;

      if (typeof this.props.onClose === 'function') {
        this.props.onClose();
      }
    },

    // 选择支付方式
    selectPayment(e) {
      if (this.data.paying) return;

      const method = e.currentTarget.dataset.method;
      this.setData({
        paymentMethod: method,
      });
    },

    // 显示更多支付方式
    showMorePayment() {
      my.showToast({
        content: '更多支付方式开发中',
        duration: 2000,
      });
    },

    // 确认支付
    confirmPay() {
      if (this.data.paying) return;

      this.setData({
        paying: true
      });

      // 保存组件实例引用，确保异步回调中能正确访问
      const self = this;

      // 触发支付回调
      if (typeof this.props.onPay === 'function') {
        this.props.onPay({
          amount: this.props.amount,
          paymentMethod: this.data.paymentMethod,
          // 回调函数用于结束 loading 状态
          complete: function (success) {
            // 使用 self 引用确保 setData 能正确执行
            try {
              self.setData({
                paying: false
              });
            } catch (err) {
              console.log('[v0] complete setData error:', err);
            }
            // 不再自动关闭，由页面层控制关闭时机
          },
        });
      } else {
        // 无回调时模拟支付流程
        setTimeout(() => {
          self.setData({
            paying: false
          });
          my.showToast({
            type: 'success',
            content: '支付成功',
            duration: 2000,
          });
          self.onClose();
        }, 1500);
      }
    },
  },
});