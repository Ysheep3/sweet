Page({
  data: {
    activeTab: 0,
    /** 1待付款 2待接单 3已接单 4派送中 5已完成 6已取消 */
    tabs: [{
        id: 0,
        name: "全部",
        statusList: []
      },
      {
        id: 1,
        name: "待支付",
        statusList: [1]
      },
      {
        id: 2,
        name: "进行中",
        statusList: [2, 3, 4]
      },
      {
        id: 3,
        name: "已完成/已取消",
        statusList: [5, 6]
      },
    ],
    orders: [],
  },

  onLoad(options) {
    if (options && options.status) {
      const status = Number(options.status)
  
      // 根据 status 找到对应的 tab
      const tabs = this.data.tabs
      const targetTabIndex = tabs.findIndex(tab =>
        tab.statusList.includes(status)
      )
  
      // 找到就切换到对应 tab
      if (targetTabIndex !== -1) {
        this.setData({
          activeTab: targetTabIndex
        }, () => {
          this.loadOrders()
        })
        return
      }
    }
    this.loadOrders()
  },

  onShow() {
    this.loadOrders()
  },

  onPullDownRefresh(){
    this.loadOrders();
  },

  // 加载订单
  loadOrders() {
    const {
      tabs,
      activeTab
    } = this.data
    const statusList = tabs[activeTab].statusList

    // my.showLoading({
    //   content: '加载中...'
    // })
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    my.request({
      url: `${apiBaseUrl}order/user/listByStatus`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authentication: app.globalData.authentication,
      },
      data: statusList, // [] 或 [1] / [2,3,4] / [5,6]
  
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const orders = res.data.data || []
          console.log("orders:", orders);
          this.setData({
            orders: orders,
          })
        } else {
          my.showToast({
            content: res.data.msg || '获取订单失败',
            type: 'none',
          })
        }
      },
      fail: () => {
        my.showToast({
          content: '网络异常',
          type: 'none',
        })
      },
      complete: () => {
        //my.hideLoading()
        my.stopPullDownRefresh();
      },
    })
  },

  // 切换标签
  switchTab(e) {
    const tabId = e.currentTarget.dataset.id
    this.setData({
      activeTab: tabId
    }, () => {
      this.loadOrders();
    });
  },

  // 继续支付
  continuePay(e) {
    const orderNo = e.currentTarget.dataset.orderNo;
  
    my.showLoading({
      content: "处理中..."
    });
  
    setTimeout(() => {
      my.hideLoading();
  
      // 👉 跳转到结算页面，携带订单号
      my.navigateTo({
        url: `/pages/checkout/checkout?orderNo=${orderNo}`
      });
  
    }, 300);
  },

  // 催单
  urgeOrder(e) {
    const orderId = e.currentTarget.dataset.id
    my.showToast({
      content: "催单请求已发送",
      type: "success",
    })
  },
})