const Order = require('../models/Order');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const AuditLog = require('../models/AuditLog');

// 1. Tạo đơn hàng mới hoặc thêm món vào bàn
exports.createOrUpdateOrder = async (req, res) => {
  try {
    const { tableId, items, generalNote, staffId, guestCount } = req.body;

    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Bàn không tồn tại' });
    }

    let order;
    if (table.currentOrderId && table.status === 'occupied') {
      order = await Order.findById(table.currentOrderId);
    }

    if (!order || order.status !== 'active') {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const countToday = await Order.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      });
      const orderCode = `ORD-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;

      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      order = await Order.create({
        orderCode,
        tableId,
        staffId: staffId || null,
        guestCount: Number(guestCount) || table.guestCount || 2,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions || [],
          note: item.note || '',
          status: 'pending'
        })),
        totalAmount,
        generalNote: generalNote || '',
        status: 'active'
      });

      table.status = 'occupied';
      table.currentOrderId = order._id;
      table.guestCount = order.guestCount;
      await table.save();
    } else {
      const newItemsFormatted = items.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions || [],
        note: item.note || '',
        status: 'pending'
      }));

      order.items.push(...newItemsFormatted);
      order.totalAmount = order.items.reduce((sum, item) => {
        return item.status !== 'cancelled' ? sum + (item.price * item.quantity) : sum;
      }, 0);
      if (generalNote) order.generalNote = generalNote;
      if (guestCount) order.guestCount = Number(guestCount);
      await order.save();
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('tableId', 'tableNumber zone')
      .populate('items.menuItemId', 'name imageUrl station');

    const io = req.app.get('socketio');
    if (io) {
      io.emit('order:created', populatedOrder);
      io.emit('table:status_changed', table);
    }

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Chuyển bàn (Transfer Table)
exports.transferTable = async (req, res) => {
  try {
    const { fromTableId, toTableId, reason, performedBy } = req.body;

    const fromTable = await Table.findById(fromTableId);
    const toTable = await Table.findById(toTableId);

    if (!fromTable || !toTable) {
      return res.status(404).json({ success: false, message: 'Bàn chuyển hoặc bàn đến không tồn tại' });
    }

    if (!fromTable.currentOrderId) {
      return res.status(400).json({ success: false, message: 'Bàn hiện tại không có đơn hàng đang hoạt động' });
    }

    if (toTable.status === 'occupied') {
      return res.status(400).json({ success: false, message: 'Bàn đến đang có khách, vui lòng chọn bàn khác hoặc ghép bàn' });
    }

    const orderId = fromTable.currentOrderId;
    const order = await Order.findById(orderId);

    // Cập nhật order sang bàn mới
    order.tableId = toTable._id;
    order.actionHistory.push({
      action: 'TRANSFER_TABLE',
      note: `Chuyển từ ${fromTable.tableNumber} sang ${toTable.tableNumber}. Lý do: ${reason || 'Khách yêu cầu'}`,
      performedBy: performedBy || 'Phục vụ'
    });
    await order.save();

    // Cập nhật trạng thái 2 bàn
    toTable.status = 'occupied';
    toTable.currentOrderId = orderId;
    toTable.guestCount = fromTable.guestCount;
    await toTable.save();

    fromTable.status = 'empty';
    fromTable.currentOrderId = null;
    fromTable.guestCount = 0;
    await fromTable.save();

    // Ghi Audit Log
    await AuditLog.create({
      action: 'TRANSFER_TABLE',
      performedBy: performedBy || 'Phục vụ',
      reason: reason || 'Khách yêu cầu chuyển bàn',
      details: { fromTable: fromTable.tableNumber, toTable: toTable.tableNumber, orderCode: order.orderCode }
    });

    const io = req.app.get('socketio');
    if (io) {
      io.emit('table:status_changed');
      io.emit('order:transferred', { fromTable, toTable, order });
    }

    res.json({ success: true, message: `Đã chuyển đơn từ ${fromTable.tableNumber} sang ${toTable.tableNumber}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Ghép bàn (Merge Tables)
exports.mergeTables = async (req, res) => {
  try {
    const { primaryTableId, secondaryTableId, performedBy } = req.body;

    const primaryTable = await Table.findById(primaryTableId);
    const secondaryTable = await Table.findById(secondaryTableId);

    if (!primaryTable || !secondaryTable) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bàn cần ghép' });
    }

    // Nếu bàn phụ cũng có order -> gom món của bàn phụ vào bàn chính
    if (secondaryTable.currentOrderId && secondaryTable.currentOrderId.toString() !== primaryTable.currentOrderId?.toString()) {
      const secOrder = await Order.findById(secondaryTable.currentOrderId);
      const priOrder = await Order.findById(primaryTable.currentOrderId);

      if (secOrder && priOrder) {
        priOrder.items.push(...secOrder.items);
        priOrder.totalAmount += secOrder.totalAmount;
        priOrder.guestCount += secOrder.guestCount;
        priOrder.actionHistory.push({
          action: 'MERGE_TABLES',
          note: `Ghép món từ ${secondaryTable.tableNumber} vào ${primaryTable.tableNumber}`,
          performedBy: performedBy || 'Phục vụ'
        });
        await priOrder.save();

        secOrder.status = 'cancelled';
        await secOrder.save();
      }
    }

    // Đánh dấu bàn chính có liên kết ghép với bàn phụ
    primaryTable.mergedWith.push(secondaryTable._id);
    await primaryTable.save();

    // Bàn phụ chuyển sang trạng thái occupied và trỏ chung order
    secondaryTable.status = 'occupied';
    secondaryTable.currentOrderId = primaryTable.currentOrderId;
    await secondaryTable.save();

    await AuditLog.create({
      action: 'MERGE_TABLES',
      performedBy: performedBy || 'Phục vụ',
      reason: 'Ghép bàn đoàn khách đông',
      details: { primaryTable: primaryTable.tableNumber, secondaryTable: secondaryTable.tableNumber }
    });

    const io = req.app.get('socketio');
    if (io) {
      io.emit('table:status_changed');
    }

    res.json({ success: true, message: `Ghép thành công ${secondaryTable.tableNumber} vào ${primaryTable.tableNumber}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Hủy món ăn có kiểm soát (Kiểm tra nếu Bếp đang nấu -> Bắt buộc Quản lý duyệt)
exports.cancelOrderItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { reason, performedBy, approvedBy } = req.body;

    const order = await Order.findById(orderId).populate('tableId', 'tableNumber');
    if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });

    const item = order.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Món ăn không tồn tại trong đơn' });

    // Nếu món đang cooking hoặc ready -> Yêu cầu lý do và người duyệt
    if (item.status === 'cooking' || item.status === 'ready') {
      if (!reason) {
        return res.status(400).json({
          success: false,
          requireManagerApproval: true,
          message: 'Món đang được Bếp chế biến. Bắt buộc phải có lý do và sự phê duyệt của Quản lý để hủy món!'
        });
      }

      await AuditLog.create({
        action: 'CANCEL_COOKING_ITEM',
        performedBy: performedBy || 'Phục vụ',
        approvedBy: approvedBy || 'Quản lý',
        targetType: 'Order',
        targetId: orderId,
        reason: reason,
        details: { itemName: item.name, price: item.price, quantity: item.quantity, table: order.tableId?.tableNumber }
      });
    }

    item.status = 'cancelled';
    order.totalAmount = order.items.reduce((sum, i) => i.status !== 'cancelled' ? sum + (i.price * i.quantity) : sum, 0);
    order.actionHistory.push({
      action: 'CANCEL_ITEM',
      note: `Hủy món ${item.name} (${item.quantity}). Lý do: ${reason || 'Khách đổi ý'}`,
      performedBy: performedBy || 'Nhân viên'
    });
    await order.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('order:item_cancelled', { orderId, itemId, itemName: item.name, tableNumber: order.tableId?.tableNumber });
      io.emit('order:created', order);
    }

    res.json({ success: true, message: `Đã hủy món ${item.name}`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Bếp cập nhật trạng thái món: pending -> cooking -> ready -> served
exports.updateOrderItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId).populate('tableId', 'tableNumber zone');
    if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });

    const item = order.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Món không tồn tại' });

    item.status = status;
    if (status === 'cooking') item.cookingStartTime = new Date();
    if (status === 'ready') item.readyTime = new Date();

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('tableId', 'tableNumber zone')
      .populate('items.menuItemId', 'name imageUrl station');

    const io = req.app.get('socketio');
    if (io) {
      io.emit('kitchen:item_status_changed', { orderId, itemId, status, order: populatedOrder });

      // Nếu món đã hoàn thành ('ready') -> Bắn thông báo khẩn tới máy Phục vụ
      if (status === 'ready') {
        io.emit('order:item_ready', {
          orderId,
          tableName: order.tableId?.tableNumber,
          itemName: item.name,
          quantity: item.quantity,
          message: `🔔 Món [${item.name}] của [${order.tableId?.tableNumber}] đã sẵn sàng tại quầy ra đồ! Vui lòng bê ra bàn ngay!`
        });
      }
    }

    res.json({ success: true, data: populatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Bếp Báo Hết Món Khẩn Cấp (86ing / Emergency Out of Stock)
exports.emergencyOutOfStock = async (req, res) => {
  try {
    const { menuItemId, reason, performedBy } = req.body;

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) return res.status(404).json({ success: false, message: 'Món không tồn tại' });

    menuItem.isAvailable = false;
    await menuItem.save();

    await AuditLog.create({
      action: 'EMERGENCY_OUT_OF_STOCK',
      performedBy: performedBy || 'Đầu bếp',
      targetType: 'MenuItem',
      targetId: menuItemId,
      reason: reason || 'Bếp hết nguyên vật liệu đột xuất trong ca',
      details: { itemName: menuItem.name }
    });

    // Bắn sự kiện thời gian thực khóa món trên máy của tất cả nhân viên phục vụ
    const io = req.app.get('socketio');
    if (io) {
      io.emit('menu:item_out_of_stock', {
        menuItemId,
        itemName: menuItem.name,
        message: `⚠️ BẾP BÁO HẾT MÓN: [${menuItem.name}] đã hết nguyên liệu. Không nhận order món này!`
      });
    }

    res.json({ success: true, message: `Đã khóa món ${menuItem.name} trên toàn hệ thống`, data: menuItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách các đơn đang hoạt động cho Bếp (KDS)
exports.getActiveKitchenOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'active' })
      .populate('tableId', 'tableNumber zone')
      .populate('items.menuItemId', 'name imageUrl station')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết order theo tableId
exports.getOrderByTableId = async (req, res) => {
  try {
    const { tableId } = req.params;
    const order = await Order.findOne({ tableId, status: 'active' })
      .populate('tableId', 'tableNumber zone')
      .populate('items.menuItemId', 'name price imageUrl station');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không có đơn hàng active cho bàn này' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
