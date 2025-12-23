Page({
  data: {
    todayFinished: 0,
    weekFinished: 0,
    totalFinished: 0,
    avgDuration: 25,
    minDuration: 12,
    maxDuration: 48,
    todayIncome: '0.00',
    weekIncome: '0.00'
  },

  onLoad() {
    this.loadStats();
  },

  onShow() {
    this.loadStats();
  },

  loadStats() {
    const orders = my.getStorageSync({ key: 'riderOrders' }).data || [];

    const finished = orders.filter(o => o.status === 'finished');
    const totalFinished = finished.length;

    // 简单示意：当成今天、本周都等于全部完成数量
    const todayFinished = totalFinished;
    const weekFinished = totalFinished;

    const todayIncome = (todayFinished * 5).toFixed(2); // 假设每单 5 元配送费
    const weekIncome = (weekFinished * 5).toFixed(2);

    this.setData({
      todayFinished,
      weekFinished,
      totalFinished,
      todayIncome,
      weekIncome
    });
  }
});


