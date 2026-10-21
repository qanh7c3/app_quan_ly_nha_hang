const Invoice = require('../models/Invoice');
const Order = require('../models/Order');

// Thống kê doanh thu tổng quan và món bán chạy
exports.getOverviewStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Doanh thu hôm nay
    const todayInvoices = await Invoice.find({
      paymentStatus: 'paid',
      createdAt: { $gte: today }
    });

    const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
    const todayOrdersCount = todayInvoices.length;

    // 2. Doanh thu tổng từ trước đến nay
    const allInvoices = await Invoice.find({ paymentStatus: 'paid' });
    const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0);

    // 3. Top món ăn bán chạy nhất
    const topItemsPipeline = [
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 6 }
    ];

    const topItems = await Order.aggregate(topItemsPipeline);

    // 4. Doanh thu 7 ngày gần nhất
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentInvoices = await Invoice.find({
      paymentStatus: 'paid',
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        todayRevenue,
        todayOrdersCount,
        totalRevenue,
        totalInvoicesCount: allInvoices.length,
        topItems,
        recentInvoices
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
