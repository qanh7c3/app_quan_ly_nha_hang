const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selectedOptions: [{
    name: String,
    value: String,
    extraPrice: Number
  }],
  note: {
    type: String,
    default: '' // ví dụ: "Không hành, ít cay, làm trước cho trẻ em"
  },
  status: {
    type: String,
    enum: ['pending', 'cooking', 'ready', 'served', 'cancelled'],
    default: 'pending'
  },
  cookingStartTime: Date,
  readyTime: Date
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  orderCode: {
    type: String,
    required: true,
    unique: true
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  guestCount: {
    type: Number,
    default: 1
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  generalNote: {
    type: String,
    default: ''
  },
  // Lịch sử chuyển/ghép bàn hoặc hủy món
  actionHistory: [{
    action: String,
    note: String,
    performedBy: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
