const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const Waitlist = require('../models/Waitlist');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const AuditLog = require('../models/AuditLog');

// RESET TOÀN BỘ DỮ LIỆU NHÀ HÀNG:
// 1. Lễ tân (Khách đặt trước & Khách chờ)
// 2. Phục vụ (Bàn ăn đang có khách -> Đặt lại toàn bộ về Bàn trống)
// 3. Đầu bếp (Danh sách Order đang chế biến từ phục vụ sang bếp)
// 4. Thu ngân (Hóa đơn và các giao dịch thanh toán)
// Yêu cầu Mật khẩu: nhahang2026 và Mã PIN: 123456
exports.resetAllOperationalData = async (req, res) => {
  try {
    const { password, pin, performedBy } = req.body;

    // Xác thực bảo mật: Mật khẩu & Mã PIN
    if (password !== 'nhahang2026' || String(pin) !== '123456') {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu hoặc mã PIN bảo mật không chính xác! Không được phép reset dữ liệu nhà hàng.'
      });
    }

    // 1. Lễ tân: Xóa sạch danh sách đặt bàn & khách chờ (Waitlist)
    await Promise.all([
      Reservation.deleteMany({}),
      Waitlist.deleteMany({})
    ]);

    // 2. Phục vụ: Đặt lại toàn bộ bàn ăn về trạng thái Bàn trống
    await Table.updateMany({}, {
      status: 'empty',
      currentOrderId: null,
      guestCount: 0,
      occupiedAt: null,
      reservationId: null
    });

    // 3. Đầu bếp: Xóa sạch toàn bộ Order đang chế biến hoặc phục vụ
    await Order.deleteMany({});

    // 4. Thu ngân: Xóa toàn bộ hóa đơn thanh toán & tạm tính
    await Invoice.deleteMany({});

    // Ghi nhận Audit Log
    try {
      await AuditLog.create({
        action: 'RESTAURANT_RESET_ALL',
        entity: 'System',
        entityId: 'ALL',
        performedBy: req.body?.performedBy || 'Cấp Quản Lý',
        details: 'Đã thực hiện RESET TOÀN BỘ DỮ LIỆU NHÀ HÀNG: 1.Lễ tân, 2.Phục vụ (bàn trống), 3.Bếp (xóa order), 4.Thu ngân (xóa hóa đơn)'
      });
    } catch (logErr) {
      console.warn('Lỗi ghi audit log:', logErr.message);
    }

    // Phát sự kiện Socket.IO đồng bộ tức thì đến toàn bộ 5 phân hệ
    const io = req.app.get('socketio');
    if (io) {
      io.emit('restaurant:reset_all', {
        timestamp: new Date(),
        message: 'Toàn bộ dữ liệu vận hành đã được làm mới'
      });
      io.emit('table:status_changed');
      io.emit('tables:updated');
      io.emit('order:created');
      io.emit('orders:reset');
      io.emit('reservation:updated');
      io.emit('waitlist:updated');
      io.emit('payment:completed');
      io.emit('invoices:reset');
    }

    res.json({
      success: true,
      message: '✅ Đã reset toàn bộ dữ liệu nhà hàng thành công! Toàn bộ bàn đã về bàn trống, khách chờ lễ tân, order bếp và hóa đơn thu ngân đã được làm mới.'
    });
  } catch (error) {
    console.error('Lỗi reset dữ liệu nhà hàng:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
