const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['Thịt/Hải sản', 'Rau củ', 'Gia vị/Đồ khô', 'Đồ uống/Bia', 'Khác'],
    default: 'Khác'
  },
  unit: {
    type: String, // kg, gram, lít, lon, chai, gói
    required: true,
    default: 'kg'
  },
  quantityInStock: {
    type: Number,
    required: true,
    default: 0
  },
  minThreshold: {
    type: Number, // Mức cảnh báo sắp hết hàng
    default: 5
  },
  costPerUnit: {
    type: Number, // Giá vốn nhập kho
    default: 0
  },
  lastImportDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
