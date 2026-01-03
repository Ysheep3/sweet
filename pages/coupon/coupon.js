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
    // TODO: 从后端API获取用户优惠券数据
    // 示例：
    // my.request({
    //   url: 'https://your-api.com/api/user-coupon/list',
    //   method: 'GET',
    //   success: (res) => {
    //     const UserCoupon = require('../../models/UserCoupon');
    //     const Coupon = require('../../models/Coupon');
    //     const userCoupons = res.data.map(item => UserCoupon.fromApi(item));
    //     // 需要同时获取优惠券详情
    //     const coupons = userCoupons.map(uc => {
    //       // 这里需要根据 couponId 获取优惠券详情，或者后端直接返回完整数据
    //       return { ...uc, ...Coupon.fromApi(uc.couponDetail) };
    //     });
    //     
    //     const availableCount = coupons.filter(c => c.status === 0).length;
    //     const usedCount = coupons.filter(c => c.status === 1).length;
    //     const expiredCount = coupons.filter(c => c.status === 2).length;
    //     
    //     this.setData({
    //       couponList: coupons,
    //       availableCount,
    //       usedCount,
    //       expiredCount
    //     });
    //   }
    // });

    this.setData({
      couponList: [],
      availableCount: 0,
      usedCount: 0,
      expiredCount: 0
    });
  }
});


