Page({
  data: {
    couponList: [],
    availableCount: 0,
    usedCount: 0,
    expiredCount: 0
  },

  onLoad() {
    this.loadCoupons();
  },

  onShow() {
    this.loadCoupons();
  },

  loadCoupons() {
    // 从本地获取优惠券；如果没有就初始化一些示例数据
    let coupons = my.getStorageSync({ key: 'coupons' }).data;

    if (!coupons || coupons.length === 0) {
      coupons = [
        {
          id: 1,
          amount: 10,
          conditionText: '满 50 元可用',
          title: '新人专享券',
          validTime: '2027-12-31',
          tags: ['全场通用', '限堂食/外卖'],
          status: 'available'
        },
        {
          id: 2,
          amount: 20,
          conditionText: '满 99 元可用',
          title: '下午茶优惠',
          validTime: '2027-12-30',
          tags: ['14:00-17:00 使用'],
          status: 'available'
        },
        {
          id: 3,
          amount: 8,
          conditionText: '满 30 元可用',
          title: '会员回馈券',
          validTime: '2025-11-30',
          tags: ['部分商品可用'],
          status: 'used'
        }
      ];
      my.setStorageSync({ key: 'coupons', data: coupons });
    }

    const availableCount = coupons.filter(c => c.status === 'available').length;
    const usedCount = coupons.filter(c => c.status === 'used').length;
    const expiredCount = coupons.filter(c => c.status === 'expired').length;

    this.setData({
      couponList: coupons,
      availableCount,
      usedCount,
      expiredCount
    });
  }
});


