const Reservation = require('../models/Reservation');
const Waitlist = require('../models/Waitlist');
const Table = require('../models/Table');

// 1. Quản lý Đặt bàn trước (Reservation)
exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('tableId', 'tableNumber zone capacity status')
      .sort({ reservationTime: 1 });
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createReservation = async (req, res) => {
  try {
    const { customerName, phone, guestCount, reservationTime, tableId, specialRequests, notes } = req.body;

    const resTime = new Date(reservationTime);
    const now = new Date();

    // 1. Kiểm tra thời gian không được ở quá khứ
    if (isNaN(resTime.getTime()) || resTime < new Date(now.getTime() - 2 * 60000)) {
      return res.status(400).json({
        success: false,
        message: 'Thời gian đặt bàn không được chọn trong quá khứ! Vui lòng chọn thời gian từ hiện tại trở đi.'
      });
    }

    // 2. Nếu có chọn bàn, kiểm tra bàn không được trùng với bàn đã có người (occupied) hoặc đã đặt (reserved)
    if (tableId) {
      const table = await Table.findById(tableId);
      if (!table) {
        return res.status(404).json({ success: false, message: 'Bàn được chọn không tồn tại' });
      }
      if (table.status === 'occupied') {
        return res.status(400).json({
          success: false,
          message: `Bàn [${table.tableNumber}] đang có khách ngồi ăn! Không thể gán đặt trước vào bàn này.`
        });
      }
      if (table.status === 'reserved') {
        return res.status(400).json({
          success: false,
          message: `Bàn [${table.tableNumber}] đã có khách khác đặt trước! Vui lòng chọn bàn trống khác.`
        });
      }
    }

    const reservation = await Reservation.create({
      customerName,
      phone,
      guestCount: Number(guestCount) || 2,
      reservationTime: resTime,
      tableId: tableId || null,
      specialRequests: specialRequests || '', // Có thể bỏ trống
      notes: notes || '',
      status: 'confirmed'
    });

    // Nếu có chọn bàn trước và bàn đang trống, đổi trạng thái bàn sang "reserved"
    if (tableId) {
      await Table.findByIdAndUpdate(tableId, {
        status: 'reserved',
        reservationId: reservation._id,
        guestCount: Number(guestCount) || 2
      });
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('reservation:updated', reservation);
      io.emit('table:status_changed');
    }

    res.status(201).json({ success: true, data: reservation, message: 'Đặt bàn trước thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đón khách vào bàn (Check-in)
exports.checkInReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetTableId } = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Không tìm thấy đặt bàn' });

    const finalTableId = targetTableId || reservation.tableId;
    if (!finalTableId) {
      return res.status(400).json({ success: false, message: 'Vui lòng chỉ định bàn để xếp khách' });
    }

    const table = await Table.findById(finalTableId);
    if (table && table.status === 'occupied') {
      return res.status(400).json({ success: false, message: `Bàn [${table.tableNumber}] hiện đang có khách ngồi! Vui lòng chọn bàn trống.` });
    }

    // Đổi trạng thái bàn sang 'occupied'
    await Table.findByIdAndUpdate(finalTableId, {
      status: 'occupied',
      guestCount: reservation.guestCount,
      reservationId: reservation._id
    });

    reservation.status = 'seated';
    reservation.tableId = finalTableId;
    await reservation.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('reservation:updated', reservation);
      io.emit('table:status_changed');
    }

    res.json({ success: true, message: 'Khách đã vào bàn thành công', data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Quản lý Danh sách chờ (Waitlist)
exports.getWaitlist = async (req, res) => {
  try {
    const waitlist = await Waitlist.find({ status: 'waiting' }).sort({ createdAt: 1 });
    res.json({ success: true, data: waitlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToWaitlist = async (req, res) => {
  try {
    const { customerName, phone, guestCount, preferredZone, notes } = req.body;
    const item = await Waitlist.create({
      customerName,
      phone,
      guestCount: Number(guestCount) || 2,
      preferredZone: preferredZone || 'Bất kỳ',
      notes: notes || '',
      status: 'waiting'
    });

    const io = req.app.get('socketio');
    if (io) {
      io.emit('waitlist:updated', item);
    }

    res.status(201).json({ success: true, data: item, message: 'Đã thêm khách vào danh sách chờ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xếp bàn cho khách trong danh sách chờ
exports.seatWaitlistCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableId } = req.body;

    const waitlistItem = await Waitlist.findById(id);
    if (!waitlistItem) return res.status(404).json({ success: false, message: 'Không tìm thấy khách trong danh sách chờ' });

    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ success: false, message: 'Bàn không tồn tại' });
    if (table.status !== 'empty') {
      return res.status(400).json({ success: false, message: `Bàn [${table.tableNumber}] không còn trống (hiện đang: ${table.status})` });
    }

    await Table.findByIdAndUpdate(tableId, {
      status: 'occupied',
      guestCount: waitlistItem.guestCount
    });

    waitlistItem.status = 'seated';
    await waitlistItem.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('waitlist:updated', waitlistItem);
      io.emit('table:status_changed');
    }

    res.json({ success: true, message: 'Đã xếp bàn thành công cho khách chờ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
