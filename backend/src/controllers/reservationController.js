const Reservation = require('../models/Reservation');
const Waitlist = require('../models/Waitlist');
const Table = require('../models/Table');

// 1. Quản lý Đặt bàn trước (Reservation)
exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('tableId', 'tableNumber zone capacity')
      .sort({ reservationTime: 1 });
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createReservation = async (req, res) => {
  try {
    const { customerName, phone, guestCount, reservationTime, tableId, specialRequests, notes } = req.body;

    const reservation = await Reservation.create({
      customerName,
      phone,
      guestCount,
      reservationTime,
      tableId: tableId || null,
      specialRequests: specialRequests || '',
      notes: notes || '',
      status: 'confirmed'
    });

    // Nếu có chọn bàn trước, đổi trạng thái bàn sang "reserved"
    if (tableId) {
      await Table.findByIdAndUpdate(tableId, {
        status: 'reserved',
        reservationId: reservation._id
      });
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('reservation:updated', reservation);
      io.emit('table:status_changed');
    }

    res.status(201).json({ success: true, data: reservation });
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
      guestCount,
      preferredZone: preferredZone || 'Bất kỳ',
      notes: notes || '',
      status: 'waiting'
    });

    const io = req.app.get('socketio');
    if (io) {
      io.emit('waitlist:updated', item);
    }

    res.status(201).json({ success: true, data: item });
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
