Page({
  data: {
    riderInfo: {},
    activeTab: 'pending', // pending | delivering | finished
    orders: [],
    filteredOrders: [],
    todayFinished: 0
  },

  onLoad() {
    this.loadRiderInfo();
    this.loadOrders();
  },

  onShow() {
    this.loadRiderInfo();
    this.loadOrders();
  },

  loadRiderInfo() {
    const userInfo = my.getStorageSync({ key: 'userInfo' }).data || {};
    this.setData({
      riderInfo: userInfo
    });
  },

  // 模拟从服务端加载骑手订单数据
  loadOrders() {
    // 先从本地缓存读取，如无则初始化一些示例数据
    let orders = my.getStorageSync({ key: 'riderOrders' }).data;
    if (!orders || !orders.length) {
      orders = [
        {
          id: 'D' + Date.now(),
          status: 'pending', // pending 待接单, accepted 已接单, delivering 配送中, finished 已完成
          statusText: '待接单',
          customerName: '张三',
          customerPhone: '13800001234',
          customerAddress: '广州软件学院',
          amount: 36.5,
          createTime: '12:20',
          customerLocation: { latitude: 23.12908, longitude: 113.26436 }
        },
        {
          id: 'D20250101002',
          status: 'delivering',
          statusText: '配送中',
          customerName: '李四',
          customerPhone: '13900004567',
          customerAddress: '广州软件学院',
          amount: 52.0,
          createTime: '12:05',
          customerLocation: { latitude: 23.457069, longitude: 113.501476 }
        },
        {
          id: 'D20250101001',
          status: 'finished',
          statusText: '已完成',
          customerName: '王五',
          customerPhone: '13700007890',
          customerAddress: 'ZZ园 8栋 1203',
          amount: 48.8,
          createTime: '11:40',
          customerLocation: { latitude: 23.127, longitude: 113.2605 }
        }
      ];
      my.setStorageSync({ key: 'riderOrders', data: orders });
    }

    const todayFinished = orders.filter(o => o.status === 'finished').length;

    this.setData(
      {
        orders,
        todayFinished
      },
      () => {
        this.filterOrders();
      }
    );
  },

  switchTab(e) {
    const key = e.currentTarget.dataset.key;
    this.setData(
      {
        activeTab: key
      },
      () => {
        this.filterOrders();
      }
    );
  },

  filterOrders() {
    const { orders, activeTab } = this.data;
    let filtered = [];

    if (activeTab === 'pending') {
      filtered = orders.filter(o => o.status === 'pending');
    } else if (activeTab === 'delivering') {
      filtered = orders.filter(
        o => o.status === 'accepted' || o.status === 'delivering'
      );
    } else if (activeTab === 'finished') {
      filtered = orders.filter(o => o.status === 'finished');
    }

    this.setData({ filteredOrders: filtered });
  },

  // 接单：将状态改为 accepted
  acceptOrder(e) {
    const id = e.currentTarget.dataset.id;
    let orders = [...this.data.orders];
    const target = orders.find(o => o.id === id);
    if (!target) return;

    target.status = 'accepted';
    target.statusText = '已接单';

    my.setStorageSync({ key: 'riderOrders', data: orders });

    this.setData({ orders }, () => {
      this.filterOrders();
    });

    my.showToast({
      content: '接单成功',
      type: 'success'
    });
  },

  // 进入配送页面
  goDelivery(e) {
    const id = e.currentTarget.dataset.id;
    my.navigateTo({
      url: `/pages/rider-delivery/rider-delivery?id=${id}`
    });
  },

  // 跳转数据统计
  goStats() {
    my.navigateTo({
      url: '/pages/rider-stats/rider-stats'
    });
  }
});


