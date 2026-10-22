const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const { resetMenuDatabase } = require('../seeds/reset30Dishes');

// Lấy toàn bộ danh mục thực đơn
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách món ăn (có thể lọc theo categoryId hoặc station)
exports.getMenuItems = async (req, res) => {
  try {
    const { categoryId, station } = req.query;
    let filter = {};
    if (categoryId) filter.categoryId = categoryId;
    if (station) filter.station = station;

    const items = await MenuItem.find(filter)
      .populate('categoryId', 'name')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy bảng phân tích giá cost và tỷ suất lợi nhuận từng món ăn (Nhiệm vụ 3)
exports.getMenuCostAnalysis = async (req, res) => {
  try {
    const items = await MenuItem.find().populate('categoryId', 'name');
    const analysis = items.map(item => {
      // 1. Giá vốn (Cost price) lấy từ costPrice (hoặc tính từ recipe)
      let calculatedCost = item.costPrice || 0;
      if (item.recipe && item.recipe.length > 0) {
        const recipeSum = item.recipe.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
        if (recipeSum > 0 && calculatedCost === 0) calculatedCost = recipeSum;
      }

      // 2. Giá bán (Selling price) lấy từ price
      const sellingPrice = item.price || 0;

      // 3. Lợi nhuận gộp: Gross Profit = Giá bán - Giá vốn
      const grossProfit = Math.max(0, sellingPrice - calculatedCost);

      // 4. Biên lợi nhuận gộp (% Margin) = ((Giá bán - Giá vốn) / Giá bán) * 100
      const marginPercent = sellingPrice > 0 ? Number(((grossProfit / sellingPrice) * 100).toFixed(2)) : 0;

      return {
        _id: item._id,
        name: item.name,
        category: item.categoryId?.name || 'Món ăn gia đình',
        price: sellingPrice,
        costPrice: calculatedCost,
        grossProfit,
        marginPercent,
        recipeCount: item.recipe?.length || 0,
        isAvailable: item.isAvailable,
        imageUrl: item.imageUrl
      };
    });

    // Thống kê tổng hợp toàn hệ thống
    const totalMenuPrice = analysis.reduce((sum, item) => sum + item.price, 0);
    const totalMenuCost = analysis.reduce((sum, item) => sum + item.costPrice, 0);
    const totalGrossProfit = totalMenuPrice - totalMenuCost;
    const avgMarginPercent = totalMenuPrice > 0 ? Number(((totalGrossProfit / totalMenuPrice) * 100).toFixed(2)) : 0;

    res.json({
      success: true,
      data: analysis,
      summary: {
        totalItemsCount: analysis.length,
        totalMenuPrice,
        totalMenuCost,
        totalGrossProfit,
        avgMarginPercent
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm món ăn mới (hỗ trợ upload ảnh lên Cloudinary)
exports.createMenuItem = async (req, res) => {
  try {
    const { name, categoryId, price, costPrice, description, station, options, recipe, instructions } = req.body;
    let imageUrl = req.body.imageUrl;
    let cloudinaryPublicId = '';

    if (req.file) {
      imageUrl = req.file.path;
      cloudinaryPublicId = req.file.filename;
    }

    const menuItem = await MenuItem.create({
      name,
      categoryId,
      price: Number(price),
      costPrice: Number(costPrice) || 0,
      description: description || '',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      cloudinaryPublicId,
      station: station || 'kitchen',
      options: options ? (typeof options === 'string' ? JSON.parse(options) : options) : [],
      recipe: recipe ? (typeof recipe === 'string' ? JSON.parse(recipe) : recipe) : [],
      instructions: instructions ? (typeof instructions === 'string' ? JSON.parse(instructions) : instructions) : {}
    });

    res.status(201).json({ success: true, data: menuItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật trạng thái còn món / hết món (1 chạm từ Quản lý kho hoặc POS)
exports.toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });

    item.isAvailable = !item.isAvailable;
    await item.save();

    // Phát sự kiện Socket.IO để POS và KDS tự động cập nhật
    const io = req.app.get('socketio');
    if (io) {
      io.emit('menu:availability_changed', item);
    }

    res.json({
      success: true,
      data: item,
      message: `Đã ${item.isAvailable ? 'mở phục vụ' : 'tạm ngừng phục vụ'} món ${item.name} trên POS`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset toàn bộ thực đơn về 30 món chuẩn (Dọn sạch DB và nạp mới)
exports.reset30Dishes = async (req, res) => {
  try {
    const items = await resetMenuDatabase();
    res.json({
      success: true,
      message: `Đã dọn sạch DB và nạp mới thành công ${items.length} món ăn chuẩn!`,
      data: items
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
