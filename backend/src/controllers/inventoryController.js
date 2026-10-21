const Inventory = require('../models/Inventory');

// Lấy danh sách toàn bộ kho nguyên vật liệu
exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ category: 1, name: 1 });
    const lowStockCount = items.filter(i => i.quantityInStock <= i.minThreshold).length;
    res.json({ success: true, data: items, lowStockCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Nhập kho nguyên liệu
exports.importStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { addQuantity, costPerUnit } = req.body;

    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Nguyên liệu không tồn tại' });

    item.quantityInStock += Number(addQuantity);
    if (costPerUnit) item.costPerUnit = Number(costPerUnit);
    item.lastImportDate = new Date();
    await item.save();

    res.json({ success: true, data: item, message: 'Nhập kho thành công' });
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
