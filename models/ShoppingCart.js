/**
 * 购物车实体类
 * 对应数据库表：shopping_cart
 */
class ShoppingCart {
  constructor(data = {}) {
    this.id = data.id || null; // BIGINT - 主键
    this.userId = data.userId || data.user_id || null; // BIGINT - 顾客ID
    this.dishId = data.dishId || data.dish_id || null; // BIGINT - 单品ID（可为空）
    this.setMealId = data.setMealId || data.set_meal_id || null; // BIGINT - 套餐ID（可为空）
    this.number = data.number !== undefined ? data.number : 1; // INT - 数量
  }

  /**
   * 从后端返回的数据创建 ShoppingCart 对象
   */
  static fromApi(data) {
    return new ShoppingCart({
      id: data.id,
      userId: data.userId || data.user_id,
      dishId: data.dishId || data.dish_id,
      setMealId: data.setMealId || data.set_meal_id,
      number: data.number,
    });
  }

  /**
   * 转换为 API 请求格式
   */
  toApi() {
    return {
      id: this.id,
      userId: this.userId,
      dishId: this.dishId,
      setMealId: this.setMealId,
      number: this.number,
    };
  }
}

module.exports = ShoppingCart;

