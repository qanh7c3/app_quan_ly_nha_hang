const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Vui lòng nhập tên khách hàng'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Vui lòng nhập số điện thoại'],
    trim: true
  },
  guestCount: {
    type: Number,
    required: [true, 'Vui lòng nhập số lượng khách'],
    min: 1
  },
  reservationTime: {
    type: Date,
    required: [true, 'Vui lòng chọn thời gian đến']
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'seated', 'cancelled', 'no_show'],
    default: 'confirmed'
  },
  specialRequests: {
    type: String, // ví dụ: "Ghế trẻ em, phòng VIP, trang trí sinh nhật, dị ứng hải sản"
    default: ''
  },
  depositAmount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
