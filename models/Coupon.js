/**
 * 优惠券活动实体类
 * 对应数据库表：coupon
 */
class Coupon {
  constructor(data = {}) {
    this.id = data.id || null; // BIGINT - 主键
    this.name = data.name || null; // VARCHAR(50) - 优惠券名称
    this.type = data.type || null; // TINYINT - 1满减 2折扣 3无门槛
    this.conditionAmount = data.conditionAmount !== undefined ? data.conditionAmount : (data.condition_amount !== undefined ? data.condition_amount : 0); // DECIMAL(10,2) - 满多少可用
    this.reduceAmount = data.reduceAmount || data.reduce_amount || null; // DECIMAL(10,2) - 减多少
    this.discount = data.discount || null; // DECIMAL(5,2) - 折扣（如0.8）
    this.totalQuantity = data.totalQuantity !== undefined ? data.totalQuantity : (data.total_quantity !== undefined ? data.total_quantity : 0); // INT - 总发放量，0不限
    this.usedQuantity = data.usedQuantity !== undefined ? data.usedQuantity : (data.used_quantity !== undefined ? data.used_quantity : 0); // INT - 已使用数量
    this.startTime = data.startTime || data.start_time || null; // DATETIME - 开始时间
    this.endTime = data.endTime || data.end_time || null; // DATETIME - 结束时间
    this.status = data.status !== undefined ? data.status : 1; // TINYINT - 1有效 0无效
    this.createTime = data.createTime || data.create_time || null; // DATETIME - 创建时间
    this.updateTime = data.updateTime || data.update_time || null; // DATETIME - 更新时间
  }

  /**
   * 从后端返回的数据创建 Coupon 对象
   */
  static fromApi(data) {
    return new Coupon({
      id: data.id,
      name: data.name,
      type: data.type,
      conditionAmount: data.conditionAmount !== undefined ? data.conditionAmount : (data.condition_amount !== undefined ? data.condition_amount : 0),
      reduceAmount: data.reduceAmount || data.reduce_amount,
      discount: data.discount,
      totalQuantity: data.totalQuantity !== undefined ? data.totalQuantity : (data.total_quantity !== undefined ? data.total_quantity : 0),
      usedQuantity: data.usedQuantity !== undefined ? data.usedQuantity : (data.used_quantity !== undefined ? data.used_quantity : 0),
      startTime: data.startTime || data.start_time,
      endTime: data.endTime || data.end_time,
      status: data.status,
      createTime: data.createTime || data.create_time,
      updateTime: data.updateTime || data.update_time
    });
  }

  /**
   * 转换为 API 请求格式
   */
  toApi() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      conditionAmount: this.conditionAmount,
      reduceAmount: this.reduceAmount,
      discount: this.discount,
      totalQuantity: this.totalQuantity,
      usedQuantity: this.usedQuantity,
      startTime: this.startTime,
      endTime: this.endTime,
      status: this.status,
      createTime: this.createTime,
      updateTime: this.updateTime
    };
  }

  /**
   * 获取优惠券类型文本
   */
  getTypeText() {
    const typeMap = {
      1: '满减',
      2: '折扣',
      3: '无门槛'
    };
    return typeMap[this.type] || '未知';
  }

  /**
   * 获取使用条件文本
   */
  getConditionText() {
    if (this.type === 3) {
      return '无门槛';
    }
    if (this.type === 1) {
      return `满${this.conditionAmount}元可用`;
    }
    if (this.type === 2) {
      return `满${this.conditionAmount}元可用`;
    }
    return '';
  }
}

module.exports = Coupon;

