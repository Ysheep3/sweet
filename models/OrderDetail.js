/**
 * 订单详情实体类
 * 对应数据库表：order_detail
 */
class OrderDetail {
  constructor(data = {}) {
    this.id = data.id || null; // BIGINT - 主键
    this.orderId = data.orderId || data.order_id || null; // BIGINT - 订单ID
    this.dishId = data.dishId || data.dish_id || null; // BIGINT - 单品ID（可为空）
    this.setMealId = data.setMealId || data.set_meal_id || null; // BIGINT - 套餐ID（可为空）
    this.name = data.name || null; // VARCHAR(50) - 商品名称（冗余）
    this.image = data.image || null; // VARCHAR(255) - 图片（冗余）
    this.number = data.number || null; // INT - 数量
    this.amount = data.amount || null; // DECIMAL(10,2) - 单价
  }

  /**
   * 从后端返回的数据创建 OrderDetail 对象
   */
  static fromApi(data) {
    return new OrderDetail({
      id: data.id,
      orderId: data.orderId || data.order_id,
      dishId: data.dishId || data.dish_id,
      setMealId: data.setMealId || data.set_meal_id,
      name: data.name,
      image: data.image,
      number: data.number,
      amount: data.amount
    });
  }

  /**
   * 转换为 API 请求格式
   */
  toApi() {
    return {
      id: this.id,
      orderId: this.orderId,
      dishId: this.dishId,
      setMealId: this.setMealId,
      name: this.name,
      image: this.image,
      number: this.number,
      amount: this.amount
    };
  }
}

module.exports = OrderDetail;

