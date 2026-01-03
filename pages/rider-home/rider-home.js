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
    // 从后端API获取骑手信息
    const app = getApp();
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || 'http://localhost:8081/';
    
    // TODO: 从后端API获取当前登录的骑手信息
    // 示例：
    // my.request({
    //   url: `${apiBaseUrl}employee/current`,
    //   method: 'GET',
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data) {
    //       const Employee = require('../../models/Employee');
    //       const employee = Employee.fromApi(res.data);
    //       this.setData({
    //         riderInfo: {
    //           id: employee.id,
    //           name: employee.name,
    //           phone: employee.phone,
    //           avatar: employee.avatar,
    //           role: employee.role
    //         }
    //       });
    //     }
    //   },
    //   fail: (err) => {
    //     console.error('获取骑手信息失败:', err);
    //     // 如果获取失败，可能需要重新登录
    //     my.reLaunch({
    //       url: '/pages/role-select/roleSelect'
    //     });
    //   }
    // });
    
    // 临时：设置为空对象
    this.setData({
      riderInfo: {}
    });
  },

  // 从服务端加载骑手订单数据
  loadOrders() {
    // TODO: 从后端API获取骑手订单数据
    // 示例：
    // my.request({
    //   url: 'https://your-api.com/api/order/rider/list',
    //   method: 'GET',
    //   data: {
    //     employeeId: this.data.riderInfo.id,
    //     status: this.data.activeTab
    //   },
    //   success: (res) => {
    //     const Order = require('../../models/Order');
    //     const orders = res.data.map(item => Order.fromApi(item));
    //     const todayFinished = orders.filter(o => o.status === 4).length;
    //     this.setData(
    //       {
    //         orders,
    //         todayFinished
    //       },
    //       () => {
    //         this.filterOrders();
    //       }
    //     );
    //   }
    // });

    this.setData(
      {
        orders: [],
        todayFinished: 0
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


