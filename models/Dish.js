/**
 * 单品实体类
 * 对应数据库表：dish
 */
class Dish {
  constructor(data = {}) {
    this.id = data.id || null; // BIGINT - 主键
    this.name = data.name || null; // VARCHAR(50) - 商品名称
    this.categoryId = data.categoryId || data.category_id || null; // BIGINT - 分类ID
    this.price = data.price || null; // DECIMAL(10,2) - 价格
    this.image = data.image || null; // VARCHAR(255) - 图片URL
    this.description = data.description || null; // VARCHAR(255) - 描述
    this.status = data.status !== undefined ? data.status : 1; // TINYINT - 1在售 0停售
    this.sales = data.sales !== undefined ? data.sales : 0; // INT - 销量
    this.type = data.type || null;
  }

  /**
   * 从后端返回的数据创建 Dish 对象
   */
  static fromApi(data) {
    return new Dish({
      id: data.id,
      name: data.name,
      categoryId: data.categoryId || data.category_id,
      type: data.type,
      price: data.price,
      image: data.image,
      description: data.description,
      status: data.status,
      sales: data.sales,
    });
  }

  /**
   * 转换为 API 请求格式
   */
  toApi() {
    return {
      id: this.id,
      name: this.name,
      categoryId: this.categoryId,
      price: this.price,
      image: this.image,
      description: this.description,
      status: this.status,
      sales: this.sales,
    };
  }
}

module.exports = Dish;

