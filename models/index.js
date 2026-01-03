/**
 * 实体类统一导出
 */
const User = require('./User');
const Employee = require('./Employee');
const Address = require('./Address');
const Category = require('./Category');
const Dish = require('./Dish');
const SetMeal = require('./SetMeal');
const SetMealDish = require('./SetMealDish');
const ShoppingCart = require('./ShoppingCart');
const Order = require('./Order');
const OrderDetail = require('./OrderDetail');
const Coupon = require('./Coupon');
const UserCoupon = require('./UserCoupon');

module.exports = {
  User,
  Employee,
  Address,
  Category,
  Dish,
  SetMeal,
  SetMealDish,
  ShoppingCart,
  Order,
  OrderDetail,
  Coupon,
  UserCoupon
};

