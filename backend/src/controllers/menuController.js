const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');

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
      .sort({ createdAt: -1 });

    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy bảng phân tích giá cost và tỷ suất lợi nhuận từng món ăn
exports.getMenuCostAnalysis = async (req, res) => {
  try {
    const items = await MenuItem.find().populate('categoryId', 'name');
    const analysis = items.map(item => {
      // Tính giá cost từ recipe nếu có
      let calculatedCost = item.costPrice || 0;
      if (item.recipe && item.recipe.length > 0) {
        const recipeSum = item.recipe.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
        if (recipeSum > 0) calculatedCost = recipeSum;
      }
      const grossProfit = Math.max(0, item.price - calculatedCost);
      const marginPercent = item.price > 0 ? Math.round((grossProfit / item.price) * 100) : 0;

      return {
        _id: item._id,
        name: item.name,
        category: item.categoryId?.name || 'Khác',
        price: item.price,
        costPrice: calculatedCost,
        grossProfit,
        marginPercent,
        recipeCount: item.recipe?.length || 0,
        isAvailable: item.isAvailable
      };
    });

    res.json({ success: true, data: analysis });
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

// Cập nhật trạng thái còn món / hết món
exports.toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn' });

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
