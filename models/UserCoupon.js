/**
 * 用户优惠券实体类
 * 对应数据库表：user_coupon
 */
class UserCoupon {
  constructor(data = {}) {
    this.id = data.id || null; // BIGINT - 主键
    this.userId = data.userId || data.user_id || null; // BIGINT - 顾客ID
    this.couponId = data.couponId || data.coupon_id || null; // BIGINT - 优惠券活动ID
    this.receiveTime = data.receiveTime || data.receive_time || null; // DATETIME - 领取时间
    this.useTime = data.useTime || data.use_time || null; // DATETIME - 使用时间
    this.orderId = data.orderId || data.order_id || null; // BIGINT - 使用订单ID
    this.status = data.status !== undefined ? data.status : 0; // TINYINT - 0未使用 1已使用 2已过期
  }

  /**
   * 从后端返回的数据创建 UserCoupon 对象
   */
  static fromApi(data) {
    return new UserCoupon({
      id: data.id,
      userId: data.userId || data.user_id,
      couponId: data.couponId || data.coupon_id,
      receiveTime: data.receiveTime || data.receive_time,
      useTime: data.useTime || data.use_time,
      orderId: data.orderId || data.order_id,
      status: data.status
    });
  }

  /**
   * 转换为 API 请求格式
   */
  toApi() {
    return {
      id: this.id,
      userId: this.userId,
      couponId: this.couponId,
      receiveTime: this.receiveTime,
      useTime: this.useTime,
      orderId: this.orderId,
      status: this.status
    };
  }

  /**
   * 获取状态文本
   */
  getStatusText() {
    const statusMap = {
      0: '未使用',
      1: '已使用',
      2: '已过期'
    };
    return statusMap[this.status] || '未知';
  }
}

module.exports = UserCoupon;

