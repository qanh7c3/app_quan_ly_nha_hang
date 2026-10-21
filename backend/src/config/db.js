const mongoose = require('mongoose');

/**
 * Kết nối tới cơ sở dữ liệu đám mây MongoDB Atlas
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant_db');
    console.log(`✅ Kết nối thành công MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Lỗi kết nối MongoDB Atlas: ${error.message}`);
    console.log('⚠️ Lưu ý: Vui lòng cấu hình đúng MONGODB_URI trong file .env để kết nối với cụm MongoDB Atlas đám mây.');
  }
};

module.exports = connectDB;
