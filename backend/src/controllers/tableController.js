const Table = require('../models/Table');
const Order = require('../models/Order');

// Lấy danh sách tất cả các bàn kèm order hiện tại (nếu có)
exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find().populate({
      path: 'currentOrderId',
      populate: {
        path: 'items.menuItemId',
        select: 'name price imageUrl'
      }
    }).sort({ tableNumber: 1 });
    res.json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật trạng thái bàn (Trống, Đang phục vụ, Đã đặt, Chờ dọn)
exports.updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const table = await Table.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bàn' });
    }

    // Phát sự kiện realtime qua Socket.IO
    const io = req.app.get('socketio');
    if (io) {
      io.emit('table:status_changed', table);
    }

    res.json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo bàn mới
exports.createTable = async (req, res) => {
  try {
    const { tableNumber, zone, capacity } = req.body;
    const table = await Table.create({
      tableNumber,
      zone: zone || 'Tầng 1',
      capacity: capacity || 4,
      status: 'empty'
    });

    const io = req.app.get('socketio');
    if (io) {
      io.emit('table:created', table);
    }

    res.status(201).json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
