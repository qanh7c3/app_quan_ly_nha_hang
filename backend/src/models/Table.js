const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: [true, 'Vui lòng nhập số bàn'],
    unique: true,
    trim: true
  },
  zone: {
    type: String,
    default: 'Tầng 1',
    trim: true
  },
  capacity: {
    type: Number,
    default: 4
  },
  status: {
    type: String,
    enum: ['empty', 'occupied', 'reserved', 'cleaning'],
    default: 'empty'
  },
  currentOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  guestCount: {
    type: Number, // Số lượng khách thực tế đang ngồi
    default: 0
  },
  mergedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table'
  }],
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    default: null
  },
  qrCodeUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
