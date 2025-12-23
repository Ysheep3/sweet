Page({
  data: {
    activeTab: 0,
    tabs: [
      { id: 0, name: "待支付", status: "pending" },
      { id: 1, name: "已支付", status: "paid" },
      { id: 2, name: "派送中", status: "shipping" },
      { id: 3, name: "已完成", status: "completed" },
    ],
    orders: [],
    filteredOrders: [],
  },

  onLoad() {
    this.loadOrders()
  },

  onShow() {
    this.loadOrders()
  },

  // 加载订单
  loadOrders() {
    const orders = my.getStorageSync({ key: "orders" }).data || []
    this.setData({ orders })
    this.filterOrders()
  },

  // 切换标签
  switchTab(e) {
    const tabId = e.currentTarget.dataset.id
    this.setData({ activeTab: tabId })
    this.filterOrders()
  },

  // 筛选订单
  filterOrders() {
    const { orders, tabs, activeTab } = this.data
    const status = tabs[activeTab].status
    const filtered = orders.filter((order) => order.status === status)
    this.setData({ filteredOrders: filtered })
  },

  // 继续支付
  continuePay(e) {
    const orderId = e.currentTarget.dataset.id
    my.showLoading({ content: "处理中..." })

    // 模拟支付流程
    setTimeout(() => {
      // 更新订单状态
      const orders = this.data.orders
      const order = orders.find((o) => o.id === orderId)
      if (order) {
        order.status = "paid"
        my.setStorageSync({
          key: "orders",
          data: orders,
        })
        this.loadOrders()
      }

      my.hideLoading()
      my.showToast({
        content: "支付成功",
        type: "success",
      })
    }, 1500)
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
