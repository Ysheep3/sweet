Page({
  data: {
    currentTab: 3,
    claimableCount: 0, // 可领取
    availableCount: 0, // 可使用
    usedCount: 0, // 已使用
    expiredCount: 0, // 已过期
    claimableList: [],
    availableList: [],
    usedList: [],
    expiredList: []
  },

  async onLoad() {
    this.loadCoupons();
  },

  // onShow() {
  //   await Promise.all([
  //     this.loadCoupons(),
  //     this.loadUserCoupons(),
  //     this.loadUsedCoupons(),
  //     this.loadExpiredCoupons()
  //   ]);
  // },

  onPullDownRefresh() {
    this.loadCoupons();
  },

  async loadCoupons() {
    try {
      await Promise.all([
        this.loadClaimableCoupons(),
        this.loadUserCoupons(0),
        this.loadUsedCoupons(1),
        this.loadExpiredCoupons(2)
      ]);
      console.log('所有数据加载完成');
    } catch (error) {
      console.error('数据加载失败:', error);
      my.showToast({
        content: '数据加载失败，请稍后重试',
        type: 'fail'
      });
    } finally {
      my.stopPullDownRefresh()
    }
  },

  // 加载可领取优惠券数据
  loadClaimableCoupons() {
    // 模拟数据，实际项目中应从接口获取
    // type: 1 满减券, 2 折扣券, 3 无门槛券
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    my.request({
      url: `${apiBaseUrl}coupon/user/list`,
      method: 'GET',
      headers: {
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          console.log("claimableList:", res.data.data);
          const claimableList = res.data.data;

          this.setData({
            claimableList: claimableList,
            claimableCount: claimableList.length
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
          content: "网络异常"
        })
      }
    })
  },

  // 加载用户优惠券数据
  loadUserCoupons(status) {
    // status: 0 可使用，1 已使用，2 已过期
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"
    //const status = this.data.currentTab === 3 ? 0 : this.data.currentTab;

    my.request({
      url: `${apiBaseUrl}user-coupon/user/list/${status}`,
      method: 'GET',
      headers: {
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          console.log("availableList", res.data.data);
          const availableList = res.data.data;

          this.setData({
            availableList: availableList,
            availableCount: availableList.length
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
          content: "网络异常"
        })
      }
    })
  },

  // 加载已使用优惠券
  loadUsedCoupons(status) {
    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"
    my.request({
      url: `${apiBaseUrl}user-coupon/user/list/${status}`,
      method: 'GET',
      headers: {
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          console.log("usedList", res.data.data);
          const usedList = res.data.data;

          this.setData({
            usedList: usedList,
            usedCount: usedList.length
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
          content: "网络异常"
        })
      }
    })
  },

  // 加载已过期优惠券
  loadExpiredCoupons(status) {

    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"
    my.request({
      url: `${apiBaseUrl}user-coupon/user/list/${status}`,
      method: 'GET',
      headers: {
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          console.log("expiredList", res.data.data);
          const expiredList = res.data.data;

          this.setData({
            expiredList: expiredList,
            expiredCount: expiredList.length
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
          content: "网络异常"
        })
      }
    })
  },

  // 切换Tab
  switchTab(e) {
    const tab = Number(e.currentTarget.dataset.tab);
    switch (tab) {
      case 0:
        this.loadUserCoupons(tab);
        break;
      case 1:
        this.loadUsedCoupons(tab);
        break;
      case 2:
        this.loadExpiredCoupons(tab);
        break;
      default:
        this.loadClaimableCoupons();
    }
    this.setData({
      currentTab: tab
    });
  },

  // 领取优惠券
  claimCoupon(e) {
    // const id = e.currentTarget.dataset.id;
    const coupon = e.currentTarget.dataset.item;

    const data = {
      couponId: coupon.id,
      receiveTime: coupon.receiveTime,
      startTime: coupon.startTime,
      endTime: coupon.endTime
    };

    const app = getApp()
    const apiBaseUrl = (app.globalData && app.globalData.apiBaseUrl) || "http://localhost:8080/"

    my.request({
      url: `${apiBaseUrl}user-coupon/user/claim`,
      method: 'POST',
      data: data,
      headers: {
        'Content-Type': 'application/json',
        authentication: app.globalData.authentication
      },
      success: (res) => {
        if (res.data && res.data.code === 1) {
          my.showToast({
            content: '领取成功',
            type: 'success'
          });
          this.loadCoupons();
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
          content: "网络异常"
        })
      }
    })
  },

  // 使用优惠券
  useCoupon() {
    // 跳转到商品页面或结算页面
    my.switchTab({
      url: '/pages/index/index'
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadCoupons();
    my.stopPullDownRefresh();
  }
});