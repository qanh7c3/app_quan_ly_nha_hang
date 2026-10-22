const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  group: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subCategory: {
    type: String,
    trim: true,
    default: ''
  },
  unit: {
    type: String,
    required: true,
    default: 'kg'
  },
  quantityInStock: {
    type: Number,
    required: true,
    default: 0
  },
  minThreshold: {
    type: Number,
    default: 5
  },
  costPerUnit: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  },
  lastImportDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
