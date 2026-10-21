const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  cashierName: {
    type: String,
    required: true
  },
  openingTime: {
    type: Date,
    default: Date.now
  },
  closingTime: {
    type: Date,
    default: null
  },
  openingCash: {
    type: Number, // Tiền lẻ ban đầu
    required: true,
    default: 0
  },
  totalCashCollected: {
    type: Number, // Tổng tiền mặt thu được trong ca
    default: 0
  },
  totalTransferCollected: {
    type: Number, // Tổng tiền chuyển khoản (VietQR) trong ca
    default: 0
  },
  expectedCashInDrawer: {
    type: Number, // Tiền mặt dự kiến có trong két (opening + cash collected)
    default: 0
  },
  actualCashInDrawer: {
    type: Number, // Tiền mặt thực tế đếm được khi kết ca
    default: 0
  },
  discrepancy: {
    type: Number, // Chênh lệch (thừa/thiếu)
    default: 0
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);
