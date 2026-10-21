const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  guestCount: {
    type: Number,
    required: true,
    min: 1
  },
  preferredZone: {
    type: String,
    default: 'Bất kỳ'
  },
  status: {
    type: String,
    enum: ['waiting', 'notified', 'seated', 'cancelled'],
    default: 'waiting'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
