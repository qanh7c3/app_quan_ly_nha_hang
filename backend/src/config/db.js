const mongoose = require('mongoose');
const User = require('../models/User');

const seedDefaultUsers = async () => {
  try {
    const existing = await User.findOne({ username: 'qanh1' });
    if (!existing) {
      const defaultUsers = [
        {
          name: 'Lễ Tân QAnh',
          username: 'qanh1',
          email: 'qanh1@nhahang.com',
          password: '2006',
          accountType: 'staff',
          position: 'reception',
          approvalStatus: 'approved',
          isActive: true
        },
        {
          name: 'Đầu Bếp QAnh',
          username: 'qanh2',
          email: 'qanh2@nhahang.com',
          password: '2006',
          accountType: 'staff',
          position: 'kitchen',
          approvalStatus: 'approved',
          isActive: true
        },
        {
          name: 'Quản Lý QAnh',
          username: 'qanh3',
          email: 'qanh3@nhahang.com',
          password: '2006',
          accountType: 'staff',
          position: 'manager',
          approvalStatus: 'approved',
          isActive: true
        },
        {
          name: 'Chủ Nhà Hàng QAnh',
          username: 'qanh4',
          email: 'qanh4@nhahang.com',
          password: '2006',
          accountType: 'owner',
          position: 'owner',
          plan: 'enterprise',
          planName: 'Gói Chuỗi Doanh Nghiệp (Enterprise) - 1.899.000 đ/tháng',
          approvalStatus: 'approved',
          isActive: true
        }
      ];

      for (const u of defaultUsers) {
        const userExists = await User.findOne({ username: u.username });
        if (!userExists) {
          await User.create(u);
        }
      }
    }
  } catch (err) {
    console.error(err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant_db');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedDefaultUsers();
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
  }
};

module.exports = connectDB;
