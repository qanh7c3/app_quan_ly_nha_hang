const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceCode: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table'
  },
  cashierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subtotal: {
    type: Number,
    required: true
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  memberTier: {
    type: String,
    enum: ['none', 'silver', 'gold', 'vip'],
    default: 'none'
  },
  vatAmount: {
    type: Number,
    default: 0
  },
  surcharge: {
    // Phụ thu (ví dụ phòng VIP, mang rượu từ ngoài vào)
    amount: { type: Number, default: 0 },
    reason: { type: String, default: '' }
  },
  finalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'vietqr', 'card', 'split'],
    default: 'cash'
  },
  splitDetails: {
    cashAmount: { type: Number, default: 0 },
    transferAmount: { type: Number, default: 0 }
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  vietQrUrl: {
    type: String,
    default: ''
  },
  paidAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
