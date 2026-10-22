require('dotenv').config();
const mongoose = require('mongoose');
const Table = require('../models/Table');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const InventoryImport = require('../models/InventoryImport');
const Reservation = require('../models/Reservation');
const Utility = require('../models/Utility');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');

const seedDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant_db');
    console.log(`✅ Kết nối MongoDB: ${conn.connection.host}`);

    // Dọn dẹp dữ liệu cũ
    await Table.deleteMany({});
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    await User.deleteMany({});
    await Inventory.deleteMany({});
    await InventoryImport.deleteMany({});
    await Reservation.deleteMany({});
    await Utility.deleteMany({});
    await Order.deleteMany({});
    await Invoice.deleteMany({});
    console.log('🧹 Đã dọn dẹp dữ liệu cũ');

    // 1. Tạo 5 tài khoản mẫu cho 5 vai trò
    await User.create([
      { name: 'Hoàng Lễ Tân', email: 'letan@nhahang.com', password: 'password123', role: 'waiter', phone: '0901111111' },
      { name: 'Lê Văn Phục Vụ', email: 'phucvu@nhahang.com', password: 'password123', role: 'waiter', phone: '0902222222' },
      { name: 'Nguyễn Bếp Trưởng', email: 'bep@nhahang.com', password: 'password123', role: 'kitchen', phone: '0903333333' },
      { name: 'Trần Thu Ngân', email: 'thungan@nhahang.com', password: 'password123', role: 'cashier', phone: '0904444444' },
      { name: 'Phạm Tổng Quản Lý', email: 'quanly@nhahang.com', password: 'password123', role: 'admin', phone: '0905555555' }
    ]);
    console.log('👤 Đã tạo 5 tài khoản mẫu');

    // 2. Tạo kho nguyên vật liệu phong phú (thịt, cá, rau, gia vị đơn lẻ, đồ uống)
    const ingredients = [
      { name: 'Thịt bò Úc', category: 'Thịt/Hải sản', unit: 'kg', quantityInStock: 35, minThreshold: 8, costPerUnit: 280000 },
      { name: 'Thịt gà ta', category: 'Thịt/Hải sản', unit: 'kg', quantityInStock: 25, minThreshold: 5, costPerUnit: 120000 },
      { name: 'Sườn non heo', category: 'Thịt/Hải sản', unit: 'kg', quantityInStock: 30, minThreshold: 6, costPerUnit: 160000 },
      { name: 'Thịt ba chỉ heo', category: 'Thịt/Hải sản', unit: 'kg', quantityInStock: 20, minThreshold: 5, costPerUnit: 140000 },
      { name: 'Tôm sú tươi', category: 'Thịt/Hải sản', unit: 'kg', quantityInStock: 22, minThreshold: 5, costPerUnit: 240000 },
      { name: 'Mực trứng sống', category: 'Thịt/Hải sản', unit: 'kg', quantityInStock: 18, minThreshold: 4, costPerUnit: 210000 },
      { name: 'Cá hồi phi lê', category: 'Thịt/Hải sản', unit: 'kg', quantityInStock: 12, minThreshold: 3, costPerUnit: 360000 },
      { name: 'Ngao hai cùi', category: 'Thịt/Hải sản', unit: 'kg', quantityInStock: 28, minThreshold: 6, costPerUnit: 90000 },

      { name: 'Rau muống cọng', category: 'Rau củ', unit: 'kg', quantityInStock: 25, minThreshold: 6, costPerUnit: 18000 },
      { name: 'Xà lách xoăn', category: 'Rau củ', unit: 'kg', quantityInStock: 15, minThreshold: 4, costPerUnit: 25000 },
      { name: 'Cà chua bi', category: 'Rau củ', unit: 'kg', quantityInStock: 16, minThreshold: 4, costPerUnit: 30000 },
      { name: 'Nấm kim châm', category: 'Rau củ', unit: 'gói', quantityInStock: 60, minThreshold: 15, costPerUnit: 12000 },
      { name: 'Khoai tây củ', category: 'Rau củ', unit: 'kg', quantityInStock: 45, minThreshold: 10, costPerUnit: 22000 },
      { name: 'Hành tây Đà Lạt', category: 'Rau củ', unit: 'kg', quantityInStock: 30, minThreshold: 6, costPerUnit: 20000 },

      { name: 'Tỏi Lý Sơn', category: 'Gia vị/Đồ khô', unit: 'kg', quantityInStock: 12, minThreshold: 3, costPerUnit: 85000 },
      { name: 'Gừng tươi', category: 'Gia vị/Đồ khô', unit: 'kg', quantityInStock: 10, minThreshold: 2, costPerUnit: 35000 },
      { name: 'Sả cây tươi', category: 'Gia vị/Đồ khô', unit: 'kg', quantityInStock: 15, minThreshold: 3, costPerUnit: 25000 },
      { name: 'Ớt hiểm đỏ', category: 'Gia vị/Đồ khô', unit: 'kg', quantityInStock: 8, minThreshold: 2, costPerUnit: 45000 },
      { name: 'Tiêu đen Phú Quốc', category: 'Gia vị/Đồ khô', unit: 'kg', quantityInStock: 10, minThreshold: 2, costPerUnit: 190000 },
      { name: 'Nước mắm cá cơm', category: 'Gia vị/Đồ khô', unit: 'lít', quantityInStock: 30, minThreshold: 5, costPerUnit: 55000 },
      { name: 'Dầu ăn Simply', category: 'Gia vị/Đồ khô', unit: 'lít', quantityInStock: 40, minThreshold: 8, costPerUnit: 42000 },
      { name: 'Đường cát trắng', category: 'Gia vị/Đồ khô', unit: 'kg', quantityInStock: 50, minThreshold: 10, costPerUnit: 23000 },
      { name: 'Hạt nêm Knorr', category: 'Gia vị/Đồ khô', unit: 'kg', quantityInStock: 25, minThreshold: 5, costPerUnit: 68000 },
      { name: 'Bơ thực vật Tường An', category: 'Gia vị/Đồ khô', unit: 'hộp', quantityInStock: 30, minThreshold: 6, costPerUnit: 32000 },
      { name: 'Phô mai Mozzarella', category: 'Gia vị/Đồ khô', unit: 'kg', quantityInStock: 14, minThreshold: 3, costPerUnit: 185000 },

      { name: 'Đào ngâm đóng hộp', category: 'Đồ uống/Bia', unit: 'lon', quantityInStock: 50, minThreshold: 10, costPerUnit: 36000 },
      { name: 'Bia Heineken lon', category: 'Đồ uống/Bia', unit: 'lon', quantityInStock: 150, minThreshold: 24, costPerUnit: 18500 },
      { name: 'Bia Tiger Crystal', category: 'Đồ uống/Bia', unit: 'lon', quantityInStock: 120, minThreshold: 24, costPerUnit: 17500 },
      { name: 'Nước ngọt Coca-Cola', category: 'Đồ uống/Bia', unit: 'lon', quantityInStock: 100, minThreshold: 24, costPerUnit: 9500 }
    ];

    const createdIngs = await Inventory.create(ingredients);
    console.log(`📦 Đã tạo ${createdIngs.length} nguyên vật liệu và gia vị đơn lẻ`);

    // Tạo lịch sử nhập hàng mẫu
    await InventoryImport.create([
      {
        importCode: 'IMP-20261020-001',
        ingredientId: createdIngs[0]._id,
        ingredientName: 'Thịt bò Úc',
        category: 'Thịt/Hải sản',
        quantity: 20,
        unit: 'kg',
        costPerUnit: 280000,
        totalCost: 5600000,
        supplier: 'Công ty Thực phẩm Sạch VinaBeef',
        importedBy: 'Quản lý kho'
      },
      {
        importCode: 'IMP-20261021-002',
        ingredientId: createdIngs[4]._id,
        ingredientName: 'Tôm sú tươi',
        category: 'Thịt/Hải sản',
        quantity: 15,
        unit: 'kg',
        costPerUnit: 240000,
        totalCost: 3600000,
        supplier: 'Hải Sản Tươi Sống Biển Đông',
        importedBy: 'Quản lý kho'
      },
      {
        importCode: 'IMP-20261021-003',
        ingredientId: createdIngs[26]._id,
        ingredientName: 'Bia Heineken lon',
        category: 'Đồ uống/Bia',
        quantity: 120,
        unit: 'lon',
        costPerUnit: 18500,
        totalCost: 2220000,
        supplier: 'Đại lý Bia Nước Ngọt Thành Đạt',
        importedBy: 'Thu ngân ca sáng'
      }
    ]);
    console.log('📑 Đã tạo lịch sử nhập hàng');

    // 3. Tạo 22 Bàn ăn chia đều 4 khu vực, sức chứa > 200 người
    const tablesData = [
      // Tầng 1 (Khu Trong Nhà): 6 bàn = 36 khách
      { tableNumber: 'Bàn 01', zone: 'Tầng 1 (Trong nhà)', capacity: 4, status: 'empty' },
      { tableNumber: 'Bàn 02', zone: 'Tầng 1 (Trong nhà)', capacity: 4, status: 'empty' },
      { tableNumber: 'Bàn 03', zone: 'Tầng 1 (Trong nhà)', capacity: 6, status: 'empty' },
      { tableNumber: 'Bàn 04', zone: 'Tầng 1 (Trong nhà)', capacity: 6, status: 'empty' },
      { tableNumber: 'Bàn 05', zone: 'Tầng 1 (Trong nhà)', capacity: 8, status: 'empty' },
      { tableNumber: 'Bàn 06', zone: 'Tầng 1 (Trong nhà)', capacity: 8, status: 'empty' },

      // Tầng 2 (Phòng Máy Lạnh): 6 bàn = 36 khách
      { tableNumber: 'Bàn 07', zone: 'Tầng 2 (Phòng Lạnh)', capacity: 4, status: 'empty' },
      { tableNumber: 'Bàn 08', zone: 'Tầng 2 (Phòng Lạnh)', capacity: 4, status: 'empty' },
      { tableNumber: 'Bàn 09', zone: 'Tầng 2 (Phòng Lạnh)', capacity: 6, status: 'empty' },
      { tableNumber: 'Bàn 10', zone: 'Tầng 2 (Phòng Lạnh)', capacity: 6, status: 'empty' },
      { tableNumber: 'Bàn 11', zone: 'Tầng 2 (Phòng Lạnh)', capacity: 8, status: 'empty' },
      { tableNumber: 'Bàn 12', zone: 'Tầng 2 (Phòng Lạnh)', capacity: 8, status: 'empty' },

      // Sân Vườn (Ngoài Trời): 6 bàn = 48 khách
      { tableNumber: 'Bàn 13', zone: 'Sân Vườn (Ngoài trời)', capacity: 6, status: 'empty' },
      { tableNumber: 'Bàn 14', zone: 'Sân Vườn (Ngoài trời)', capacity: 6, status: 'empty' },
      { tableNumber: 'Bàn 15', zone: 'Sân Vườn (Ngoài trời)', capacity: 8, status: 'empty' },
      { tableNumber: 'Bàn 16', zone: 'Sân Vườn (Ngoài trời)', capacity: 8, status: 'empty' },
      { tableNumber: 'Bàn 17', zone: 'Sân Vườn (Ngoài trời)', capacity: 10, status: 'empty' },
      { tableNumber: 'Bàn 18', zone: 'Sân Vườn (Ngoài trời)', capacity: 10, status: 'empty' },

      // Phòng VIP (Tiệc riêng tư): 4 phòng = 85 khách
      { tableNumber: 'VIP 1 - Hoàng Gia', zone: 'Phòng VIP', capacity: 15, status: 'empty' },
      { tableNumber: 'VIP 2 - Sen Vàng', zone: 'Phòng VIP', capacity: 15, status: 'empty' },
      { tableNumber: 'VIP 3 - Trống Đồng', zone: 'Phòng VIP', capacity: 20, status: 'empty' },
      { tableNumber: 'VIP 4 - Đại Tiệc Hội Nghị', zone: 'Phòng VIP', capacity: 35, status: 'empty' }
    ];

    const createdTables = await Table.create(tablesData);
    const totalCapacity = createdTables.reduce((sum, t) => sum + t.capacity, 0);
    console.log(`🪑 Đã tạo ${createdTables.length} bàn ăn với tổng sức chứa: ${totalCapacity} khách (vượt mức 200 người)`);

    // 4. Tạo danh mục món ăn
    const categories = await Category.create([
      { name: 'Khai Vị & Salad', slug: 'khai-vi', sortOrder: 1 },
      { name: 'Bò & Thịt Nướng Đặc Sản', slug: 'bo-thit-nuong', sortOrder: 2 },
      { name: 'Gà & Heo Giòn Rụm', slug: 'ga-heo', sortOrder: 3 },
      { name: 'Hải Sản Tươi Sống', slug: 'hai-san', sortOrder: 4 },
      { name: 'Lẩu & Cơm Niêu', slug: 'lau-com', sortOrder: 5 },
      { name: 'Đồ Uống & Tráng Miệng', slug: 'do-uong', sortOrder: 6 }
    ]);
    const [cKhaiVi, cBo, cGaHeo, cHaiSan, cLau, cDoUong] = categories;

    // 5. Tạo 25 món ăn kèm công thức và định lượng chi tiết cho Đầu bếp
    const menu25 = [
      // 1-4: Khai vị
      {
        name: 'Gỏi Ngó Sen Tôm Thịt',
        categoryId: cKhaiVi._id,
        price: 95000,
        costPrice: 42000,
        description: 'Ngó sen giòn rụm kết hợp tôm sú và thịt ba chỉ luộc, chấm mắm chua ngọt',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Tôm sú tươi', amount: 0.1, unit: 'kg', estimatedCost: 24000 },
          { ingredientName: 'Thịt ba chỉ heo', amount: 0.08, unit: 'kg', estimatedCost: 11200 },
          { ingredientName: 'Nước mắm cá cơm', amount: 0.03, unit: 'lít', estimatedCost: 1650 },
          { ingredientName: 'Ớt hiểm đỏ', amount: 0.02, unit: 'kg', estimatedCost: 900 }
        ],
        instructions: {
          preparation: 'Ngó sen chẻ đôi ngâm nước đá pha chanh 15 phút. Tôm bóc vỏ luộc chín, thịt ba chỉ luộc thái mỏng.',
          seasoning: 'Pha nước mắm: 2 muỗng nước mắm, 2 muỗng đường, 1 muỗng nước cốt chanh, ớt tỏi băm nhuyễn.',
          cookingSteps: 'Trộn đều ngó sen, tôm, thịt, rau răm và rưới nước mắm chua ngọt, đảo nhẹ tay cho thấm vị.',
          presentation: 'Bày ra đĩa tròn, rắc hành phi và đậu phộng rang vàng lên trên, trang trí ớt tỉa hoa.'
        }
      },
      {
        name: 'Salad Hoàng Đế Cá Hồi',
        categoryId: cKhaiVi._id,
        price: 145000,
        costPrice: 65000,
        description: 'Xà lách xoăn, cá hồi tươi áp chảo, cà chua bi sốt kem béo ngậy',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Cá hồi phi lê', amount: 0.12, unit: 'kg', estimatedCost: 43200 },
          { ingredientName: 'Xà lách xoăn', amount: 0.15, unit: 'kg', estimatedCost: 3750 },
          { ingredientName: 'Cà chua bi', amount: 0.08, unit: 'kg', estimatedCost: 2400 },
          { ingredientName: 'Bơ thực vật Tường An', amount: 0.02, unit: 'hộp', estimatedCost: 1500 }
        ],
        instructions: {
          preparation: 'Cá hồi thái con chì vuông 2cm. Xà lách và cà chua bi rửa sạch để ráo.',
          seasoning: 'Ướp cá hồi với chút muối tiêu và dầu ô liu 5 phút.',
          cookingSteps: 'Áp chảo cá hồi trên chảo nóng với bơ 2 phút mỗi mặt cho xém vàng cạnh.',
          presentation: 'Trộn xà lách sốt kem, đặt cá hồi lên trên cùng cà chua bi cắt đôi.'
        }
      },
      {
        name: 'Khoai Tây Chiên Bơ Tỏi',
        categoryId: cKhaiVi._id,
        price: 55000,
        costPrice: 18000,
        description: 'Khoai tây vàng giòn lắc bơ tỏi thơm lừng',
        imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Khoai tây củ', amount: 0.35, unit: 'kg', estimatedCost: 7700 },
          { ingredientName: 'Bơ thực vật Tường An', amount: 0.05, unit: 'hộp', estimatedCost: 3200 },
          { ingredientName: 'Tỏi Lý Sơn', amount: 0.03, unit: 'kg', estimatedCost: 2550 },
          { ingredientName: 'Dầu ăn Simply', amount: 0.08, unit: 'lít', estimatedCost: 3360 }
        ],
        instructions: {
          preparation: 'Khoai tây gọt vỏ thái con chì dày 1cm, luộc sơ nước muối 3 phút rồi để ráo lạnh.',
          seasoning: 'Tỏi băm phi vàng thơm với bơ để riêng.',
          cookingSteps: 'Chiên khoai ngập dầu 180°C trong 6 phút đến khi giòn rụm, vớt ra xóc với sốt bơ tỏi.',
          presentation: 'Đổ ra rổ tre lót giấy thấm dầu, chấm kèm tương ớt hoặc sốt mayonnaise.'
        }
      },
      {
        name: 'Ngao Hai Cùi Hấp Xả Ớt',
        categoryId: cKhaiVi._id,
        price: 110000,
        costPrice: 48000,
        description: 'Ngao biển tươi béo ngọt hấp sả ớt nước dừa cay the ấm bụng',
        imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Ngao hai cùi', amount: 0.5, unit: 'kg', estimatedCost: 45000 },
          { ingredientName: 'Sả cây tươi', amount: 0.05, unit: 'kg', estimatedCost: 1250 },
          { ingredientName: 'Ớt hiểm đỏ', amount: 0.02, unit: 'kg', estimatedCost: 900 }
        ],
        instructions: {
          preparation: 'Ngao ngâm nước vo gạo và ớt cắt lát 30 phút để nhả hết cát. Sả đập dập cắt khúc.',
          seasoning: 'Cho sả lót đáy nồi, thêm 1 muỗng hạt nêm, 1 muỗng đường, ớt hiểm đập dập.',
          cookingSteps: 'Đun lửa to đậy vung 4-5 phút đến khi ngao vừa mở miệng đều thì tắt bếp ngay.',
          presentation: 'Bê nguyên nồi đất nóng hổi ra bàn, ăn nóng kèm nước mắm gừng ớt.'
        }
      },

      // 5-9: Bò & Thịt Nướng
      {
        name: 'Bò Lúc Lắc Khoai Tây Phô Mai',
        categoryId: cBo._id,
        price: 185000,
        costPrice: 78000,
        description: 'Thịt bò Úc mềm mọng sốt tiêu đen kèm khoai tây vàng và phô mai kéo sợi',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt bò Úc', amount: 0.22, unit: 'kg', estimatedCost: 61600 },
          { ingredientName: 'Khoai tây củ', amount: 0.15, unit: 'kg', estimatedCost: 3300 },
          { ingredientName: 'Hành tây Đà Lạt', amount: 0.05, unit: 'kg', estimatedCost: 1000 },
          { ingredientName: 'Phô mai Mozzarella', amount: 0.04, unit: 'kg', estimatedCost: 7400 }
        ],
        instructions: {
          preparation: 'Bò thái khối vuông 2.5cm, hành tây cắt quân cờ. Khoai tây chiên vàng giòn.',
          seasoning: 'Ướp bò với dầu hào, tỏi băm, tiêu đen, 1 muỗng xì dầu trong 15 phút.',
          cookingSteps: 'Bật lửa cực lớn, xào bò nhanh tay trong 2 phút (chín tái mềm), cho hành tây và phô mai vào đảo tan chảy.',
          presentation: 'Bày ra đĩa gang nóng, rắc tiêu đen thơm nức mũi.'
        }
      },
      {
        name: 'Dẻ Sườn Bò Nướng Sốt BBQ',
        categoryId: cBo._id,
        price: 245000,
        costPrice: 95000,
        description: 'Dẻ sườn bò nướng than hoa vàng ươm tẩm sốt BBQ kiểu Mỹ đậm đà',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt bò Úc', amount: 0.3, unit: 'kg', estimatedCost: 84000 },
          { ingredientName: 'Tỏi Lý Sơn', amount: 0.03, unit: 'kg', estimatedCost: 2550 },
          { ingredientName: 'Tiêu đen Phú Quốc', amount: 0.01, unit: 'kg', estimatedCost: 1900 }
        ],
        instructions: {
          preparation: 'Khía nhẹ trên thớ thịt sườn để thấm đều sốt BBQ.',
          seasoning: 'Quết sốt BBQ, tỏi băm, mật ong, tiêu đen ủ lạnh ít nhất 1 tiếng.',
          cookingSteps: 'Nướng than hoa đỏ rực mỗi mặt 4-5 phút, vừa nướng vừa quét thêm sốt.',
          presentation: 'Chặt miếng vừa ăn, xếp xòe nan quạt kèm kim chi và xà lách xoăn.'
        }
      },
      {
        name: 'Bò Tơ Nướng Tảng Chấm Muối Kiến',
        categoryId: cBo._id,
        price: 260000,
        costPrice: 110000,
        description: 'Thịt bò tơ mềm ngọt nướng nguyên tảng giữ trọn nước thịt, chấm muối kiến vàng',
        imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt bò Úc', amount: 0.35, unit: 'kg', estimatedCost: 98000 },
          { ingredientName: 'Sả cây tươi', amount: 0.05, unit: 'kg', estimatedCost: 1250 }
        ],
        instructions: {
          preparation: 'Thịt bò nguyên tảng dày 3cm thấm khô nước.',
          seasoning: 'Xoa nhẹ dầu ăn, tiêu đập dập và chút muối biển quanh tảng thịt.',
          cookingSteps: 'Nướng trên vỉ than hồng 6 phút mỗi mặt cho vỏ ngoài xém thơm, bên trong hồng medium-rare.',
          presentation: 'Thái lát nghiêng 0.5cm bày lên thớt gỗ sang trọng, chấm muối kiến vàng Krông Pa.'
        }
      },
      {
        name: 'Sườn Non Heo Nướng Mật Ong',
        categoryId: cBo._id,
        price: 210000,
        costPrice: 75000,
        description: 'Dẻ sườn heo nướng mật ong rừng vàng ruộm thơm nức',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Sườn non heo', amount: 0.4, unit: 'kg', estimatedCost: 64000 },
          { ingredientName: 'Tỏi Lý Sơn', amount: 0.03, unit: 'kg', estimatedCost: 2550 },
          { ingredientName: 'Nước mắm cá cơm', amount: 0.02, unit: 'lít', estimatedCost: 1100 }
        ],
        instructions: {
          preparation: 'Sườn non chặt dẻ dài 10cm, chần qua nước sôi gừng khử mùi.',
          seasoning: 'Ướp mật ong, nước mắm, hành tỏi băm, ngũ vị hương 30 phút.',
          cookingSteps: 'Nướng than hoa 12 phút trở đều tay đến khi mật ong keo bóng vàng óng.',
          presentation: 'Xếp ra đĩa dài, rắc mè rang thơm lừng.'
        }
      },
      {
        name: 'Ba Chỉ Bò Cuộn Nấm Kim Châm',
        categoryId: cBo._id,
        price: 165000,
        costPrice: 62000,
        description: 'Ba chỉ bò béo ngậy cuộn nấm kim châm giòn sần sật nướng sốt cay ngọt',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt bò Úc', amount: 0.18, unit: 'kg', estimatedCost: 50400 },
          { ingredientName: 'Nấm kim châm', amount: 1, unit: 'gói', estimatedCost: 12000 }
        ],
        instructions: {
          preparation: 'Nấm kim châm cắt gốc rửa sạch chia thành các bó nhỏ. Bò thái lát mỏng dài.',
          seasoning: 'Trải lát bò, cuộn chặt từng bó nấm, quết nhẹ dầu hào sốt cay.',
          cookingSteps: 'Nướng áp chảo hoặc nướng than 3-4 phút cho bò chín se lại.',
          presentation: 'Xếp vòng tròn đĩa, chấm sốt chấm thịt nướng kiểu Hàn.'
        }
      },

      // 10-13: Gà & Heo
      {
        name: 'Gà Ta Nướng Muối Ớt Tây Bắc',
        categoryId: cGaHeo._id,
        price: 230000,
        costPrice: 85000,
        description: 'Gà ta thả vườn nướng than hồng da giòn thịt ngọt thơm gia vị mắc khén',
        imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt gà ta', amount: 0.6, unit: 'kg', estimatedCost: 72000 },
          { ingredientName: 'Ớt hiểm đỏ', amount: 0.04, unit: 'kg', estimatedCost: 1800 },
          { ingredientName: 'Sả cây tươi', amount: 0.04, unit: 'kg', estimatedCost: 1000 }
        ],
        instructions: {
          preparation: 'Gà làm sạch mổ banh lưng, xăm đều trên da gà.',
          seasoning: 'Giã nhuyễn ớt hiểm, muối hạt, sả, hạt tiêu ướp đều khắp thân gà 30 phút.',
          cookingSteps: 'Kẹp vỉ nướng than 20-25 phút với lửa vừa để gà chín thấu từ trong ra ngoài.',
          presentation: 'Chặt miếng vừa ăn hoặc để nguyên con xé tay, chấm muối ớt chanh lá chanh.'
        }
      },
      {
        name: 'Cánh Gà Chiên Nước Mắm Tỏi Ớt',
        categoryId: cGaHeo._id,
        price: 135000,
        costPrice: 52000,
        description: 'Cánh gà chiên giòn áo lớp sốt nước mắm tỏi ớt kẹo sền sệt cực đưa bia',
        imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt gà ta', amount: 0.35, unit: 'kg', estimatedCost: 42000 },
          { ingredientName: 'Nước mắm cá cơm', amount: 0.04, unit: 'lít', estimatedCost: 2200 },
          { ingredientName: 'Tỏi Lý Sơn', amount: 0.03, unit: 'kg', estimatedCost: 2550 },
          { ingredientName: 'Dầu ăn Simply', amount: 0.08, unit: 'lít', estimatedCost: 3360 }
        ],
        instructions: {
          preparation: 'Cánh gà chặt khúc vừa ăn khía nhẹ, ướp chút hạt nêm tiêu.',
          seasoning: 'Pha sốt: 2 muỗng nước mắm nhĩ, 2 muỗng đường, 1 muỗng tương ớt, tỏi ớt băm.',
          cookingSteps: 'Chiên cánh gà ngập dầu vàng giòn vớt ra. Đảo sốt sệt trên chảo rồi trút gà vào đảo nhanh tay.',
          presentation: 'Bày ra đĩa rắc ngò rí, ăn kèm dưa leo giòn mát.'
        }
      },
      {
        name: 'Ba Chỉ Heo Nướng Riềng Mẻ',
        categoryId: cGaHeo._id,
        price: 155000,
        costPrice: 58000,
        description: 'Ba chỉ nướng xém cạnh thơm nồng vị riềng mẻ mắm tôm chuẩn vị Bắc',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt ba chỉ heo', amount: 0.35, unit: 'kg', estimatedCost: 49000 },
          { ingredientName: 'Sả cây tươi', amount: 0.03, unit: 'kg', estimatedCost: 750 }
        ],
        instructions: {
          preparation: 'Ba chỉ heo cạo sạch bì thái lát dày 0.7cm.',
          seasoning: 'Ướp riềng giã nhỏ, mẻ ngấu, mắm tôm, chút mật mía trong 20 phút.',
          cookingSteps: 'Nướng than hoa trở đều tay cho mỡ xèo thơm và bì giòn dẻo.',
          presentation: 'Ăn kèm lá mơ lông, rau húng và chấm mắm tôm đánh sủi bọt chanh ớt.'
        }
      },
      {
        name: 'Heo Rừng Xào Sả Ớt Cay Nồng',
        categoryId: cGaHeo._id,
        price: 175000,
        costPrice: 65000,
        description: 'Thịt heo rừng bì giòn sần sật xào sả ớt nước cốt dừa đậm đà',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt ba chỉ heo', amount: 0.3, unit: 'kg', estimatedCost: 42000 },
          { ingredientName: 'Sả cây tươi', amount: 0.06, unit: 'kg', estimatedCost: 1500 },
          { ingredientName: 'Ớt hiểm đỏ', amount: 0.03, unit: 'kg', estimatedCost: 1350 }
        ],
        instructions: {
          preparation: 'Thịt heo thái mỏng cả bì. Sả thái vát mỏng, ớt thái lát.',
          seasoning: 'Ướp dầu hào, tỏi băm, hạt nêm, chút bột cà ri.',
          cookingSteps: 'Phi thơm sả ớt, xào thịt lửa lớn đến khi bì giòn săn lại.',
          presentation: 'Đổ ra đĩa rắc vừng rang, ăn kèm cơm nóng hoặc bánh đa.'
        }
      },

      // 14-17: Hải sản
      {
        name: 'Tôm Sú Nướng Muối Ớt Đỏ',
        categoryId: cHaiSan._id,
        price: 210000,
        costPrice: 88000,
        description: 'Tôm sú tươi sống nướng than đỏ đậm đà vị muối ớt cay cay thơm lừng',
        imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Tôm sú tươi', amount: 0.35, unit: 'kg', estimatedCost: 84000 },
          { ingredientName: 'Ớt hiểm đỏ', amount: 0.03, unit: 'kg', estimatedCost: 1350 }
        ],
        instructions: {
          preparation: 'Tôm sú rửa sạch cắt bớt râu, dùng xiên tre xiên dọc thân tôm.',
          seasoning: 'Giã muối hạt với ớt hiểm đỏ, hạt nêm và chút dầu màu điều xoa đều thân tôm.',
          cookingSteps: 'Nướng trên than hoa đỏ hồng 6 phút đến khi vỏ tôm đỏ au thơm lừng.',
          presentation: 'Rút xiên tre xếp đĩa tròn, chấm muối tiêu chanh hoặc sốt ớt xanh Nha Trang.'
        }
      },
      {
        name: 'Mực Trứng Hấp Gừng Hành',
        categoryId: cHaiSan._id,
        price: 195000,
        costPrice: 79000,
        description: 'Mực trứng tươi sống hấp thơm nồng mùi gừng chấm muối ớt xanh',
        imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Mực trứng sống', amount: 0.35, unit: 'kg', estimatedCost: 73500 },
          { ingredientName: 'Gừng tươi', amount: 0.04, unit: 'kg', estimatedCost: 1400 },
          { ingredientName: 'Hành tây Đà Lạt', amount: 0.05, unit: 'kg', estimatedCost: 1000 }
        ],
        instructions: {
          preparation: 'Mực trứng rửa nhẹ tay giữ nguyên túi trứng bên trong. Gừng thái sợi, hành tây thái múi cau.',
          seasoning: 'Xếp mực vào đĩa sâu lòng, rắc gừng, hành và rưới chút dầu mè, hạt nêm.',
          cookingSteps: 'Hấp cách thủy lửa lớn 7-8 phút đến khi mực căng mọng vừa chín tới.',
          presentation: 'Bê nguyên xửng hấp ra bàn ăn nóng chấm nước mắm gừng sệt cay.'
        }
      },
      {
        name: 'Cá Hồi Áp Chảo Sốt Chanh Leo',
        categoryId: cHaiSan._id,
        price: 260000,
        costPrice: 105000,
        description: 'Cá hồi Na Uy da giòn thịt mềm mọng sốt chanh leo chua ngọt thanh thoát',
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Cá hồi phi lê', amount: 0.25, unit: 'kg', estimatedCost: 90000 },
          { ingredientName: 'Bơ thực vật Tường An', amount: 0.03, unit: 'hộp', estimatedCost: 1920 },
          { ingredientName: 'Đường cát trắng', amount: 0.03, unit: 'kg', estimatedCost: 690 }
        ],
        instructions: {
          preparation: 'Miếng cá hồi phi lê thấm thật khô bề mặt da.',
          seasoning: 'Rắc chút muối tiêu nhẹ lên hai mặt cá.',
          cookingSteps: 'Đặt mặt da xuống chảo bơ nóng chiên giòn 4 phút, lật mặt chiên thêm 2 phút. Nấu sốt chanh leo đường sánh mịn.',
          presentation: 'Rưới sốt chanh leo quanh đĩa, đặt cá hồi lên trên kèm măng tây xào bơ.'
        }
      },
      {
        name: 'Tôm Sú Hấp Nước Dừa Xiêm',
        categoryId: cHaiSan._id,
        price: 220000,
        costPrice: 90000,
        description: 'Tôm sú hấp trọn vị ngọt thanh của nước dừa tươi Bến Tre',
        imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Tôm sú tươi', amount: 0.35, unit: 'kg', estimatedCost: 84000 },
          { ingredientName: 'Sả cây tươi', amount: 0.03, unit: 'kg', estimatedCost: 750 }
        ],
        instructions: {
          preparation: 'Tôm cắt bớt râu. Trái dừa gọt vỏ lấy nước nấu sôi.',
          seasoning: 'Cho sả đập dập và chút hạt nêm vào nước dừa đun sôi bùng.',
          cookingSteps: 'Thả tôm vào luộc ngập trong nước dừa 4 phút đến khi tôm cong đỏ au.',
          presentation: 'Xếp tôm quanh miệng trái dừa, đổ nước dừa hấp nóng vào giữa ăn ngọt lịm.'
        }
      },

      // 18-21: Lẩu & Cơm
      {
        name: 'Lẩu Thái Hải Sản Tom Yum Đặc Biệt',
        categoryId: cLau._id,
        price: 360000,
        costPrice: 145000,
        description: 'Nồi lẩu đậm vị chua cay Tom Yum kèm đĩa hải sản ngập tràn tôm, mực, ngao và nấm tươi',
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Tôm sú tươi', amount: 0.25, unit: 'kg', estimatedCost: 60000 },
          { ingredientName: 'Mực trứng sống', amount: 0.2, unit: 'kg', estimatedCost: 42000 },
          { ingredientName: 'Ngao hai cùi', amount: 0.3, unit: 'kg', estimatedCost: 27000 },
          { ingredientName: 'Nấm kim châm', amount: 1, unit: 'gói', estimatedCost: 12000 }
        ],
        instructions: {
          preparation: 'Sơ chế đĩa hải sản tươi sống và đĩa nấm rau muống, hoa chuối.',
          seasoning: 'Nước dùng hầm xương gà với sả, riềng, lá chanh, nước cốt dừa và sốt Tom Yum.',
          cookingSteps: 'Đun sôi nước lẩu chua cay thơm nồng, nêm nếm vừa vặn độ chua cay béo ngậy.',
          presentation: 'Đặt nồi lẩu trên bếp gas du lịch tại bàn, dọn kèm đĩa hải sản và bún tươi.'
        }
      },
      {
        name: 'Lẩu Bò Nhúng Dấm Chua Thanh',
        categoryId: cLau._id,
        price: 320000,
        costPrice: 125000,
        description: 'Thịt bò Úc mềm ngọt nhúng nước dùng dấm gạo thanh mát cuốn bánh tráng',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt bò Úc', amount: 0.4, unit: 'kg', estimatedCost: 112000 },
          { ingredientName: 'Hành tây Đà Lạt', amount: 0.08, unit: 'kg', estimatedCost: 1600 }
        ],
        instructions: {
          preparation: 'Bò thái lát mỏng bày đĩa cùng hành tây bào mỏng.',
          seasoning: 'Nước lẩu nấu từ dấm gạo, nước dừa tươi, sả đập dập và dứa thái lát.',
          cookingSteps: 'Đun sôi nước dấm sủi bọt, nhúng bò vừa chín tới ngọt mềm.',
          presentation: 'Dọn kèm bánh tráng phơi sương, rau sống dưa leo và chén mắm nêm đậm đà.'
        }
      },
      {
        name: 'Cơm Chiên Hải Sản Hoàng Kim',
        categoryId: cLau._id,
        price: 115000,
        costPrice: 42000,
        description: 'Hạt cơm vàng tơi xốp chiên tôm mực tươi ngon và trứng muối thơm bùi',
        imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Tôm sú tươi', amount: 0.1, unit: 'kg', estimatedCost: 24000 },
          { ingredientName: 'Mực trứng sống', amount: 0.08, unit: 'kg', estimatedCost: 16800 },
          { ingredientName: 'Dầu ăn Simply', amount: 0.03, unit: 'lít', estimatedCost: 1260 }
        ],
        instructions: {
          preparation: 'Cơm nguội bóp đều với lòng đỏ trứng gà cho bám màu vàng óng.',
          seasoning: 'Tôm mực thái hạt lựu xào chín với chút hạt nêm tiêu.',
          cookingSteps: 'Rang cơm lửa lớn cho hạt cơm săn nảy, trút hải sản và hành lá đảo đều.',
          presentation: 'Úp cơm vào bát tròn nén nhẹ, đổ ra đĩa trang trí cọng ngò rí và tiêu bột.'
        }
      },
      {
        name: 'Rau Muống Xào Tỏi Giòn Xanh',
        categoryId: cLau._id,
        price: 45000,
        costPrice: 12000,
        description: 'Rau muống cọng giòn rụm xào tỏi đập dập lửa lớn thơm phức',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Rau muống cọng', amount: 0.4, unit: 'kg', estimatedCost: 7200 },
          { ingredientName: 'Tỏi Lý Sơn', amount: 0.04, unit: 'kg', estimatedCost: 3400 },
          { ingredientName: 'Dầu ăn Simply', amount: 0.03, unit: 'lít', estimatedCost: 1260 }
        ],
        instructions: {
          preparation: 'Rau muống nhặt cọng non rửa sạch để ráo.',
          seasoning: 'Đập dập tỏi Lý Sơn lấy hương thơm nồng.',
          cookingSteps: 'Chảo dầu thật nóng phi thơm 1 nửa tỏi, trút rau vào xào lửa cực đại 2 phút, nêm nước mắm hạt nêm, rắc nốt phần tỏi còn lại.',
          presentation: 'Gắp ra đĩa giữ nguyên màu xanh mướt và độ giòn giòn sần sật.'
        }
      },

      // 22-25: Đồ uống & Tráng miệng
      {
        name: 'Trà Đào Cam Sả Tươi Mát',
        categoryId: cDoUong._id,
        price: 45000,
        costPrice: 14000,
        description: 'Trà thanh mát kết hợp lát đào ngâm giòn ngọt và hương thơm dịu của sả tươi',
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
        station: 'bar',
        recipe: [
          { ingredientName: 'Đào ngâm đóng hộp', amount: 0.25, unit: 'lon', estimatedCost: 9000 },
          { ingredientName: 'Sả cây tươi', amount: 0.03, unit: 'kg', estimatedCost: 750 },
          { ingredientName: 'Đường cát trắng', amount: 0.02, unit: 'kg', estimatedCost: 460 }
        ],
        instructions: {
          preparation: 'Ủ trà đen với nước sôi 85°C trong 10 phút. Đào ngâm cắt múi cau.',
          seasoning: 'Nấu nước đường sả thơm phức.',
          cookingSteps: 'Lắc đều 120ml nước trà, 30ml siro đào, 15ml nước cốt cam và đá viên trong bình shaker.',
          presentation: 'Rót ra ly thủy tinh cao, xếp lát đào giòn lên trên cắm nhánh sả tươi.'
        }
      },
      {
        name: 'Bia Heineken Lon Ướp Lạnh',
        categoryId: cDoUong._id,
        price: 30000,
        costPrice: 18500,
        description: 'Bia Heineken lon 330ml ướp đá lạnh sảng khoái',
        imageUrl: 'https://images.unsplash.com/photo-1608270119614-7e8cf65f128c?w=600&auto=format&fit=crop&q=80',
        station: 'bar',
        recipe: [
          { ingredientName: 'Bia Heineken lon', amount: 1, unit: 'lon', estimatedCost: 18500 }
        ],
        instructions: {
          preparation: 'Bia bảo quản trong tủ mát nhiệt độ 2°C - 4°C.',
          seasoning: 'Không cần pha chế.',
          cookingSteps: 'Lấy trực tiếp từ tủ mát khi khách gọi đơn.',
          presentation: 'Phục vụ kèm ly thủy tinh có đá viên tinh khiết.'
        }
      },
      {
        name: 'Bia Tiger Crystal Bạc',
        categoryId: cDoUong._id,
        price: 28000,
        costPrice: 17500,
        description: 'Bia Tiger Crystal ướp lạnh công nghệ lọc lạnh sảng khoái',
        imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&auto=format&fit=crop&q=80',
        station: 'bar',
        recipe: [
          { ingredientName: 'Bia Tiger Crystal', amount: 1, unit: 'lon', estimatedCost: 17500 }
        ],
        instructions: {
          preparation: 'Ướp lạnh sâu trong tủ mát.',
          seasoning: 'Không.',
          cookingSteps: 'Rót bia góc nghiêng 45 độ tạo bọt mịn dày 2cm.',
          presentation: 'Phục vụ kèm ly có đế lót bia nhà hàng.'
        }
      },
      {
        name: 'Nước Ngọt Coca-Cola Tươi Mát',
        categoryId: cDoUong._id,
        price: 20000,
        costPrice: 9500,
        description: 'Coca-Cola lon 320ml ướp lạnh giải khát tức thì',
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
        station: 'bar',
        recipe: [
          { ingredientName: 'Nước ngọt Coca-Cola', amount: 1, unit: 'lon', estimatedCost: 9500 }
        ],
        instructions: {
          preparation: 'Ướp lạnh.',
          seasoning: 'Không.',
          cookingSteps: 'Khui lon khi phục vụ tại bàn.',
          presentation: 'Rót vào ly đá có 1 lát chanh mỏng thơm mát.'
        }
      }
    ];

    await MenuItem.create(menu25);
    console.log(`🍲 Đã tạo đầy đủ ${menu25.length} món ăn đa dạng kèm công thức chế biến chi tiết cho Đầu Bếp`);

    // 6. Tạo tiện ích số điện nước của 2 tháng gần nhất (Tháng 9 & 10/2026)
    await Utility.create([
      {
        monthYear: '09/2026',
        electricity: { oldIndex: 12500, newIndex: 14200, consumed: 1700, unitPrice: 3500, totalAmount: 5950000 },
        water: { oldIndex: 450, newIndex: 515, consumed: 65, unitPrice: 25000, totalAmount: 1625000 },
        totalBill: 7575000,
        paymentStatus: 'paid',
        recordedBy: 'Quản lý',
        notes: 'Tiền điện nước tháng 9 đã thanh toán chuyển khoản'
      },
      {
        monthYear: '10/2026',
        electricity: { oldIndex: 14200, newIndex: 16150, consumed: 1950, unitPrice: 3500, totalAmount: 6825000 },
        water: { oldIndex: 515, newIndex: 588, consumed: 73, unitPrice: 25000, totalAmount: 1825000 },
        totalBill: 8650000,
        paymentStatus: 'paid',
        recordedBy: 'Quản lý',
        notes: 'Tháng 10 đón nhiều đoàn khách tiệc, công suất cao'
      }
    ]);
    console.log('⚡ Đã tạo bản ghi số điện nước');

    // 7. Tạo đặt bàn trước mẫu cho Lễ tân
    const futureTime = new Date(Date.now() + 3 * 3600000); // 3 tiếng sau
    const sampleRes = await Reservation.create({
      customerName: 'Anh Quốc Anh (Khách VIP)',
      phone: '0963769034',
      guestCount: 8,
      reservationTime: futureTime,
      tableId: createdTables[18]._id, // Bàn VIP 1
      specialRequests: 'Yêu cầu phòng hoa tươi, trang trí bàn tiệc sinh nhật',
      status: 'confirmed'
    });

    createdTables[18].status = 'reserved';
    createdTables[18].reservationId = sampleRes._id;
    await createdTables[18].save();
    console.log('📅 Đã tạo đặt bàn mẫu không trùng lặp');

    // 8. Tạo 2 hóa đơn mẫu đã thanh toán để có sẵn dữ liệu lịch sử hóa đơn cho Thu ngân
    const sampleOrder = await Order.create({
      orderCode: 'ORD-20261021-001',
      tableId: createdTables[0]._id,
      guestCount: 4,
      items: [
        { menuItemId: menu25[0]._id, name: menu25[0].name, price: menu25[0].price, quantity: 2, status: 'served' },
        { menuItemId: menu25[4]._id, name: menu25[4].name, price: menu25[4].price, quantity: 2, status: 'served' },
        { menuItemId: menu25[22]._id, name: menu25[22].name, price: menu25[22].price, quantity: 4, status: 'served' }
      ],
      totalAmount: 680000,
      status: 'completed'
    });

    await Invoice.create({
      invoiceCode: 'INV-20261021-001',
      orderId: sampleOrder._id,
      tableId: createdTables[0]._id,
      subtotal: 680000,
      discountAmount: 34000,
      memberTier: 'silver',
      vatAmount: 51680,
      finalAmount: 697680,
      paymentMethod: 'vietqr',
      paymentStatus: 'paid',
      vietQrUrl: `https://img.vietqr.io/image/MB-0963769034-compact2.png?amount=697680&addInfo=TT%20ORD-20261021-001&accountName=CAO%20QUOC%20ANH`,
      paidAt: new Date(Date.now() - 3600000)
    });
    console.log('🧾 Đã tạo hóa đơn mẫu cho lịch sử thu ngân');

    console.log('🎉 Khởi tạo dữ liệu hạt giống thành công!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi seed data:', error);
    process.exit(1);
  }
};

seedDatabase();
