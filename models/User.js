/**
 * 用户实体类
 * 对应数据库表：user
 */
class User {
  constructor(data = {}) {
    this.id = data.id || null; // BIGINT - 主键
    this.username = data.username || null; // VARCHAR(50) - 用户名（可为空，手机号登录为主）
    this.password = data.password || null; // VARCHAR(100) - 密码（加密存储）
    this.nickname = data.nickname || null; // VARCHAR(50) - 昵称
    this.phone = data.phone || null; // VARCHAR(20) - 手机号（主要登录方式）
    this.avatar = data.avatar || null; // VARCHAR(255) - 头像URL
    this.status = data.status !== undefined ? data.status : 1; // TINYINT - 1正常 0禁用
  }

  /**
   * 从后端返回的数据创建 User 对象
   */
  static fromApi(data) {
    return new User({
      id: data.id,
      nickname: data.nickname,
      phone: data.phone,
      avatar: data.avatar,
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
      nickname: this.nickname,
      phone: this.phone,
      avatar: this.avatar,
      status: this.status,
    };
  }
}

module.exports = User;

