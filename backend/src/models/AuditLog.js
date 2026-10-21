const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: [
      'CANCEL_COOKING_ITEM',   // Hủy món khi bếp đang nấu
      'CANCEL_ORDER',          // Hủy cả đơn hàng
      'SPECIAL_DISCOUNT',      // Giảm giá ngoại lệ
      'TRANSFER_TABLE',        // Chuyển bàn
      'MERGE_TABLES',          // Ghép bàn
      'OPEN_CASH_DRAWER',      // Mở két tiền không thanh toán
      'EMERGENCY_OUT_OF_STOCK' // Báo hết món khẩn cấp (86ing)
    ],
    required: true
  },
  performedBy: {
    type: String, // Tên hoặc ID nhân viên
    default: 'Nhân viên'
  },
  approvedBy: {
    type: String, // Tên quản lý duyệt
    default: 'Quản lý duyệt'
  },
  targetType: {
    type: String, // 'Order', 'Table', 'MenuItem', 'Invoice'
    default: 'Order'
  },
  targetId: {
    type: String,
    default: ''
  },
  reason: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
