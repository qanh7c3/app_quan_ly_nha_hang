const Inventory = require('../models/Inventory');
const InventoryImport = require('../models/InventoryImport');

// Lấy danh sách toàn bộ kho nguyên vật liệu kèm giá cost
exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ category: 1, name: 1 });
    const lowStockCount = items.filter(i => i.quantityInStock <= i.minThreshold).length;
    res.json({ success: true, data: items, lowStockCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Nhập kho nguyên liệu & Lưu lịch sử nhập hàng
exports.importStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { addQuantity, costPerUnit, supplier, importedBy, notes } = req.body;

    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Nguyên liệu không tồn tại' });

    const qty = Number(addQuantity);
    const unitPrice = costPerUnit ? Number(costPerUnit) : item.costPerUnit;

    item.quantityInStock += qty;
    if (costPerUnit) item.costPerUnit = unitPrice;
    item.lastImportDate = new Date();
    await item.save();

    // Tạo mã phiếu nhập IMP-YYYYMMDD-XXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await InventoryImport.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    const importCode = `IMP-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;

    // Lưu vào bảng lịch sử nhập hàng
    const importRecord = await InventoryImport.create({
      importCode,
      ingredientId: item._id,
      ingredientName: item.name,
      category: item.category,
      quantity: qty,
      unit: item.unit,
      costPerUnit: unitPrice,
      totalCost: qty * unitPrice,
      supplier: supplier || 'Chợ đầu mối / Nhà phân phối thực phẩm',
      importedBy: importedBy || 'Quản lý kho',
      notes: notes || ''
    });

    res.json({
      success: true,
      data: item,
      importRecord,
      message: `Đã nhập thêm ${qty} ${item.unit} ${item.name} vào kho thành công!`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo nguyên vật liệu mới
exports.createIngredient = async (req, res) => {
  try {
    const { name, category, unit, quantityInStock, minThreshold, costPerUnit } = req.body;
    const item = await Inventory.create({
      name,
      category,
      unit,
      quantityInStock: Number(quantityInStock) || 0,
      minThreshold: Number(minThreshold) || 5,
      costPerUnit: Number(costPerUnit) || 0
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy toàn bộ lịch sử nhập hàng
exports.getImportHistory = async (req, res) => {
  try {
    const imports = await InventoryImport.find().sort({ createdAt: -1 });
    const totalSpent = imports.reduce((sum, item) => sum + item.totalCost, 0);
    res.json({ success: true, data: imports, totalSpent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
