const Utility = require('../models/Utility');

// Lấy danh sách ghi nhận số điện nước
exports.getUtilities = async (req, res) => {
  try {
    const records = await Utility.find().sort({ createdAt: -1 });
    const totalElectricCost = records.reduce((sum, r) => sum + r.electricity.totalAmount, 0);
    const totalWaterCost = records.reduce((sum, r) => sum + r.water.totalAmount, 0);
    const totalBills = records.reduce((sum, r) => sum + r.totalBill, 0);

    res.json({
      success: true,
      data: records,
      summary: {
        totalElectricCost,
        totalWaterCost,
        totalBills
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ghi nhận chỉ số điện nước mới
exports.createUtilityRecord = async (req, res) => {
  try {
    const {
      monthYear,
      elecOldIndex,
      elecNewIndex,
      elecUnitPrice = 3500,
      waterOldIndex,
      waterNewIndex,
      waterUnitPrice = 25000,
      recordedBy,
      notes
    } = req.body;

    const elecConsumed = Math.max(0, Number(elecNewIndex) - Number(elecOldIndex));
    const elecTotal = elecConsumed * Number(elecUnitPrice);

    const waterConsumed = Math.max(0, Number(waterNewIndex) - Number(waterOldIndex));
    const waterTotal = waterConsumed * Number(waterUnitPrice);

    const totalBill = elecTotal + waterTotal;

    const record = await Utility.create({
      monthYear: monthYear || `${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
      electricity: {
        oldIndex: Number(elecOldIndex),
        newIndex: Number(elecNewIndex),
        consumed: elecConsumed,
        unitPrice: Number(elecUnitPrice),
        totalAmount: elecTotal
      },
      water: {
        oldIndex: Number(waterOldIndex),
        newIndex: Number(waterNewIndex),
        consumed: waterConsumed,
        unitPrice: Number(waterUnitPrice),
        totalAmount: waterTotal
      },
      totalBill,
      paymentStatus: 'paid',
      recordedBy: recordedBy || 'Quản lý',
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      data: record,
      message: 'Ghi nhận chỉ số điện nước thành công!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
