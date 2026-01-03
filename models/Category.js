/**
 * 商品分类实体类
 * 对应数据库表：category
 */
class Category {
  constructor(data = {}) {
    this.id = data.id || null; // BIGINT - 主键
    this.name = data.name || null; // VARCHAR(50) - 分类名称
    this.sort = data.sort !== undefined ? data.sort : 0; // INT - 排序
    this.status = data.status !== undefined ? data.status : 1; // TINYINT - 1启用 0禁用
  }

  /**
   * 从后端返回的数据创建 Category 对象
   */
  static fromApi(data) {
    return new Category({
      id: data.id,
      name: data.name,
      sort: data.sort,
      status: data.status,
    });
  }

  /**
   * 转换为 API 请求格式
   */
  toApi() {
    return {
      id: this.id,
      name: this.name,
      sort: this.sort,
      status: this.status,
    };
  }
}

module.exports = Category;

