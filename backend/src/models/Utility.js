const mongoose = require('mongoose');

const utilitySchema = new mongoose.Schema({
  monthYear: {
    type: String, // Ví dụ: "10/2026"
    required: true
  },
  // Chỉ số điện
  electricity: {
    oldIndex: { type: Number, required: true }, // Số cũ (kWh)
    newIndex: { type: Number, required: true }, // Số mới (kWh)
    consumed: { type: Number, required: true }, // Tiêu thụ (kWh)
    unitPrice: { type: Number, default: 3500 }, // Đơn giá VNĐ/kWh
    totalAmount: { type: Number, required: true }
  },
  // Chỉ số nước
  water: {
    oldIndex: { type: Number, required: true }, // Số cũ (m3)
    newIndex: { type: Number, required: true }, // Số mới (m3)
    consumed: { type: Number, required: true }, // Tiêu thụ (m3)
    unitPrice: { type: Number, default: 25000 }, // Đơn giá VNĐ/m3
    totalAmount: { type: Number, required: true }
  },
  totalBill: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'paid'
  },
  recordedBy: {
    type: String,
    default: 'Quản lý'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Utility', utilitySchema);
