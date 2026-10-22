const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const Table = require('../models/Table');
const Inventory = require('../models/Inventory');
const MenuItem = require('../models/MenuItem');

const generateVietQR = (amount, orderCode) => {
  const bankId = process.env.VIETQR_BANK_ID || 'MB';
  const accountNo = process.env.VIETQR_ACCOUNT_NO || '0963769034';
  const accountName = encodeURIComponent(process.env.VIETQR_ACCOUNT_NAME || 'CAO QUOC ANH');
  const addInfo = encodeURIComponent(`TT ${orderCode}`);
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`;
};

// 1. Tạo bản xem trước hóa đơn (hỗ trợ VAT, Member Tier, Phụ thu)
exports.createInvoicePreview = async (req, res) => {
  try {
    const { orderId, discountAmount = 0, vatPercent = 0, memberTier = 'none', surcharge = 0 } = req.body;

    const order = await Order.findById(orderId).populate('tableId', 'tableNumber zone');
    if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });

    const activeItems = order.items.filter(i => i.status !== 'cancelled');
    const subtotal = activeItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    let memberDiscountPercent = 0;
    if (memberTier === 'silver') memberDiscountPercent = 5;
    else if (memberTier === 'gold') memberDiscountPercent = 10;
    else if (memberTier === 'vip') memberDiscountPercent = 15;

    const memberDiscountAmount = Math.round(subtotal * (memberDiscountPercent / 100));
    const totalDiscount = Number(discountAmount) + memberDiscountAmount;

    const taxableAmount = Math.max(0, subtotal - totalDiscount + Number(surcharge));
    const vatAmount = Math.round(taxableAmount * (Number(vatPercent) / 100));
    const finalAmount = taxableAmount + vatAmount;

    const vietQrUrl = generateVietQR(finalAmount, order.orderCode);

    res.json({
      success: true,
      data: {
        order,
        subtotal,
        discountAmount: totalDiscount,
        memberTier,
        memberDiscountAmount,
        surcharge: Number(surcharge),
        vatPercent: Number(vatPercent),
        vatAmount,
        finalAmount,
        vietQrUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Xác nhận thanh toán & Trừ kho tự động theo định lượng
exports.settlePayment = async (req, res) => {
  try {
    const {
      orderId,
      discountAmount = 0,
      memberTier = 'none',
      vatAmount = 0,
      surcharge = 0,
      surchargeReason = '',
      finalAmount,
      paymentMethod = 'cash',
      splitDetails = { cashAmount: 0, transferAmount: 0 },
      cashierId
    } = req.body;

    const order = await Order.findById(orderId).populate('tableId', 'tableNumber zone');
    if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await Invoice.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    const invoiceCode = `INV-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;

    const invoice = await Invoice.create({
      invoiceCode,
      orderId: order._id,
      tableId: order.tableId._id || order.tableId,
      cashierId: cashierId || null,
      subtotal: order.totalAmount,
      discountAmount: Number(discountAmount),
      memberTier,
      vatAmount: Number(vatAmount),
      surcharge: { amount: Number(surcharge), reason: surchargeReason },
      finalAmount: Number(finalAmount) || order.totalAmount,
      paymentMethod,
      splitDetails,
      paymentStatus: 'paid',
      vietQrUrl: (paymentMethod === 'vietqr' || paymentMethod === 'split') ? generateVietQR(finalAmount, order.orderCode) : '',
      paidAt: new Date()
    });

    order.status = 'completed';
    await order.save();

    // Tự động trừ kho nguyên vật liệu theo định lượng (recipe) của từng món
    try {
      for (const item of order.items) {
        if (item.status !== 'cancelled') {
          const menuItem = await MenuItem.findById(item.menuItemId);
          if (menuItem && menuItem.recipe && menuItem.recipe.length > 0) {
            for (const ing of menuItem.recipe) {
              const totalConsumed = ing.amount * item.quantity;
              await Inventory.findOneAndUpdate(
                { name: ing.ingredientName },
                { $inc: { quantityInStock: -totalConsumed } }
              );
            }
          }
        }
      }
    } catch (invErr) {
      console.error('Lỗi tự động trừ kho nguyên vật liệu:', invErr);
    }

    // Giải phóng bàn chính và các bàn ghép
    const tableId = order.tableId._id || order.tableId;
    const table = await Table.findById(tableId);
    if (table) {
      if (table.mergedWith && table.mergedWith.length > 0) {
        await Table.updateMany(
          { _id: { $in: table.mergedWith } },
          { status: 'empty', currentOrderId: null, guestCount: 0 }
        );
      }
      table.status = 'empty';
      table.currentOrderId = null;
      table.guestCount = 0;
      table.mergedWith = [];
      await table.save();
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('table:status_changed', table);
      io.emit('payment:completed', { invoice, table });
    }

    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Thanh toán hoàn tất, bàn đã được giải phóng và kho nguyên liệu đã được trừ tự động!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Lấy toàn bộ lịch sử hóa đơn thanh toán
exports.getAllInvoices = async (req, res) => {
  try {
    const { search, paymentMethod, startDate, endDate } = req.query;
    let filter = { paymentStatus: 'paid' };

    if (paymentMethod && paymentMethod !== 'ALL') {
      filter.paymentMethod = paymentMethod;
    }

    if (search) {
      filter.$or = [
        { invoiceCode: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      filter.paidAt = {};
      if (startDate) filter.paidAt.$gte = new Date(startDate);
      if (endDate) filter.paidAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    const invoices = await Invoice.find(filter)
      .populate('tableId', 'tableNumber zone')
      .populate({
        path: 'orderId',
        populate: { path: 'items.menuItemId', select: 'name price imageUrl' }
      })
      .sort({ paidAt: -1, createdAt: -1 });

    res.json({ success: true, data: invoices, total: invoices.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
