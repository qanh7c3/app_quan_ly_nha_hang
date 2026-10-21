const AuditLog = require('../models/AuditLog');

// Lấy danh sách nhật ký kiểm soát (chống gian lận)
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
