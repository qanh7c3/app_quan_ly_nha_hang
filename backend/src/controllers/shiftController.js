const Shift = require('../models/Shift');
const Invoice = require('../models/Invoice');

// Lấy thông tin ca làm việc hiện tại
exports.getCurrentShift = async (req, res) => {
  try {
    const shift = await Shift.findOne({ status: 'open' }).sort({ createdAt: -1 });
    if (!shift) {
      return res.json({ success: true, data: null, message: 'Chưa có ca làm việc nào đang mở' });
    }

    // Tính tổng tiền mặt và chuyển khoản phát sinh trong ca này
    const invoices = await Invoice.find({
      paymentStatus: 'paid',
      createdAt: { $gte: shift.openingTime }
    });

    let totalCash = 0;
    let totalTransfer = 0;

    invoices.forEach(inv => {
      if (inv.paymentMethod === 'cash') totalCash += inv.finalAmount;
      else if (inv.paymentMethod === 'vietqr') totalTransfer += inv.finalAmount;
      else if (inv.paymentMethod === 'split') {
        totalCash += (inv.splitDetails?.cashAmount || 0);
        totalTransfer += (inv.splitDetails?.transferAmount || 0);
      }
    });

    shift.totalCashCollected = totalCash;
    shift.totalTransferCollected = totalTransfer;
    shift.expectedCashInDrawer = shift.openingCash + totalCash;

    res.json({ success: true, data: shift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mở ca làm việc (nhập tiền lẻ ban đầu)
exports.openShift = async (req, res) => {
  try {
    const { cashierName, openingCash } = req.body;

    // Kiểm tra xem đã có ca nào đang mở chưa
    const existing = await Shift.findOne({ status: 'open' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Đang có ca làm việc chưa kết thúc!' });
    }

    const shift = await Shift.create({
      cashierName: cashierName || 'Thu ngân ca trực',
      openingCash: Number(openingCash) || 0,
      expectedCashInDrawer: Number(openingCash) || 0,
      status: 'open'
    });

    res.status(201).json({ success: true, data: shift, message: 'Mở ca làm việc thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Chốt ca làm việc & bàn giao két tiền
exports.closeShift = async (req, res) => {
  try {
    const { actualCashInDrawer, notes } = req.body;
    const shift = await Shift.findOne({ status: 'open' }).sort({ createdAt: -1 });

    if (!shift) {
      return res.status(404).json({ success: false, message: 'Không có ca nào đang mở để kết ca' });
    }

    // Tính lại doanh thu trong ca
    const invoices = await Invoice.find({
      paymentStatus: 'paid',
      createdAt: { $gte: shift.openingTime }
    });

    let totalCash = 0;
    let totalTransfer = 0;
    invoices.forEach(inv => {
      if (inv.paymentMethod === 'cash') totalCash += inv.finalAmount;
      else if (inv.paymentMethod === 'vietqr') totalTransfer += inv.finalAmount;
      else if (inv.paymentMethod === 'split') {
        totalCash += (inv.splitDetails?.cashAmount || 0);
        totalTransfer += (inv.splitDetails?.transferAmount || 0);
      }
    });

    shift.closingTime = new Date();
    shift.totalCashCollected = totalCash;
    shift.totalTransferCollected = totalTransfer;
    shift.expectedCashInDrawer = shift.openingCash + totalCash;
    shift.actualCashInDrawer = Number(actualCashInDrawer);
    shift.discrepancy = shift.actualCashInDrawer - shift.expectedCashInDrawer;
    shift.status = 'closed';
    shift.notes = notes || '';
    await shift.save();

    res.json({ success: true, data: shift, message: 'Kết thúc ca và bàn giao két tiền thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
