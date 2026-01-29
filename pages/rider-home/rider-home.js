Page({
  data: {
    riderInfo: {},
    activeTab: 3, // 3骑手待接单 | 4派送中 | 5完成
    badge: {
      3: 0, // 待接单
      4: 0, // 配送中
      5: 0  // 已完成
    },
    orders: [],
    todayFinished: 0
  },

  onLoad() {
    this.loadRiderInfo();
    this.loadOrders(3);

    this.countOrder();
  },

  onShow() {
    const app = getApp()

    if (app.globalData.riderTab) {
      this.setData({
        activeTab: app.globalData.riderTab
      })

      this.loadOrders(app.globalData.riderTab);
      this.countOrder();

      // 用完就清，避免下次误触发
      app.globalData.riderTab = null;
    }
  },

  loadRiderInfo() {
    const app = getApp();
    const rider = app.globalData.riderInfo
    console.log("rider:", rider);

    this.setData({
      riderInfo: {
        name: rider.name,
        username: rider.username,
        avatar: rider.avatar,
      }
    });
  },

  countOrder() {
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    my.request({
      url: `${apiBaseUrl}order/rider`,
      method: 'GET',
      headers: {
        riderToken: app.globalData.riderToken
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          const data = res.data.data;
          console.log(res.data.data);
          this.setData({
            todayFinished: data.todayFinished,
            badge: {
              3: data.waitCount,
              4: data.deliveryCount,
              5: data.completedCount
            },
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

  // 从服务端加载骑手订单数据
  loadOrders(status) {
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    my.request({
      url: `${apiBaseUrl}order/rider/${status}`,
      method: 'GET',
      headers: {
        riderToken: app.globalData.riderToken
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          console.log("res:", res);
          this.data.orders = res.data.data;
          this.setData({
            orders: this.data.orders,
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
      },
      complete: () => {
        my.stopPullDownRefresh()
      }
    });
  },

  refreshOrders() {
    const status = this.data.activeTab
    this.loadOrders(status)
    this.countOrder();
  },
  
  onPullDownRefresh() {
    // ⭐ 下拉刷新，只刷新当前 tab 对应的数据
    this.refreshOrders()
  },

  switchTab(e) {
    const key = Number(e.currentTarget.dataset.key);

    this.setData({
      activeTab: key
    });

    this.loadOrders(key);
  },

  // 接单：将状态改为 accepted
  acceptOrder(e) {
    const orderNo = e.currentTarget.dataset.orderNo;

    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    my.request({
      url: `${apiBaseUrl}order/rider/accept/${orderNo}`,
      method: 'PUT',
      headers: {
        riderToken: app.globalData.riderToken
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          console.log(res.data.data);
          this.setData({
            activeTab: 4,
          })
          this.loadOrders(4);
          this.countOrder();
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

    my.showToast({
      content: '接单成功',
      type: 'success'
    });
  },

  // 进入配送页面
  goDelivery(e) {
    const orderNo = e.currentTarget.dataset.orderNo;
    console.log("orderNo", orderNo);
    my.navigateTo({
      url: `/pages/rider-delivery/rider-delivery?orderNo=${orderNo}`
    });
  },

  // 跳转数据统计
  goStats() {
    my.navigateTo({
      url: '/pages/rider-stats/rider-stats'
    });
  }
});