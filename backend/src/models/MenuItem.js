const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên món ăn'],
    trim: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá món'],
    min: 0
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
  },
  cloudinaryPublicId: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  station: {
    type: String,
    enum: ['kitchen', 'bar'],
    default: 'kitchen'
  },
  // Định lượng nguyên vật liệu để tự động trừ kho
  recipe: [{
    ingredientName: { type: String, required: true },
    amount: { type: Number, required: true }, // Số lượng tiêu hao
    unit: { type: String, default: 'kg' }     // Đơn vị
  }],
  // Cài đặt giờ vàng (Happy Hour)
  happyHour: {
    isActive: { type: Boolean, default: false },
    discountPercent: { type: Number, default: 0 },
    startHour: { type: Number, default: 14 }, // Ví dụ 14h
    endHour: { type: Number, default: 17 }    // đến 17h
  },
  options: [{
    name: String,
    values: [{
      label: String,
      extraPrice: { type: Number, default: 0 }
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
