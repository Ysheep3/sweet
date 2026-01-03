/**
 * 订单实体类
 * 对应数据库表：order
 */
class Order {
  constructor(data = {}) {
    this.id = data.id || null; // BIGINT - 订单号（主键）
    this.userId = data.userId || data.user_id || null; // BIGINT - 下单顾客ID
    this.addressId = data.addressId || data.address_id || null; // BIGINT - 地址ID
    this.consignee = data.consignee || null; // VARCHAR(50) - 收货人
    this.phone = data.phone || null; // VARCHAR(20) - 电话
    this.address = data.address || null; // VARCHAR(255) - 完整地址（冗余）
    this.orderTime = data.orderTime || data.order_time || null; // DATETIME - 下单时间
    this.payTime = data.payTime || data.pay_time || null; // DATETIME - 支付时间
    this.amount = data.amount || null; // DECIMAL(10,2) - 订单金额
    this.payMethod = data.payMethod !== undefined ? data.payMethod : (data.pay_method !== undefined ? data.pay_method : null); // TINYINT - 支付方式
    this.status = data.status !== undefined ? data.status : 1; // TINYINT - 订单状态
    this.deliveryStatus = data.deliveryStatus !== undefined ? data.deliveryStatus : (data.delivery_status !== undefined ? data.delivery_status : 0); // TINYINT - 0堂食 1外卖
    this.deliveryEmployeeId = data.deliveryEmployeeId || data.delivery_employee_id || null; // BIGINT - 外送员ID
    this.remark = data.remark || null; // VARCHAR(255) - 备注
  }

  /**
   * 从后端返回的数据创建 Order 对象
   */
  static fromApi(data) {
    return new Order({
      id: data.id,
      userId: data.userId || data.user_id,
      addressId: data.addressId || data.address_id,
      consignee: data.consignee,
      phone: data.phone,
      address: data.address,
      orderTime: data.orderTime || data.order_time,
      payTime: data.payTime || data.pay_time,
      amount: data.amount,
      payMethod: data.payMethod !== undefined ? data.payMethod : (data.pay_method !== undefined ? data.pay_method : null),
      status: data.status,
      deliveryStatus: data.deliveryStatus !== undefined ? data.deliveryStatus : (data.delivery_status !== undefined ? data.delivery_status : 0),
      deliveryEmployeeId: data.deliveryEmployeeId || data.delivery_employee_id,
      remark: data.remark,
    });
  }

  /**
   * 转换为 API 请求格式
   */
  toApi() {
    return {
      id: this.id,
      userId: this.userId,
      addressId: this.addressId,
      consignee: this.consignee,
      phone: this.phone,
      address: this.address,
      orderTime: this.orderTime,
      payTime: this.payTime,
      amount: this.amount,
      payMethod: this.payMethod,
      status: this.status,
      deliveryStatus: this.deliveryStatus,
      deliveryEmployeeId: this.deliveryEmployeeId,
      remark: this.remark,
    };
  }

  /**
   * 获取订单状态文本
   */
  getStatusText() {
    const statusMap = {
      1: '待支付',
      2: '已支付',
      3: '派送中',
      4: '已完成',
      5: '已取消'
    };
    return statusMap[this.status] || '未知';
  }
}

module.exports = Order;

