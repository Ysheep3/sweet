/**
 * 套餐单品关联实体类
 * 对应数据库表：set_meal_dish
 */
class SetMealDish {
  constructor(data = {}) {
    this.id = data.id || null; // BIGINT - 主键
    this.setMealId = data.setMealId || data.set_meal_id || null; // BIGINT - 套餐ID
    this.dishId = data.dishId || data.dish_id || null; // BIGINT - 单品ID
    this.copies = data.copies !== undefined ? data.copies : 1; // INT - 份数
  }

  /**
   * 从后端返回的数据创建 SetMealDish 对象
   */
  static fromApi(data) {
    return new SetMealDish({
      id: data.id,
      setMealId: data.setMealId || data.set_meal_id,
      dishId: data.dishId || data.dish_id,
      copies: data.copies
    });
  }

  /**
   * 转换为 API 请求格式
   */
  toApi() {
    return {
      id: this.id,
      setMealId: this.setMealId,
      dishId: this.dishId,
      copies: this.copies
    };
  }
}

module.exports = SetMealDish;

