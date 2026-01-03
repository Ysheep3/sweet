/**
 * 收货地址实体类
 * 对应数据库表：address
 */
class Address {
  constructor(data = {}) {
    this.id = data.id || null; // BIGINT - 主键
    this.userId = data.userId || data.user_id || null; // BIGINT - 所属顾客ID
    this.consignee = data.consignee || null; // VARCHAR(50) - 收货人
    this.phone = data.phone || null; // VARCHAR(20) - 联系电话
    this.province = data.province || null; // VARCHAR(50) - 省
    this.city = data.city || null; // VARCHAR(50) - 市
    this.district = data.district || null; // VARCHAR(50) - 区
    this.detailAddress = data.detailAddress || data.detail_address || null; // VARCHAR(255) - 详细地址
    this.label = data.label || null; // VARCHAR(20) - 标签（如家、公司）
    this.isDefault = data.isDefault !== undefined ? data.isDefault : (data.is_default !== undefined ? data.is_default : 0); // TINYINT - 是否默认 1是 0否
    this.createTime = data.createTime || data.create_time || null; // DATETIME - 创建时间
    this.updateTime = data.updateTime || data.update_time || null; // DATETIME - 更新时间
  }

  /**
   * 从后端返回的数据创建 Address 对象
   */
  static fromApi(data) {
    return new Address({
      id: data.id,
      userId: data.userId || data.user_id,
      consignee: data.consignee,
      phone: data.phone,
      province: data.province,
      city: data.city,
      district: data.district,
      detailAddress: data.detailAddress || data.detail_address,
      label: data.label,
      isDefault: data.isDefault !== undefined ? data.isDefault : (data.is_default !== undefined ? data.is_default : 0)
    });
  }

  /**
   * 转换为 API 请求格式
   */
  toApi() {
    return {
      id: this.id,
      userId: this.userId,
      consignee: this.consignee,
      phone: this.phone,
      province: this.province,
      city: this.city,
      district: this.district,
      detailAddress: this.detailAddress,
      label: this.label,
      isDefault: this.isDefault
    };
  }

  /**
   * 获取完整地址字符串
   */
  getFullAddress() {
    return `${this.province || ''}${this.city || ''}${this.district || ''}${this.detailAddress || ''}`;
  }
}

module.exports = Address;

