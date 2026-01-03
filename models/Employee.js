/**
 * 员工实体类
 * 对应数据库表：employee
 */
class Employee {
  constructor(data = {}) {
    this.id = data.id || null; // BIGINT - 主键
    this.username = data.username || null; // VARCHAR(50) - 登录用户名
    this.password = data.password || null; // VARCHAR(100) - 密码（加密）
    this.name = data.name || null; // VARCHAR(50) - 真实姓名
    this.phone = data.phone || null; // VARCHAR(20) - 手机号
    this.avatar = data.avatar || null; // VARCHAR(255) - 头像URL
    this.role = data.role || null; // VARCHAR(20) - 角色：ADMIN、DELIVERY、OTHER
    this.status = data.status !== undefined ? data.status : 1; // TINYINT - 1正常 0禁用
  }

  /**
   * 从后端返回的数据创建 Employee 对象
   */
  static fromApi(data) {
    return new Employee({
      id: data.id,
      username: data.username,
      password: data.password,
      name: data.name,
      phone: data.phone,
      avatar: data.avatar,
      role: data.role,
      status: data.status,
    });
  }

  /**
   * 转换为 API 请求格式
   */
  toApi() {
    return {
      id: this.id,
      username: this.username,
      password: this.password,
      name: this.name,
      phone: this.phone,
      avatar: this.avatar,
      role: this.role,
      status: this.status,
    };
  }
}

module.exports = Employee;

