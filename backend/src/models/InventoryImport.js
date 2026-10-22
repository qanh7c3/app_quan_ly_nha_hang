const mongoose = require('mongoose');

const inventoryImportSchema = new mongoose.Schema({
  importCode: {
    type: String, // Ví dụ: "IMP-20261022-001"
    required: true,
    unique: true
  },
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  ingredientName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Khác'
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  costPerUnit: {
    type: Number, // Giá vốn nhập kho
    required: true
  },
  totalCost: {
    type: Number, // quantity * costPerUnit
    required: true
  },
  supplier: {
    type: String,
    default: 'Chợ đầu mối / Nhà cung cấp uy tín'
  },
  importedBy: {
    type: String,
    default: 'Quản lý kho'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('InventoryImport', inventoryImportSchema);
