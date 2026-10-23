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

    await User.create([
      { name: 'Lễ Tân QAnh', username: 'qanh1', email: 'qanh1@nhahang.com', password: '2006', accountType: 'staff', position: 'reception', approvalStatus: 'approved', isActive: true },
      { name: 'Đầu Bếp QAnh', username: 'qanh2', email: 'qanh2@nhahang.com', password: '2006', accountType: 'staff', position: 'kitchen', approvalStatus: 'approved', isActive: true },
      { name: 'Quản Lý QAnh', username: 'qanh3', email: 'qanh3@nhahang.com', password: '2006', accountType: 'staff', position: 'manager', approvalStatus: 'approved', isActive: true },
      { name: 'Chủ Nhà Hàng QAnh', username: 'qanh4', email: 'qanh4@nhahang.com', password: '2006', accountType: 'owner', position: 'owner', plan: 'enterprise', planName: 'Gói Chuỗi Doanh Nghiệp (Enterprise) - 1.899.000 đ/tháng', approvalStatus: 'approved', isActive: true }
    ]);
    console.log('👤 Đã tạo 4 tài khoản chuẩn qanh1 - qanh4');

    // 2. KHO NGUYÊN LIỆU ĐẦY ĐỦ 4 NHÓM THEO ĐẶC TẢ
    const ingredients = [
      {
            "name": "Thịt heo ba chỉ / thịt nách (kho tàu, luộc mắm tôm, kho cá)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thịt gia súc & gia cầm",
            "unit": "kg",
            "quantityInStock": 4,
            "minThreshold": 5,
            "costPerUnit": 140000,
            "note": "kho tàu, luộc mắm tôm, kho cá"
      },
      {
            "name": "Thịt nạc vai / nạc heo xay (làm nem rán, trứng cuộn thịt, sốt Mapo)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thịt gia súc & gia cầm",
            "unit": "kg",
            "quantityInStock": 15,
            "minThreshold": 4,
            "costPerUnit": 130000,
            "note": "làm nem rán, trứng cuộn thịt, sốt Mapo"
      },
      {
            "name": "Sườn non thăn heo (sườn chua ngọt, canh sườn củ quả)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thịt gia súc & gia cầm",
            "unit": "kg",
            "quantityInStock": 25,
            "minThreshold": 6,
            "costPerUnit": 160000,
            "note": "sườn chua ngọt, canh sườn củ quả"
      },
      {
            "name": "Thịt thăn bò mềm (bò lúc lắc, bò xào súp lơ, canh kim chi)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thịt gia súc & gia cầm",
            "unit": "kg",
            "quantityInStock": 20,
            "minThreshold": 5,
            "costPerUnit": 260000,
            "note": "bò lúc lắc, bò xào súp lơ, canh kim chi"
      },
      {
            "name": "Bắp bò hoa hoặc bắp bò gân (bắp bò ngâm mắm)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thịt gia súc & gia cầm",
            "unit": "kg",
            "quantityInStock": 15,
            "minThreshold": 4,
            "costPerUnit": 290000,
            "note": "bắp bò ngâm mắm"
      },
      {
            "name": "Thịt gà ta (gà rang sả ớt, canh gà lá giang)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thịt gia súc & gia cầm",
            "unit": "kg",
            "quantityInStock": 25,
            "minThreshold": 5,
            "costPerUnit": 120000,
            "note": "gà rang sả ớt, canh gà lá giang"
      },
      {
            "name": "Ức gà tươi (salad mè rang)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thịt gia súc & gia cầm",
            "unit": "kg",
            "quantityInStock": 18,
            "minThreshold": 4,
            "costPerUnit": 85000,
            "note": "salad mè rang"
      },
      {
            "name": "Cánh gà tươi (cánh gà chiên mắm)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thịt gia súc & gia cầm",
            "unit": "kg",
            "quantityInStock": 20,
            "minThreshold": 5,
            "costPerUnit": 95000,
            "note": "cánh gà chiên mắm"
      },
      {
            "name": "Vịt cỏ làm sạch (vịt om sấu)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thịt gia súc & gia cầm",
            "unit": "kg",
            "quantityInStock": 16,
            "minThreshold": 4,
            "costPerUnit": 110000,
            "note": "vịt om sấu"
      },
      {
            "name": "Cá lóc đồng (canh chua cá lóc)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thủy hải sản",
            "unit": "kg",
            "quantityInStock": 15,
            "minThreshold": 4,
            "costPerUnit": 130000,
            "note": "canh chua cá lóc"
      },
      {
            "name": "Cá bống tươi (cá bống kho tộ)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thủy hải sản",
            "unit": "kg",
            "quantityInStock": 12,
            "minThreshold": 3,
            "costPerUnit": 180000,
            "note": "cá bống kho tộ"
      },
      {
            "name": "Cá hồi phi lê tươi có da (cá hồi áp chảo bơ chanh)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thủy hải sản",
            "unit": "kg",
            "quantityInStock": 10,
            "minThreshold": 3,
            "costPerUnit": 360000,
            "note": "cá hồi áp chảo bơ chanh"
      },
      {
            "name": "Cua đồng xay tươi (canh cua mùng tơi mướp)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thủy hải sản",
            "unit": "kg",
            "quantityInStock": 15,
            "minThreshold": 4,
            "costPerUnit": 140000,
            "note": "canh cua mùng tơi mướp"
      },
      {
            "name": "Mực ống tươi (mực xào cần tỏi)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thủy hải sản",
            "unit": "kg",
            "quantityInStock": 16,
            "minThreshold": 4,
            "costPerUnit": 220000,
            "note": "mực xào cần tỏi"
      },
      {
            "name": "Nghêu / ngao trắng sống (canh nghêu nấu chua cay)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thủy hải sản",
            "unit": "kg",
            "quantityInStock": 20,
            "minThreshold": 5,
            "costPerUnit": 65000,
            "note": "canh nghêu nấu chua cay"
      },
      {
            "name": "Tôm thẻ / tôm đồng (tôm rim mặn ngọt)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thủy hải sản",
            "unit": "kg",
            "quantityInStock": 18,
            "minThreshold": 4,
            "costPerUnit": 200000,
            "note": "tôm rim mặn ngọt"
      },
      {
            "name": "Tôm sú tươi / tôm nõn (măng tây xào tôm, nhân nem, trứng hấp)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Thủy hải sản",
            "unit": "kg",
            "quantityInStock": 16,
            "minThreshold": 4,
            "costPerUnit": 250000,
            "note": "măng tây xào tôm, nhân nem, trứng hấp"
      },
      {
            "name": "Trứng vịt (kho tàu, trứng cuộn)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Trứng & Đậu hũ",
            "unit": "quả",
            "quantityInStock": 120,
            "minThreshold": 30,
            "costPerUnit": 3800,
            "note": "kho tàu, trứng cuộn"
      },
      {
            "name": "Trứng gà tươi (nem rán, trứng cuộn, trứng hấp Chawanmushi)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Trứng & Đậu hũ",
            "unit": "quả",
            "quantityInStock": 150,
            "minThreshold": 40,
            "costPerUnit": 3200,
            "note": "nem rán, trứng cuộn, trứng hấp Chawanmushi"
      },
      {
            "name": "Đậu phụ trắng bìa (đậu phụ sốt cà chua)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Trứng & Đậu hũ",
            "unit": "bìa",
            "quantityInStock": 50,
            "minThreshold": 15,
            "costPerUnit": 4000,
            "note": "đậu phụ sốt cà chua"
      },
      {
            "name": "Đậu phụ non đóng hộp (canh kim chi, đậu phụ Ma Bà Tứ Xuyên)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Thịt, Thủy Hải Sản & Trứng",
            "subCategory": "Trứng & Đậu hũ",
            "unit": "hộp",
            "quantityInStock": 35,
            "minThreshold": 10,
            "costPerUnit": 12000,
            "note": "canh kim chi, đậu phụ Ma Bà Tứ Xuyên"
      },
      {
            "name": "Rau muống non",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Rau ăn lá & rau nấu canh",
            "unit": "bó",
            "quantityInStock": 40,
            "minThreshold": 10,
            "costPerUnit": 8000
      },
      {
            "name": "Rau đay",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Rau ăn lá & rau nấu canh",
            "unit": "bó",
            "quantityInStock": 25,
            "minThreshold": 8,
            "costPerUnit": 7000
      },
      {
            "name": "Rau mồng tơi",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Rau ăn lá & rau nấu canh",
            "unit": "bó",
            "quantityInStock": 25,
            "minThreshold": 8,
            "costPerUnit": 7000
      },
      {
            "name": "Lá giang tươi",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Rau ăn lá & rau nấu canh",
            "unit": "bó",
            "quantityInStock": 20,
            "minThreshold": 5,
            "costPerUnit": 9000
      },
      {
            "name": "Xà lách Romaine hoặc xà lách mỡ",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Rau ăn lá & rau nấu canh",
            "unit": "kg",
            "quantityInStock": 15,
            "minThreshold": 4,
            "costPerUnit": 30000
      },
      {
            "name": "Giá đỗ sạch",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Rau ăn lá & rau nấu canh",
            "unit": "kg",
            "quantityInStock": 20,
            "minThreshold": 5,
            "costPerUnit": 15000
      },
      {
            "name": "Dọc mùng (bạc hà)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Rau ăn lá & rau nấu canh",
            "unit": "cây",
            "quantityInStock": 25,
            "minThreshold": 6,
            "costPerUnit": 5000
      },
      {
            "name": "Cà chua chín đỏ",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Củ quả tươi",
            "unit": "kg",
            "quantityInStock": 30,
            "minThreshold": 8,
            "costPerUnit": 22000
      },
      {
            "name": "Cà chua bi",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Củ quả tươi",
            "unit": "kg",
            "quantityInStock": 12,
            "minThreshold": 3,
            "costPerUnit": 35000
      },
      {
            "name": "Dứa (thơm)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Củ quả tươi",
            "unit": "quả",
            "quantityInStock": 20,
            "minThreshold": 5,
            "costPerUnit": 12000
      },
      {
            "name": "Đậu bắp non",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Củ quả tươi",
            "unit": "kg",
            "quantityInStock": 15,
            "minThreshold": 4,
            "costPerUnit": 25000
      },
      {
            "name": "Mướp hương",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Củ quả tươi",
            "unit": "quả",
            "quantityInStock": 25,
            "minThreshold": 6,
            "costPerUnit": 8000
      },
      {
            "name": "Bông cải xanh (súp lơ xanh)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Củ quả tươi",
            "unit": "cây",
            "quantityInStock": 30,
            "minThreshold": 8,
            "costPerUnit": 18000
      },
      {
            "name": "Măng tây non",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Củ quả tươi",
            "unit": "kg",
            "quantityInStock": 12,
            "minThreshold": 3,
            "costPerUnit": 85000
      },
      {
            "name": "Cà rốt, khoai tây, khoai sọ",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Củ quả tươi",
            "unit": "kg",
            "quantityInStock": 45,
            "minThreshold": 10,
            "costPerUnit": 22000
      },
      {
            "name": "Ngô ngọt (bắp ngọt)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Củ quả tươi",
            "unit": "bắp",
            "quantityInStock": 40,
            "minThreshold": 10,
            "costPerUnit": 8000
      },
      {
            "name": "Dưa leo (dưa chuột)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Củ quả tươi",
            "unit": "kg",
            "quantityInStock": 25,
            "minThreshold": 6,
            "costPerUnit": 18000
      },
      {
            "name": "Ớt chuông xanh và đỏ",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Củ quả tươi",
            "unit": "quả",
            "quantityInStock": 30,
            "minThreshold": 8,
            "costPerUnit": 12000
      },
      {
            "name": "Quả sấu xanh tươi / đông lạnh",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Củ quả tươi",
            "unit": "kg",
            "quantityInStock": 15,
            "minThreshold": 4,
            "costPerUnit": 35000
      },
      {
            "name": "Nấm đùi gà tươi",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Nấm tươi",
            "unit": "kg",
            "quantityInStock": 18,
            "minThreshold": 4,
            "costPerUnit": 60000
      },
      {
            "name": "Nấm bào ngư trắng / xám",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Nấm tươi",
            "unit": "kg",
            "quantityInStock": 15,
            "minThreshold": 4,
            "costPerUnit": 45000
      },
      {
            "name": "Nấm rơm tươi",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Nấm tươi",
            "unit": "kg",
            "quantityInStock": 12,
            "minThreshold": 3,
            "costPerUnit": 70000
      },
      {
            "name": "Nấm hương tươi",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Xanh, Củ Quả & Nấm Tươi",
            "subCategory": "Nấm tươi",
            "unit": "kg",
            "quantityInStock": 10,
            "minThreshold": 2,
            "costPerUnit": 120000
      },
      {
            "name": "Tỏi ta, hành tím khô",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Thơm, Thảo Mộc Tươi & Gia Vị Tươi Căn Bản",
            "subCategory": "Gia vị tươi căn bản",
            "unit": "kg",
            "quantityInStock": 25,
            "minThreshold": 5,
            "costPerUnit": 65000
      },
      {
            "name": "Hành lá (hành hoa), tỏi tây (tỏi boa-rô), cần tây",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Thơm, Thảo Mộc Tươi & Gia Vị Tươi Căn Bản",
            "subCategory": "Gia vị tươi căn bản",
            "unit": "kg",
            "quantityInStock": 25,
            "minThreshold": 5,
            "costPerUnit": 25000
      },
      {
            "name": "Gừng củ già, Củ sả tươi, Ớt chỉ thiên đỏ, ớt sừng không cay, Lá chanh tươi, Tiêu xanh chùm tươi, Chanh tươi (chanh ta xanh và chanh vàng)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Thơm, Thảo Mộc Tươi & Gia Vị Tươi Căn Bản",
            "subCategory": "Gia vị tươi căn bản",
            "unit": "kg",
            "quantityInStock": 30,
            "minThreshold": 6,
            "costPerUnit": 35000
      },
      {
            "name": "Rau thơm: Rau ngổ, mùi tàu (ngò gai), rau răm, mùi ta, lá húng quế (lá quế), lá hương thảo tươi (rosemary), Lá dứa tươi (lá nếp)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Rau Thơm, Thảo Mộc Tươi & Gia Vị Tươi Căn Bản",
            "subCategory": "Rau thơm",
            "unit": "bó",
            "quantityInStock": 40,
            "minThreshold": 10,
            "costPerUnit": 6000
      },
      {
            "name": "Kim chi cải thảo muối chua chuẩn Hàn",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Đồ Khô & Thực Phẩm Chế Biến Sẵn",
            "subCategory": "Chế biến sẵn",
            "unit": "kg",
            "quantityInStock": 15,
            "minThreshold": 4,
            "costPerUnit": 60000
      },
      {
            "name": "Bánh đa nem (vỏ ram Hà Tĩnh hoặc bánh tráng đậu xanh)",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Đồ Khô & Thực Phẩm Chế Biến Sẵn",
            "subCategory": "Đồ khô",
            "unit": "gói",
            "quantityInStock": 40,
            "minThreshold": 10,
            "costPerUnit": 12000
      },
      {
            "name": "Miến dong sợi nhỏ, Mộc nhĩ khô (nấm mèo), Nấm hương khô, Hạt sen tươi (hoặc hạt sen khô bở), Long nhãn Hưng Yên (nhãn nhục sấy dẻo), Nước dừa tươi nguyên quả",
            "group": "1. NGUYÊN LIỆU THÔ (THỰC PHẨM CHÍNH)",
            "category": "Đồ Khô & Thực Phẩm Chế Biến Sẵn",
            "subCategory": "Đồ khô & Chế biến sẵn",
            "unit": "kg",
            "quantityInStock": 25,
            "minThreshold": 5,
            "costPerUnit": 120000
      },
      {
            "name": "Nước mắm cá cơm truyền thống loại ngon (40 độ đạm trở lên)",
            "group": "2. GIA VỊ VÀ NƯỚC SỐT CĂN BẢN",
            "category": "Gia Vị Nêm Nếm Thông Dụng",
            "subCategory": "Nêm nếm",
            "unit": "lít",
            "quantityInStock": 40,
            "minThreshold": 10,
            "costPerUnit": 65000
      },
      {
            "name": "Muối ăn tinh, muối hạt (bóp cá, rửa thịt), muối biển hạt mịn",
            "group": "2. GIA VỊ VÀ NƯỚC SỐT CĂN BẢN",
            "category": "Gia Vị Nêm Nếm Thông Dụng",
            "subCategory": "Nêm nếm",
            "unit": "kg",
            "quantityInStock": 50,
            "minThreshold": 15,
            "costPerUnit": 10000
      },
      {
            "name": "Đường cát trắng, đường vàng mơ, đường phèn tinh khiết",
            "group": "2. GIA VỊ VÀ NƯỚC SỐT CĂN BẢN",
            "category": "Gia Vị Nêm Nếm Thông Dụng",
            "subCategory": "Nêm nếm",
            "unit": "kg",
            "quantityInStock": 60,
            "minThreshold": 15,
            "costPerUnit": 24000
      },
      {
            "name": "Bột canh, hạt nêm từ thịt / xương, hạt nêm nấm chay",
            "group": "2. GIA VỊ VÀ NƯỚC SỐT CĂN BẢN",
            "category": "Gia Vị Nêm Nếm Thông Dụng",
            "subCategory": "Nêm nếm",
            "unit": "gói",
            "quantityInStock": 40,
            "minThreshold": 10,
            "costPerUnit": 38000
      },
      {
            "name": "Hạt tiêu đen xay mịn, hạt tiêu sọ nguyên hạt đập dập",
            "group": "2. GIA VỊ VÀ NƯỚC SỐT CĂN BẢN",
            "category": "Gia Vị Nêm Nếm Thông Dụng",
            "subCategory": "Nêm nếm",
            "unit": "kg",
            "quantityInStock": 15,
            "minThreshold": 3,
            "costPerUnit": 180000
      },
      {
            "name": "Giấm gạo lên men tự nhiên, Me vắt chín",
            "group": "2. GIA VỊ VÀ NƯỚC SỐT CĂN BẢN",
            "category": "Gia Vị Nêm Nếm Thông Dụng",
            "subCategory": "Nêm nếm",
            "unit": "chai",
            "quantityInStock": 30,
            "minThreshold": 6,
            "costPerUnit": 16000
      },
      {
            "name": "Dầu ăn thực vật thông thường, Dầu ô liu nguyên chất (Extra Virgin), Dầu mè thơm (dầu vừng), Dầu màu điều (dầu hạt điều màu)",
            "group": "2. GIA VỊ VÀ NƯỚC SỐT CĂN BẢN",
            "category": "Các Loại Nước Sốt & Dầu Đóng Chai",
            "subCategory": "Dầu ăn đóng chai",
            "unit": "lít",
            "quantityInStock": 50,
            "minThreshold": 12,
            "costPerUnit": 45000
      },
      {
            "name": "Nước hàng dừa nguyên chất, Dầu hào thượng hạng, Nước tương (xì dầu) ngon và xì dầu nhạt, Tương ớt ăn liền, tương cà (ketchup), Sốt mè rang đóng chai, Mắm tôm Bắc đóng chai loại ngon",
            "group": "2. GIA VỊ VÀ NƯỚC SỐT CĂN BẢN",
            "category": "Các Loại Nước Sốt & Dầu Đóng Chai",
            "subCategory": "Nước sốt đóng chai",
            "unit": "chai",
            "quantityInStock": 40,
            "minThreshold": 10,
            "costPerUnit": 35000
      },
      {
            "name": "Bơ lạt động vật",
            "group": "2. GIA VỊ VÀ NƯỚC SỐT CĂN BẢN",
            "category": "Gia Vị Đặc Trưng Cho Món Chuyên Biệt",
            "subCategory": "Gia vị chuyên biệt",
            "unit": "hộp",
            "quantityInStock": 30,
            "minThreshold": 6,
            "costPerUnit": 45000
      },
      {
            "name": "Bột bắp (bột ngô) hoặc bột năng",
            "group": "2. GIA VỊ VÀ NƯỚC SỐT CĂN BẢN",
            "category": "Gia Vị Đặc Trưng Cho Món Chuyên Biệt",
            "subCategory": "Gia vị chuyên biệt",
            "unit": "gói",
            "quantityInStock": 35,
            "minThreshold": 8,
            "costPerUnit": 14000
      },
      {
            "name": "Hoa hồi (đại hồi), quế thanh, thảo quả khô",
            "group": "2. GIA VỊ VÀ NƯỚC SỐT CĂN BẢN",
            "category": "Gia Vị Đặc Trưng Cho Món Chuyên Biệt",
            "subCategory": "Gia vị chuyên biệt",
            "unit": "gói",
            "quantityInStock": 20,
            "minThreshold": 4,
            "costPerUnit": 25000
      },
      {
            "name": "Rượu trắng nấu ăn / rượu Mai Quế Lộ",
            "group": "2. GIA VỊ VÀ NƯỚC SỐT CĂN BẢN",
            "category": "Gia Vị Đặc Trưng Cho Món Chuyên Biệt",
            "subCategory": "Gia vị chuyên biệt",
            "unit": "chai",
            "quantityInStock": 20,
            "minThreshold": 4,
            "costPerUnit": 35000
      },
      {
            "name": "Sốt tương ớt đậu bản Tứ Xuyên (Doubanjiang)",
            "group": "2. GIA VỊ VÀ NƯỚC SỐT CĂN BẢN",
            "category": "Gia Vị Đặc Trưng Cho Món Chuyên Biệt",
            "subCategory": "Gia vị chuyên biệt",
            "unit": "hũ",
            "quantityInStock": 15,
            "minThreshold": 3,
            "costPerUnit": 48000
      },
      {
            "name": "Bột hoa tiêu Tứ Xuyên",
            "group": "2. GIA VỊ VÀ NƯỚC SỐT CĂN BẢN",
            "category": "Gia Vị Đặc Trưng Cho Món Chuyên Biệt",
            "subCategory": "Gia vị chuyên biệt",
            "unit": "gói",
            "quantityInStock": 15,
            "minThreshold": 3,
            "costPerUnit": 35000
      },
      {
            "name": "Bột ớt Hàn Quốc",
            "group": "2. GIA VỊ VÀ NƯỚC SỐT CĂN BẢN",
            "category": "Gia Vị Đặc Trưng Cho Món Chuyên Biệt",
            "subCategory": "Gia vị chuyên biệt",
            "unit": "gói",
            "quantityInStock": 20,
            "minThreshold": 4,
            "costPerUnit": 45000
      },
      {
            "name": "Bột cốt súp Dashi Nhật Bản",
            "group": "2. GIA VỊ VÀ NƯỚC SỐT CĂN BẢN",
            "category": "Gia Vị Đặc Trưng Cho Món Chuyên Biệt",
            "subCategory": "Gia vị chuyên biệt",
            "unit": "gói",
            "quantityInStock": 20,
            "minThreshold": 4,
            "costPerUnit": 55000
      },
      {
            "name": "Bia Heineken Lon Ướp Lạnh",
            "group": "3. ĐỒ UỐNG & BIA",
            "category": "Đồ uống/Bia",
            "subCategory": "Bia lon",
            "unit": "lon",
            "quantityInStock": 160,
            "minThreshold": 24,
            "costPerUnit": 19000,
            "imageUrl": "/assets/heineken.png"
      },
      {
            "name": "Bia Tiger Crystal Bạc",
            "group": "3. ĐỒ UỐNG & BIA",
            "category": "Đồ uống/Bia",
            "subCategory": "Bia lon",
            "unit": "lon",
            "quantityInStock": 120,
            "minThreshold": 24,
            "costPerUnit": 18000,
            "imageUrl": "/assets/tiger.png"
      },
      {
            "name": "Nước Ngọt Coca-Cola",
            "group": "3. ĐỒ UỐNG & BIA",
            "category": "Đồ uống/Bia",
            "subCategory": "Nước ngọt",
            "unit": "lon",
            "quantityInStock": 100,
            "minThreshold": 24,
            "costPerUnit": 9500
      }
];

    const createdIngs = await Inventory.create(ingredients);
    console.log(`📦 Đã tạo ${createdIngs.length} nguyên vật liệu và gia vị trong kho (Đầy đủ 4 nhóm chuẩn đặc tả)`);

    // Tạo lịch sử nhập hàng mẫu
    await InventoryImport.create([
      {
        importCode: 'IMP-20261021-001',
        ingredientId: createdIngs[0]._id,
        ingredientName: 'Thịt ba chỉ heo',
        category: 'Thịt, Hải Sản & Trứng',
        quantity: 20,
        unit: 'kg',
        costPerUnit: 140000,
        totalCost: 2800000,
        supplier: 'Công ty Thực phẩm Sạch Hải Phòng',
        importedBy: 'Quản lý kho'
      },
      {
        importCode: 'IMP-20261021-002',
        ingredientId: createdIngs[2]._id,
        ingredientName: 'Thịt thăn bò',
        category: 'Thịt, Hải Sản & Trứng',
        quantity: 15,
        unit: 'kg',
        costPerUnit: 260000,
        totalCost: 3900000,
        supplier: 'Hợp tác xã Chăn nuôi Bò Vàng',
        importedBy: 'Quản lý kho'
      },
      {
        importCode: 'IMP-20261022-003',
        ingredientId: createdIngs[createdIngs.length - 3]._id,
        ingredientName: 'Bia Heineken lon',
        category: 'Đồ uống/Bia',
        quantity: 120,
        unit: 'lon',
        costPerUnit: 19000,
        totalCost: 2280000,
        supplier: 'Đại lý Bia & Nước Ngọt Thành Đạt Hải Phòng',
        importedBy: 'Thu ngân ca sáng'
      }
    ]);
    console.log('📑 Đã tạo lịch sử nhập hàng mẫu');

    // 3. Tạo 22 Bàn ăn chia đều 4 khu vực, sức chứa > 200 người
    const tablesData = [
      // Tầng 1 (Trong nhà): 6 bàn = 36 khách
      { tableNumber: 'Bàn 01', zone: 'Tầng 1 (Trong nhà)', capacity: 4, status: 'empty' },
      { tableNumber: 'Bàn 02', zone: 'Tầng 1 (Trong nhà)', capacity: 4, status: 'empty' },
      { tableNumber: 'Bàn 03', zone: 'Tầng 1 (Trong nhà)', capacity: 6, status: 'empty' },
      { tableNumber: 'Bàn 04', zone: 'Tầng 1 (Trong nhà)', capacity: 6, status: 'empty' },
      { tableNumber: 'Bàn 05', zone: 'Tầng 1 (Trong nhà)', capacity: 8, status: 'empty' },
      { tableNumber: 'Bàn 06', zone: 'Tầng 1 (Trong nhà)', capacity: 8, status: 'empty' },

      // Tầng 2 (Phòng Lạnh): 6 bàn = 36 khách
      { tableNumber: 'Bàn 07', zone: 'Tầng 2 (Phòng Lạnh)', capacity: 4, status: 'empty' },
      { tableNumber: 'Bàn 08', zone: 'Tầng 2 (Phòng Lạnh)', capacity: 4, status: 'empty' },
      { tableNumber: 'Bàn 09', zone: 'Tầng 2 (Phòng Lạnh)', capacity: 6, status: 'empty' },
      { tableNumber: 'Bàn 10', zone: 'Tầng 2 (Phòng Lạnh)', capacity: 6, status: 'empty' },
      { tableNumber: 'Bàn 11', zone: 'Tầng 2 (Phòng Lạnh)', capacity: 8, status: 'empty' },
      { tableNumber: 'Bàn 12', zone: 'Tầng 2 (Phòng Lạnh)', capacity: 8, status: 'empty' },

      // Sân Vườn (Ngoài trời): 6 bàn = 48 khách
      { tableNumber: 'Bàn 13', zone: 'Sân Vườn (Ngoài trời)', capacity: 6, status: 'empty' },
      { tableNumber: 'Bàn 14', zone: 'Sân Vườn (Ngoài trời)', capacity: 6, status: 'empty' },
      { tableNumber: 'Bàn 15', zone: 'Sân Vườn (Ngoài trời)', capacity: 8, status: 'empty' },
      { tableNumber: 'Bàn 16', zone: 'Sân Vườn (Ngoài trời)', capacity: 8, status: 'empty' },
      { tableNumber: 'Bàn 17', zone: 'Sân Vườn (Ngoài trời)', capacity: 10, status: 'empty' },
      { tableNumber: 'Bàn 18', zone: 'Sân Vườn (Ngoài trời)', capacity: 10, status: 'empty' },

      // Phòng VIP: 4 phòng = 85 khách
      { tableNumber: 'VIP 1 - Hoàng Gia', zone: 'Phòng VIP', capacity: 15, status: 'empty' },
      { tableNumber: 'VIP 2 - Sen Vàng', zone: 'Phòng VIP', capacity: 15, status: 'empty' },
      { tableNumber: 'VIP 3 - Trống Đồng', zone: 'Phòng VIP', capacity: 20, status: 'empty' },
      { tableNumber: 'VIP 4 - Đại Tiệc Hội Nghị', zone: 'Phòng VIP', capacity: 35, status: 'empty' }
    ];

    const createdTables = await Table.create(tablesData);
    const totalCap = createdTables.reduce((s, t) => s + t.capacity, 0);
    console.log(`🪑 Đã tạo ${createdTables.length} bàn ăn với tổng sức chứa: ${totalCap} khách`);

    // 4. Tạo các danh mục món ăn phù hợp với 30 món gia đình
    const categories = await Category.create([
      { name: 'Món Kho & Rim', slug: 'mon-kho-rim', sortOrder: 1 },
      { name: 'Món Xào & Áp Chảo', slug: 'mon-xao', sortOrder: 2 },
      { name: 'Món Canh & Lẩu', slug: 'mon-canh-lau', sortOrder: 3 },
      { name: 'Món Chiên, Luộc & Hấp', slug: 'mon-chien-luoc', sortOrder: 4 },
      { name: 'Món Nhắm & Healthy', slug: 'mon-nham-healthy', sortOrder: 5 },
      { name: 'Tráng Miệng & Đồ Uống', slug: 'trang-mieng-do-uong', sortOrder: 6 }
    ]);
    const [cKho, cXao, cCanh, cChienLuoc, cNham, cTrangMieng] = categories;

    // 5. DANH MỤC THỰC ĐƠN CHUẨN ĐÚNG 30 MÓN GIA ĐÌNH KÈM SỔ TAY CÔNG THỨC CHI TIẾT
    const dishes30 = [
      // 1. Thịt kho tàu nước dừa (Món kho)
      {
        name: 'Thịt kho tàu nước dừa',
        categoryId: cKho._id,
        price: 125000,
        costPrice: 105000,
        description: 'Thịt ba chỉ mềm rục ngấm nước dừa tươi, trứng vịt bùi thơm đậm đà cánh gián',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt ba chỉ heo', amount: 0.5, unit: 'kg', estimatedCost: 70000 },
          { ingredientName: 'Trứng vịt', amount: 4, unit: 'quả', estimatedCost: 15200 },
          { ingredientName: 'Nước dừa tươi', amount: 1, unit: 'quả', estimatedCost: 18000 },
          { ingredientName: 'Nước mắm cốt cá cơm', amount: 0.03, unit: 'lít', estimatedCost: 1800 }
        ],
        instructions: {
          preparation: 'Thịt cạo sạch, thái miếng vuông vừa ăn 3*3CM, chần qua nước sôi rồi rửa sạch.',
          seasoning: 'Ướp thịt với 2 thìa canh nước mắm, 1 thìa đường, 1 thìa nước hàng, tỏi hành băm trong 30 phút.',
          cookingSteps: 'Xào săn thịt, sau đó đổ nước dừa tươi ngập mặt thịt. Đun sôi rồi hạ nhỏ lửa liu riu, vớt bọt. Cho trứng vịt đã bóc vỏ vào, kho nhỏ lửa khoảng 45 - 60 phút cho tới khi thịt mềm rục, nước sánh lại và có màu cánh gián đẹp mắt.',
          presentation: 'Múc ra tô sâu lòng, xếp trứng xung quanh, rưới nước sốt kho óng ả lên trên.'
        }
      },
      // 2. Sườn xào chua ngọt (Món rim / xào)
      {
        name: 'Sườn xào chua ngọt',
        categoryId: cKho._id,
        price: 120000,
        costPrice: 105000,
        description: 'Sườn non thăn rán vàng xém cạnh áo lớp sốt chua ngọt keo óng bóng bẩy',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Sườn non heo', amount: 0.5, unit: 'kg', estimatedCost: 80000 },
          { ingredientName: 'Ớt chuông', amount: 1, unit: 'quả', estimatedCost: 12000 },
          { ingredientName: 'Giấm gạo', amount: 0.05, unit: 'chai', estimatedCost: 5000 },
          { ingredientName: 'Đường cát trắng', amount: 0.05, unit: 'kg', estimatedCost: 8000 }
        ],
        instructions: {
          preparation: 'Sườn chặt khúc vừa ăn, luộc sơ với muối, rửa sạch để ráo.',
          seasoning: 'Pha hỗn hợp sốt chua ngọt từ giấm, đường, mắm, tương cà, tương ớt và 2 thìa nước lọc.',
          cookingSteps: 'Rán sườn trên chảo dầu lửa vừa cho vàng đều 2 mặt, vớt ra thấm dầu. Phi thơm tỏi, cho sườn và nước sốt vào đảo đều, đậy vung hạ lửa nhỏ cho ngấm gia vị đến khi sốt sệt lại bao quanh sườn, rắc thêm hành hoa.',
          presentation: 'Trút ra đĩa bầu dục, rắc chút hành lá thái nhỏ và tiêu hạt.'
        }
      },
      // 3. Canh chua cá lóc (Món canh)
      {
        name: 'Canh chua cá lóc',
        categoryId: cCanh._id,
        price: 100000,
        costPrice: 85000,
        description: 'Cá lóc đồng nấu dứa, cà chua, đậu bắp, dọc mùng thơm lừng rau ngổ ngò gai',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Cá lóc đồng', amount: 0.5, unit: 'kg', estimatedCost: 65000 },
          { ingredientName: 'Dứa', amount: 0.25, unit: 'quả', estimatedCost: 3000 },
          { ingredientName: 'Đậu bắp', amount: 0.1, unit: 'kg', estimatedCost: 2500 },
          { ingredientName: 'Dọc mùng', amount: 1, unit: 'cây', estimatedCost: 5000 },
          { ingredientName: 'Me chín vắt', amount: 0.5, unit: 'gói', estimatedCost: 9500 }
        ],
        instructions: {
          preparation: 'Cá làm sạch nhớt bằng muối và chanh, cắt khúc dày, ướp chút mắm tiêu. Dằm me với nước ấm lấy nước cốt me. Dọc mùng tước vỏ bóp muối, rửa sạch.',
          seasoning: 'Ướp cá với nước mắm, tiêu. Nêm nước canh với cốt me, đường, nước mắm cho vị chua ngọt dịu.',
          cookingSteps: 'Phi thơm tỏi băm, cho cà chua xào tạo màu, đổ 1 lít nước lọc và nước cốt me vào đun sôi. Nước sôi thả cá vào nấu chín (khoảng 7-10 phút), vớt bọt. Cho dứa, đậu bắp, dọc mùng vào đun tiếp 2 phút. Cuối cùng cho giá, nêm nếm mắm đường chua ngọt vừa miệng, tắt bếp rắc rau ngổ, ngò gai.',
          presentation: 'Múc ra tô lớn, cá xếp ở trên, rắc rau ngổ ngò gai và ớt lát, ăn kèm nước mắm ớt nguyên chất.'
        }
      },
      // 4. Gà rang sả ớt (Món mặn)
      {
        name: 'Gà rang sả ớt',
        categoryId: cKho._id,
        price: 95000,
        costPrice: 80000,
        description: 'Thịt gà ta chắc ngọt rang săn vàng giòn cùng sả băm thơm cay nồng',
        imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt gà ta', amount: 0.5, unit: 'kg', estimatedCost: 60000 },
          { ingredientName: 'Củ sả', amount: 3, unit: 'củ', estimatedCost: 6000 },
          { ingredientName: 'Ớt chỉ thiên', amount: 0.05, unit: 'kg', estimatedCost: 4000 },
          { ingredientName: 'Lá chanh', amount: 1, unit: 'gói', estimatedCost: 10000 }
        ],
        instructions: {
          preparation: 'Gà chặt miếng nhỏ vừa ăn, ướp với 1/2 lượng sả ớt, 1 thìa mắm, 1 thìa dầu hào, 1/2 thìa đường trong 20 phút.',
          seasoning: 'Phi thơm phần sả ớt còn lại với dầu ăn cho vàng giòn, vớt ra để riêng.',
          cookingSteps: 'Cho gà vào chảo rang săn ở lửa lớn. Khi gà ra nước thì hạ lửa vừa đun đến khi cạn nước và thịt săn vàng cạnh. Trút phần sả ớt chiên giòn vào đảo cùng 1 phút, rắc lá chanh thái sợi và tắt bếp.',
          presentation: 'Bày ra đĩa sâu lòng, rắc lá chanh thái chỉ sợi nhỏ lên trên.'
        }
      },
      // 5. Bò lúc lắc (Món xào)
      {
        name: 'Bò lúc lắc',
        categoryId: cXao._id,
        price: 175000,
        costPrice: 150000,
        description: 'Thăn bò mềm mọng thái quân cờ xào xém cạnh cùng ớt chuông, hành tây và bơ thơm lừng',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt thăn bò', amount: 0.4, unit: 'kg', estimatedCost: 104000 },
          { ingredientName: 'Ớt chuông', amount: 2, unit: 'quả', estimatedCost: 24000 },
          { ingredientName: 'Bơ lạt', amount: 0.3, unit: 'hộp', estimatedCost: 13500 },
          { ingredientName: 'Dầu hào', amount: 0.05, unit: 'chai', estimatedCost: 8500 }
        ],
        instructions: {
          preparation: 'Thịt bò thái quân cờ (2X2CM), ướp tỏi băm, dầu hào, tiêu, 1 thìa dầu ăn cho mềm trong 20 phút. Ớt chuông, hành tây cắt miếng vuông tương đương miếng bò.',
          seasoning: 'Ướp thịt bò với dầu hào, xì dầu, tiêu đen, tỏi băm nhuyễn.',
          cookingSteps: 'Xào nhanh rau củ với chút muối trên lửa lớn cho chín tới, trút ra đĩa. Bật chảo lửa lớn cho thật nóng, phi tỏi và cho bò vào đảo nhanh tay (khoảng 2 phút) cho xém cạnh, thêm chút bơ lạt cho thơm ngậy. Trút rau củ vào đảo đều cùng bò thêm 30 giây rồi cho ra đĩa.',
          presentation: 'Xếp ra đĩa phẳng cùng khoai tây chiên hoặc rau xà lách tươi ăn kèm.'
        }
      },
      // 6. Canh cua rau đay mướp (Món canh dân dã)
      {
        name: 'Canh cua rau đay mướp',
        categoryId: cCanh._id,
        price: 70000,
        costPrice: 60000,
        description: 'Cua đồng giã tay đóng tảng dày, nước canh ngọt thanh mát lành vị mướp hương',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Cua đồng xay', amount: 0.3, unit: 'kg', estimatedCost: 42000 },
          { ingredientName: 'Rau đay', amount: 1, unit: 'bó', estimatedCost: 7000 },
          { ingredientName: 'Mồng tơi', amount: 1, unit: 'bó', estimatedCost: 7000 },
          { ingredientName: 'Mướp hương', amount: 1, unit: 'quả', estimatedCost: 4000 }
        ],
        instructions: {
          preparation: 'Cho cua xay hòa với 1 lít nước lọc, lọc qua rây 2-3 lần lấy nước cốt cua, bỏ bã. Rau đay, mồng tơi nhặt rửa sạch thái nhỏ. Mướp gọt vỏ bổ vát mỏng.',
          seasoning: 'Cho chút muối hạt vào nước cua khuấy đều trước khi bắc lên bếp.',
          cookingSteps: 'Khuấy nhẹ đáy nồi để thịt không bén đáy, khi thịt cua bắt đầu nổi lên thành mảng thì hạ nhỏ lửa, không khuấy nữa để thịt đóng tảng. Gạt nhẹ tảng cua sang một bên, thả mướp và rau vào, nêm nếm gia vị vừa ăn. Nấu sôi lại khoảng 1-2 phút cho rau chín là hoàn thành.',
          presentation: 'Múc canh ra tô lớn khéo léo để tảng gạch cua nổi lên trên mặt.'
        }
      },
      // 7. Đậu phụ sốt cà chua (Món thanh đạm)
      {
        name: 'Đậu phụ sốt cà chua',
        categoryId: cChienLuoc._id,
        price: 32000,
        costPrice: 25000,
        description: 'Đậu phụ lướt ván sốt cà chua chín mọng sánh quyện, rắc tiêu và hành hoa',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Đậu phụ trắng', amount: 4, unit: 'bìa', estimatedCost: 16000 },
          { ingredientName: 'Cà chua', amount: 0.3, unit: 'kg', estimatedCost: 6600 },
          { ingredientName: 'Hành hoa', amount: 0.05, unit: 'kg', estimatedCost: 2400 }
        ],
        instructions: {
          preparation: 'Đậu thái miếng vuông vừa ăn, rán vàng các mặt (hoặc dùng đậu tươi luộc tùy sở thích). Cà chua rửa sạch bổ múi cau nhỏ.',
          seasoning: 'Cho thêm 3-4 thìa nước lọc, 1 thìa mắm, 1 thìa hạt nêm, chút xíu đường vào chảo cà chua.',
          cookingSteps: 'Phi thơm hành khô băm nhỏ, cho cà chua vào đảo nhuyễn với chút muối để nhanh mềm tạo sốt sánh mịn. Thả đậu vào đảo nhẹ tay cho đậu ngấm sốt trong 5 phút. Rắc hành lá thái nhỏ và hạt tiêu lên trên trước khi tắt bếp.',
          presentation: 'Gắp đậu ra đĩa sâu lòng, rưới nước sốt cà chua đỏ au và rắc hành hoa lên trên.'
        }
      },
      // 8. Cá bống kho tộ (Món kho)
      {
        name: 'Cá bống kho tộ',
        categoryId: cKho._id,
        price: 95000,
        costPrice: 80000,
        description: 'Cá bống tươi kho tộ đất đun liu riu cùng thịt ba chỉ, nước kho keo dẻo cay nồng tiêu sọ',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Cá bống tươi', amount: 0.3, unit: 'kg', estimatedCost: 54000 },
          { ingredientName: 'Thịt ba chỉ heo', amount: 0.08, unit: 'kg', estimatedCost: 11200 },
          { ingredientName: 'Tiêu đen xay', amount: 0.03, unit: 'kg', estimatedCost: 5400 },
          { ingredientName: 'Nước hàng dừa', amount: 0.1, unit: 'chai', estimatedCost: 9400 }
        ],
        instructions: {
          preparation: 'Cá bống làm sạch, xóc muối rửa sạch cho hết nhớt, để thật ráo nước.',
          seasoning: 'Ướp cá với mắm ngon, đường, tiêu, ớt và nước màu trong 30 phút cho thấm sâu vào thịt cá.',
          cookingSteps: 'Phi thơm hành tỏi và xào săn vài miếng thịt ba chỉ dưới đáy tộ đất. Xếp cá vào tộ, đun lửa to cho sôi bùng lên rồi hạ thật nhỏ lửa. Đun liu riu tới khi nước cạn sánh sệt, cá săn chắc lại thì rắc thật nhiều tiêu và ớt lát lên trên.',
          presentation: 'Để nguyên tộ đất nóng bốc khói nghi ngút, dùng kèm cơm trắng nóng hổi.'
        }
      },
      // 9. Mực xào cần tỏi (Món xào hải sản)
      {
        name: 'Mực xào cần tỏi',
        categoryId: cXao._id,
        price: 155000,
        costPrice: 130000,
        description: 'Mực ống tươi khứa vảy rồng giòn ngọt xào nhanh lửa lớn cùng cần tây tỏi tây',
        imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Mực ống tươi', amount: 0.4, unit: 'kg', estimatedCost: 88000 },
          { ingredientName: 'Cần tây', amount: 2, unit: 'cây', estimatedCost: 14000 },
          { ingredientName: 'Tỏi boa-rô', amount: 2, unit: 'cây', estimatedCost: 16000 },
          { ingredientName: 'Dầu hào', amount: 0.05, unit: 'chai', estimatedCost: 12000 }
        ],
        instructions: {
          preparation: 'Mực làm sạch túi mực, khứa vảy rồng rồi cắt miếng vừa ăn, chần nhanh qua nước sôi có gừng đập dập để khử tanh, vớt ra để ráo. Cần, tỏi tây cắt khúc dài 4 cm; hành tây bổ múi cau.',
          seasoning: 'Ướp mực với chút hạt nêm, tiêu xay và dầu hào.',
          cookingSteps: 'Phi thơm tỏi, bật lửa lớn cho mực vào xào nhanh cùng 1 thìa dầu hào, đảo đều trong 1-2 phút cho mực chín tới rồi múc riêng ra đĩa. Cho tiếp rau củ vào chảo xào nhanh lửa lớn, nêm chút hạt nêm. Khi rau củ chín tới thì đổ mực vào đảo đều cùng rau khoảng 30 giây, rắc hạt tiêu rồi tắt bếp.',
          presentation: 'Bày ra đĩa bầu dục, xếp mực lên trên cùng rau củ xanh mướt giòn ngọt.'
        }
      },
      // 10. Canh sườn hầm củ quả (Món canh bồi bổ)
      {
        name: 'Canh sườn hầm củ quả',
        categoryId: cCanh._id,
        price: 110000,
        costPrice: 95000,
        description: 'Sườn non heo hầm nhỏ lửa cùng ngô ngọt, cà rốt, khoai tây nước dùng trong ngọt tự nhiên',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Sườn non heo', amount: 0.4, unit: 'kg', estimatedCost: 64000 },
          { ingredientName: 'Ngô ngọt', amount: 1, unit: 'bắp', estimatedCost: 8000 },
          { ingredientName: 'Cà rốt', amount: 0.3, unit: 'kg', estimatedCost: 6000 },
          { ingredientName: 'Khoai tây', amount: 0.4, unit: 'kg', estimatedCost: 17000 }
        ],
        instructions: {
          preparation: 'Sườn chặt khúc, chần qua nước sôi 2 phút rồi rửa sạch bọt bẩn. Ngô ngọt cắt khúc, cà rốt và khoai tây gọt vỏ cắt miếng vừa ăn.',
          seasoning: 'Nêm 1 thìa cà phê muối tinh và hạt nêm từ thịt cho vị thanh ngọt nguyên bản.',
          cookingSteps: 'Cho sườn vào nồi cùng 1,2 lít nước và 1 thìa cà phê muối, hầm nhỏ lửa khoảng 20 phút, vớt bọt cho nước trong. Cho ngô, cà rốt và khoai tây vào hầm tiếp cùng sườn khoảng 15 phút cho củ quả mềm ngọt. Nêm lại hạt nêm vừa ăn, múc ra bát rắc hành mùi.',
          presentation: 'Múc ra tô sứ trắng lớn, sườn và củ quả ngũ sắc bắt mắt, rắc ngò gai hành hoa.'
        }
      },
      // 11. Trứng cuộn thịt băm chiên (Món chiên nhanh)
      {
        name: 'Trứng cuộn thịt băm chiên',
        categoryId: cChienLuoc._id,
        price: 40000,
        costPrice: 32000,
        description: 'Trứng tráng vàng ươm cuộn thịt nạc vai băm mộc nhĩ giòn sần sật',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Trứng gà', amount: 3, unit: 'quả', estimatedCost: 9600 },
          { ingredientName: 'Thịt ba chỉ heo', amount: 0.1, unit: 'kg', estimatedCost: 14000 },
          { ingredientName: 'Mộc nhĩ khô', amount: 0.03, unit: 'kg', estimatedCost: 4500 },
          { ingredientName: 'Hành tím khô', amount: 0.05, unit: 'kg', estimatedCost: 3900 }
        ],
        instructions: {
          preparation: 'Trộn thịt băm với mộc nhĩ, hành tím, chút mắm và tiêu. Đập trứng ra bát, đánh tan đều cùng 1 thìa nước lọc (giúp trứng mềm xốp) và chút xíu bột nêm.',
          seasoning: 'Ướp thịt với nước mắm ngon, tiêu xay.',
          cookingSteps: 'Cho dầu vào chảo chống dính đun nóng vừa, đổ một lớp trứng mỏng tráng đều mặt chảo. Khi trứng se mặt thì phết đều một lớp thịt băm mỏng lên trên, nhẹ nhàng cuộn tròn mép trứng lại. Đậy nắp chảo đun lửa thật nhỏ 5-7 phút cho thịt bên trong chín đều, lấy ra cắt khoanh tròn bày đĩa.',
          presentation: 'Cắt khoanh xéo 1.5cm, bày thành hình hoa cúc trên đĩa tròn, chấm kèm tương ớt.'
        }
      },
      // 12. Tôm rim mặn ngọt (Món rim)
      {
        name: 'Tôm rim mặn ngọt',
        categoryId: cKho._id,
        price: 115000,
        costPrice: 95000,
        description: 'Tôm thẻ rim lửa vừa đến khi vỏ giòn bóng đỏ au, ngấm đều sốt mặn ngọt đậm đà',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Tôm thẻ', amount: 0.35, unit: 'kg', estimatedCost: 70000 },
          { ingredientName: 'Dầu màu điều', amount: 0.05, unit: 'lít', estimatedCost: 5000 },
          { ingredientName: 'Nước mắm cốt cá cơm', amount: 0.05, unit: 'lít', estimatedCost: 10000 },
          { ingredientName: 'Đường cát trắng', amount: 0.05, unit: 'kg', estimatedCost: 10000 }
        ],
        instructions: {
          preparation: 'Tôm cắt râu và đầu nhọn, rửa sạch để ráo nước (nếu tôm to có thể bóc vỏ chừa đuôi).',
          seasoning: 'Pha nước sốt: 2 thìa canh mắm, 2 thìa đường, 1 thìa nước lọc, 1/2 thìa tiêu xay.',
          cookingSteps: 'Phi thơm hành tỏi với 1 thìa dầu màu điều, trút tôm vào xào lửa lớn đến khi tôm chuyển sang màu đỏ cong lại. Đổ bát nước sốt vào rim lửa vừa cho đến khi nước sốt keo lại bám đều quanh từng con tôm, bóng đỏ óng ả thì tắt bếp.',
          presentation: 'Múc ra đĩa nhỏ, rắc hành hoa thái sợi và tiêu sọ thơm lừng.'
        }
      },
      // 13. Rau muống xào tỏi (Món rau)
      {
        name: 'Rau muống xào tỏi',
        categoryId: cXao._id,
        price: 24000,
        costPrice: 18000,
        description: 'Rau muống ngọn non xanh mướt giòn sần sật xào nhanh tay với nhiều tỏi ta phi thơm nức',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Rau muống', amount: 1, unit: 'bó', estimatedCost: 8000 },
          { ingredientName: 'Tỏi ta', amount: 0.08, unit: 'kg', estimatedCost: 6000 },
          { ingredientName: 'Dầu ăn', amount: 0.05, unit: 'lít', estimatedCost: 4000 }
        ],
        instructions: {
          preparation: 'Rau muống nhặt ngọn non, rửa sạch ngâm nước muối loãng. Đun nồi nước sôi có chút muối, chần rau nhanh trong 20 giây rồi vớt ngay ra âu nước đá lạnh để rau giữ màu xanh giòn. Tỏi đập dập, chia làm 2 phần.',
          seasoning: 'Nêm nước mắm cốt và hạt nêm ở lửa lớn để dậy hương vị.',
          cookingSteps: 'Phi thơm 1/2 phần tỏi với nhiều dầu ăn trên lửa to, cho rau muống đã ráo nước vào đảo thật nhanh tay. Nêm 1 thìa nước mắm, 1 thìa hạt nêm, cho nốt phần tỏi còn lại vào đảo đều thêm 30 giây rồi trút ra đĩa ăn ngay.',
          presentation: 'Bày ra đĩa dài, tỏi vàng rải đều trên ngọn rau xanh bóng.'
        }
      },
      // 14. Bắp bò ngâm mắm (Món nhắm / Khô)
      {
        name: 'Bắp bò ngâm mắm',
        categoryId: cNham._id,
        price: 220000,
        costPrice: 190000,
        description: 'Bắp bò hoa luộc thơm quế hồi ngâm nước mắm chua ngọt giòn sần sật thái lát mỏng',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Bắp bò hoa/gân', amount: 0.5, unit: 'kg', estimatedCost: 145000 },
          { ingredientName: 'Nước mắm cốt cá cơm', amount: 0.3, unit: 'lít', estimatedCost: 20000 },
          { ingredientName: 'Đường phèn', amount: 0.2, unit: 'kg', estimatedCost: 10000 },
          { ingredientName: 'Hoa hồi', amount: 0.3, unit: 'gói', estimatedCost: 7500 },
          { ingredientName: 'Quế thanh', amount: 0.3, unit: 'gói', estimatedCost: 7500 }
        ],
        instructions: {
          preparation: 'Bắp bò rửa sạch, bó tròn bằng chỉ thực phẩm. Luộc chín bắp bò với gừng đập dập, 1 bông hồi, nhánh quế nhỏ và chút muối trong 35-40 phút cho chín mềm. Vớt ra ngâm nước đá lạnh rồi để thật khô ráo.',
          seasoning: 'Nấu nước ngâm: Hòa tan mắm, đường, giấm, nước lọc, đun sôi lăn tăn rồi để thật nguội hoàn toàn.',
          cookingSteps: 'Xếp thịt bò vào hũ thủy tinh tiệt trùng, rải tỏi lát và ớt tươi xen kẽ. Đổ nước mắm nguội ngập thịt bò, chèn vỉ để thịt không nổi lên mặt nước. Đậy kín sau 3-4 ngày trong ngăn mát tủ lạnh là dùng được. Khi ăn thái lát thật mỏng.',
          presentation: 'Thái lát thật mỏng xếp xoay tròn quanh đĩa, ăn kèm tỏi ớt ngâm chua ngọt.'
        }
      },
      // 15. Vịt om sấu (Món om / Lẩu)
      {
        name: 'Vịt om sấu',
        categoryId: cCanh._id,
        price: 125000,
        costPrice: 105000,
        description: 'Thịt vịt om sấu tươi quả xanh, khoai sọ bở dẻo nước om chua thanh thơm mùi tàu ngò gai',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt vịt cỏ', amount: 0.6, unit: 'kg', estimatedCost: 66000 },
          { ingredientName: 'Quả sấu xanh', amount: 0.2, unit: 'kg', estimatedCost: 7000 },
          { ingredientName: 'Khoai sọ', amount: 0.4, unit: 'kg', estimatedCost: 10400 },
          { ingredientName: 'Ngò gai', amount: 1, unit: 'bó', estimatedCost: 6000 },
          { ingredientName: 'Rau ngổ', amount: 1, unit: 'bó', estimatedCost: 6000 },
          { ingredientName: 'Củ sả', amount: 4, unit: 'củ', estimatedCost: 9600 }
        ],
        instructions: {
          preparation: 'Vịt xát muối, rượu trắng và gừng để khử mùi hôi đặc trưng, chặt miếng vừa ăn. Ướp vịt với hành, tỏi, sả băm, hạt nêm, tiêu trong 20 phút.',
          seasoning: 'Nêm gia vị hạt nêm, tiêu, sả băm cho ngấm sâu vào từng thớ thịt.',
          cookingSteps: 'Phi thơm hành tỏi sả, xào săn thịt vịt cho ra bớt mỡ. Cho sấu vào đảo cùng. Đổ nước ngập mặt thịt, đun sôi rồi hạ lửa om 20 phút. Thêm khoai sọ đã gọt vỏ vào om tiếp đến khi khoai bở mềm. Dầm sấu nêm nếm lại độ chua mặn ngọt vừa miệng, rắc mùi tàu rau ngổ.',
          presentation: 'Bê nguyên nồi lẩu om nóng lên bàn ăn, dùng kèm bún tươi hoặc cơm trắng.'
        }
      },
      // 16. Nem rán truyền thống (Món chiên tiệc)
      {
        name: 'Nem rán truyền thống',
        categoryId: cChienLuoc._id,
        price: 110000,
        costPrice: 95000,
        description: 'Chả giò truyền thống nhân tôm thịt mộc nhĩ miến dong vỏ giòn rụm chấm mắm chua ngọt',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt ba chỉ heo', amount: 0.25, unit: 'kg', estimatedCost: 35000 },
          { ingredientName: 'Tôm thẻ', amount: 0.15, unit: 'kg', estimatedCost: 30000 },
          { ingredientName: 'Bánh đa nem', amount: 1, unit: 'gói', estimatedCost: 12000 },
          { ingredientName: 'Miến dong', amount: 0.5, unit: 'gói', estimatedCost: 9000 },
          { ingredientName: 'Trứng gà', amount: 2, unit: 'quả', estimatedCost: 6400 },
          { ingredientName: 'Mộc nhĩ khô', amount: 0.02, unit: 'kg', estimatedCost: 2600 }
        ],
        instructions: {
          preparation: 'Trộn đều thịt, tôm, mộc nhĩ, nấm hương, miến, cà rốt, hành và trứng với chút hạt tiêu, bột canh để làm nhân nem.',
          seasoning: 'Trộn nhân vừa đủ tiêu và trứng để nem không bị ướt rách vỏ.',
          cookingSteps: 'Trải bánh đa nem ra mặt phẳng, múc lượng nhân vừa phải đặt vào mép bánh, gập hai bên mép lại và cuộn tròn vừa tay (không cuộn quá chặt kẻo vỡ khi rán). Đun nóng dầu ăn ngập chảo, cho nem vào rán 2 lần (lần 1 rán sơ chín tới lửa nhỏ, lần 2 rán lửa vừa cho vàng giòn rụm).',
          presentation: 'Cắt đôi nem xếp ra đĩa có lót lá xà lách tươi, ăn kèm bún và bát nước chấm tỏi ớt.'
        }
      },
      // 17. Canh kim chi đậu bò (Món canh cay)
      {
        name: 'Canh kim chi đậu bò',
        categoryId: cCanh._id,
        price: 100000,
        costPrice: 85000,
        description: 'Thịt bò mềm nấu cùng kim chi cải thảo chua cay tê nhẹ và đậu hũ non bồng bềnh',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt thăn bò', amount: 0.2, unit: 'kg', estimatedCost: 52000 },
          { ingredientName: 'Kim chi cải thảo', amount: 0.25, unit: 'kg', estimatedCost: 15000 },
          { ingredientName: 'Đậu hũ non', amount: 1, unit: 'hộp', estimatedCost: 12000 },
          { ingredientName: 'Dầu mè thơm', amount: 0.1, unit: 'chai', estimatedCost: 6000 }
        ],
        instructions: {
          preparation: 'Phi thơm tỏi với chút dầu mè, cho thịt bò vào xào tái cùng chút nước tương, múc riêng ra. Cho kim chi thái miếng vừa ăn vào xào thơm khoảng 2 phút, đổ thêm 600ml nước lọc đun sôi.',
          seasoning: 'Nêm chút nước tương, dầu mè và bột ớt Hàn Quốc nếu muốn cay nồng.',
          cookingSteps: 'Cắt đậu phụ non thành từng khoanh thả vào canh, đun sôi liu riu 5 phút cho đậu ngấm vị chua cay của kim chi. Thả thịt bò đã xào vào nồi canh sôi lại, nêm nếm vừa ăn, rắc hành lá cắt khúc và tắt bếp.',
          presentation: 'Múc ra bát tô đá giữ nhiệt nóng hổi, trang trí hành boa-rô.'
        }
      },
      // 18. Thịt ba chỉ luộc mắm tôm (Món luộc)
      {
        name: 'Thịt ba chỉ luộc mắm tôm',
        categoryId: cChienLuoc._id,
        price: 98000,
        costPrice: 85000,
        description: 'Thịt ba chỉ luộc trắng giòn bì trong thái mỏng, chấm bát mắm tôm Bắc đánh bông bọt chanh ớt',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt ba chỉ heo', amount: 0.5, unit: 'kg', estimatedCost: 70000 },
          { ingredientName: 'Mắm tôm Bắc', amount: 0.3, unit: 'hũ', estimatedCost: 9000 },
          { ingredientName: 'Chanh tươi', amount: 0.1, unit: 'kg', estimatedCost: 3000 },
          { ingredientName: 'Ớt chỉ thiên', amount: 0.05, unit: 'kg', estimatedCost: 3000 }
        ],
        instructions: {
          preparation: 'Thịt cạo sạch bì, rửa với muối và rượu trắng. Buộc chỉ định hình miếng thịt.',
          seasoning: 'Đun sôi nồi nước có đập dập 1 củ hành khô, nhánh gừng và 1 thìa cà phê giấm.',
          cookingSteps: 'Thả thịt vào luộc lửa vừa khoảng 20-25 phút. Dùng đũa xiên qua miếng thịt không thấy ứa nước đỏ là thịt đã chín tới. Vớt ra thả ngay vào âu nước đá lạnh 5 phút giúp miếng thịt trắng giòn, bì trong. Pha mắm tôm: 2 thìa mắm tôm, 1 thìa đường, 1 thìa nước cốt chanh, chút rượu trắng, đánh bông bọt lên rồi cho ớt tươi cắt lát. Thái thịt thật mỏng chấm kèm.',
          presentation: 'Thái lát thật mỏng xếp hình quạt xòe, đặt bát mắm tôm bông bọt ở giữa đĩa.'
        }
      },
      // 19. Bò xào bông cải xanh (Món xào dinh dưỡng)
      {
        name: 'Bò xào bông cải xanh',
        categoryId: cXao._id,
        price: 118000,
        costPrice: 100000,
        description: 'Thịt bò thăn mềm ngọt xào bông cải xanh giòn mướt và cà rốt tỉa hoa rực rỡ',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt thăn bò', amount: 0.25, unit: 'kg', estimatedCost: 65000 },
          { ingredientName: 'Bông cải xanh', amount: 1, unit: 'cây', estimatedCost: 18000 },
          { ingredientName: 'Cà rốt', amount: 0.2, unit: 'kg', estimatedCost: 4000 },
          { ingredientName: 'Dầu hào', amount: 0.05, unit: 'chai', estimatedCost: 13000 }
        ],
        instructions: {
          preparation: 'Thịt bò thái mỏng ngang thớ, ướp với 1/2 thìa dầu hào, tỏi băm, tiêu và 1 thìa dầu ăn cho mềm. Bông cải cắt miếng nhỏ, ngâm nước muối loãng, chần qua nước sôi 30 giây rồi vớt ráo. Cà rốt tỉa hoa thái mỏng.',
          seasoning: 'Ướp thịt bò với tỏi, dầu hào, tiêu xay cho ngấm.',
          cookingSteps: 'Phi tỏi thơm, cho thịt bò vào xào lửa lớn đảo nhanh tay đến khi vừa chín tái thì trút ra đĩa. Cho bông cải và cà rốt vào chảo xào nhanh với 1 thìa dầu hào và chút nước lọc cho chín giòn. Đổ bò vào đảo cùng 30 giây cho hòa quyện rồi tắt bếp rắc hạt tiêu.',
          presentation: 'Trút ra đĩa lớn, rắc hạt tiêu sọ đập dập, ăn nóng.'
        }
      },
      // 20. Canh nghêu nấu chua cay (Món canh hải sản)
      {
        name: 'Canh nghêu nấu chua cay',
        categoryId: cCanh._id,
        price: 52000,
        costPrice: 43000,
        description: 'Nghêu sống tươi béo nấu cà chua, dứa, me chua ngọt ấm bụng thơm nức rau răm hành hoa',
        imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Nghêu sống', amount: 0.5, unit: 'kg', estimatedCost: 32500 },
          { ingredientName: 'Cà chua', amount: 0.2, unit: 'kg', estimatedCost: 4400 },
          { ingredientName: 'Rau răm', amount: 1, unit: 'bó', estimatedCost: 6100 }
        ],
        instructions: {
          preparation: 'Nghêu ngâm nước vo gạo có vài lát ớt trong 1-2 tiếng cho nhả hết cát, cọ sạch vỏ. Luộc nghêu với chút nước và gừng sả đập dập cho mở miệng hết thì tắt bếp. Tách lấy ruột nghêu, nước luộc gạn lấy nước trong.',
          seasoning: 'Nêm nước cốt me, đường, nước mắm cho vị chua dịu thanh tao.',
          cookingSteps: 'Phi thơm hành tím, xào cà chua cho mềm, cho dứa vào đảo sơ rồi trút nước luộc nghêu cùng nước cốt me vào đun sôi. Nước sôi thả ruột nghêu vào, nêm nếm gia vị chua cay mặn ngọt vừa miệng, rắc rau răm hành hoa thái nhỏ lên trên.',
          presentation: 'Múc ra tô sâu lòng, rắc rau răm và ớt chỉ thiên cắt lát.'
        }
      },
      // 21. Cánh gà chiên nước mắm (Món chiên)
      {
        name: 'Cánh gà chiên nước mắm',
        categoryId: cChienLuoc._id,
        price: 78000,
        costPrice: 65000,
        description: 'Cánh gà chiên vàng giòn rụm đảo ngập trong sốt mắm tỏi ớt đường keo óng',
        imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Cánh gà', amount: 0.5, unit: 'kg', estimatedCost: 47500 },
          { ingredientName: 'Nước mắm cốt cá cơm', amount: 0.05, unit: 'lít', estimatedCost: 6500 },
          { ingredientName: 'Bột bắp/bột năng', amount: 0.3, unit: 'gói', estimatedCost: 5000 },
          { ingredientName: 'Tỏi ta', amount: 0.08, unit: 'kg', estimatedCost: 6000 }
        ],
        instructions: {
          preparation: 'Cánh gà làm sạch, khía nhẹ, luộc sơ qua rồi để ráo nước. Áo đều cánh gà qua một lớp bột bắp mỏng nhẹ.',
          seasoning: 'Trộn đều mắm, đường, tương ớt, nước lọc làm sốt mắm đường.',
          cookingSteps: 'Chiên ngập dầu lửa vừa tới khi chín vàng giòn rụm thì vớt ra để ráo dầu. Phi vàng thơm tỏi ớt băm, đổ bát sốt mắm vào đun sôi sủi bọt, trút cánh gà vào đảo nhanh tay ở lửa nhỏ để sốt áo đều bóng bẩy thì tắt bếp.',
          presentation: 'Xếp cánh gà ra đĩa lót rau mùi ta, rưới phần sốt tỏi ớt keo bám xung quanh.'
        }
      },
      // 22. Nấm xào dầu hào lá quế (Món xào / Chay)
      {
        name: 'Nấm xào dầu hào lá quế',
        categoryId: cXao._id,
        price: 55000,
        costPrice: 45000,
        description: 'Nấm đùi gà và nấm rơm xào dầu hào thơm nồng lá húng quế thanh đạm',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Nấm đùi gà', amount: 0.2, unit: 'kg', estimatedCost: 12000 },
          { ingredientName: 'Nấm rơm', amount: 0.2, unit: 'kg', estimatedCost: 14000 },
          { ingredientName: 'Húng quế', amount: 1, unit: 'bó', estimatedCost: 6000 },
          { ingredientName: 'Dầu hào', amount: 0.08, unit: 'chai', estimatedCost: 13000 }
        ],
        instructions: {
          preparation: 'Nấm cắt chân, ngâm rửa nước muối loãng, vắt ráo nước, cắt miếng vừa ăn.',
          seasoning: 'Pha sốt dầu hào, nước tương, tiêu xay và chút đường.',
          cookingSteps: 'Phi thơm tỏi băm, cho nấm vào đảo trên lửa lớn cho nấm săn lại và chín tới. Nêm 1.5 thìa dầu hào, 1 thìa nước tương, chút đường, xào nhanh trong 3 phút cho ngấm đều gia vị. Thả lá húng quế vào đảo sơ cho dậy mùi thơm nồng rồi tắt bếp, rắc tiêu xay và dùng nóng.',
          presentation: 'Múc ra đĩa nhỏ, rắc tiêu đen và lá quế tươi lên trên.'
        }
      },
      // 23. Đậu hũ Ma Bà (Mapo Tofu) (Món cay mặn)
      {
        name: 'Đậu hũ Ma Bà (Mapo Tofu)',
        categoryId: cKho._id,
        price: 55000,
        costPrice: 45000,
        description: 'Đậu hũ non mềm mịn sốt tương đậu bản cay nồng thịt băm chuẩn vị Tứ Xuyên',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Đậu hũ non', amount: 1, unit: 'hộp', estimatedCost: 12000 },
          { ingredientName: 'Thịt ba chỉ heo', amount: 0.1, unit: 'kg', estimatedCost: 14000 },
          { ingredientName: 'Sốt tương đậu bản Doubanjiang', amount: 0.2, unit: 'hũ', estimatedCost: 10000 },
          { ingredientName: 'Tiêu Tứ Xuyên', amount: 0.2, unit: 'gói', estimatedCost: 9000 }
        ],
        instructions: {
          preparation: 'Đậu phụ cắt khối vuông nhỏ (1.5CM*1.5CM), chần nhẹ qua nước sôi có chút muối.',
          seasoning: 'Phi thơm gừng tỏi băm, cho tương đậu bản vào xào lên màu đỏ đẹp, thêm thịt xay vào xào săn tơi.',
          cookingSteps: 'Thêm 1 bát nhỏ nước dùng đun sôi, nhẹ nhàng trút đậu phụ vào, nêm chút xì dầu và đường. Đun liu riu 3-5 phút cho đậu ngấm sốt. Rưới từ từ nước bột năng vào khuấy nhẹ cho nước sốt sánh mịn. Tắt bếp, rắc hành lá thái nhỏ và tiêu Tứ Xuyên cay tê lên trên.',
          presentation: 'Múc ra tô sâu lòng màu sẫm để làm nổi bật màu sốt đỏ cay sóng sánh.'
        }
      },
      // 24. Măng tây xào tôm tươi (Món xào cao cấp)
      {
        name: 'Măng tây xào tôm tươi',
        categoryId: cXao._id,
        price: 145000,
        costPrice: 120000,
        description: 'Tôm sú tươi giòn ngọt xào măng tây non bơ tỏi bóng bẩy xanh mướt',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Tôm sú tươi', amount: 0.25, unit: 'kg', estimatedCost: 62500 },
          { ingredientName: 'Măng tây', amount: 0.3, unit: 'kg', estimatedCost: 25500 },
          { ingredientName: 'Bơ lạt', amount: 0.3, unit: 'hộp', estimatedCost: 13500 },
          { ingredientName: 'Dầu hào', amount: 0.08, unit: 'chai', estimatedCost: 18500 }
        ],
        instructions: {
          preparation: 'Măng tây bẻ bỏ gốc già, tước xơ nhẹ, cắt khúc 4-5 cm, chần nhanh qua nước sôi rồi ngâm đá lạnh. Tôm nõn khứa lưng rút chỉ đen, ướp chút hạt nêm và tiêu.',
          seasoning: 'Ướp tôm với tiêu sọ và hạt nêm nhẹ nhàng giữ vị ngọt tự nhiên.',
          cookingSteps: 'Phi tỏi thơm với chút bơ lạt, cho tôm vào xào săn chín đỏ, xúc tôm ra đĩa. Dùng luôn chảo đó cho măng tây vào xào lửa lớn cùng 1 thìa dầu hào. Khi măng tây vừa chín giòn thì trút tôm vào đảo đều 30 giây rồi tắt bếp.',
          presentation: 'Bày ra đĩa dài trắng tinh tế, tôm đỏ cuộn quanh măng tây xanh bóng.'
        }
      },
      // 25. Canh gà lá giang (Món canh miền Nam)
      {
        name: 'Canh gà lá giang',
        categoryId: cCanh._id,
        price: 95000,
        costPrice: 80000,
        description: 'Gà ta béo ngọt nấu lá giang vò dập chua thanh dịu mát giải nhiệt tuyệt hảo',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Thịt gà ta', amount: 0.5, unit: 'kg', estimatedCost: 60000 },
          { ingredientName: 'Lá giang', amount: 1, unit: 'bó', estimatedCost: 9000 },
          { ingredientName: 'Ớt chỉ thiên', amount: 0.05, unit: 'kg', estimatedCost: 4000 },
          { ingredientName: 'Nước mắm cốt cá cơm', amount: 0.05, unit: 'lít', estimatedCost: 7000 }
        ],
        instructions: {
          preparation: 'Gà rửa sạch chặt miếng vừa ăn, ướp chút hành băm, mắm, hạt nêm trong 15 phút. Lá giang nhặt lá non, rửa sạch rồi dùng tay vò dập nhẹ để lá tiết ra vị chua khi nấu.',
          seasoning: 'Ướp gà với mắm ngon tiêu sọ. Nêm nước canh với chút đường để vị chua dịu thanh.',
          cookingSteps: 'Phi thơm hành tỏi, cho gà vào xào săn. Đổ 1 lít nước lọc vào đun sôi, hớt bọt hạ nhỏ lửa đun 10-15 phút cho gà chín mềm ngọt. Thả lá giang đã vò vào nồi canh, nấu sôi thêm 2 phút. Nêm thêm 1 thìa mắm và 1/2 thìa đường để cân bằng vị chua dịu, thêm ớt lát rồi tắt bếp.',
          presentation: 'Múc ra tô lớn, thêm vài lát ớt hiểm và ngò gai thái nhỏ.'
        }
      },
      // 26. Cá hồi áp chảo bơ chanh (Món áp chảo)
      {
        name: 'Cá hồi áp chảo bơ chanh',
        categoryId: cXao._id,
        price: 230000,
        costPrice: 190000,
        description: 'Phi lê cá hồi giòn rụm da ngoài mọng nước bên trong sốt bơ chanh vàng ngậy thơm thảo mộc',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Cá hồi phi lê', amount: 0.35, unit: 'kg', estimatedCost: 126000 },
          { ingredientName: 'Bơ lạt', amount: 0.6, unit: 'hộp', estimatedCost: 27000 },
          { ingredientName: 'Hương thảo rosemary', amount: 2, unit: 'nhánh', estimatedCost: 12000 },
          { ingredientName: 'Chanh tươi', amount: 0.2, unit: 'kg', estimatedCost: 6000 },
          { ingredientName: 'Dầu ô liu', amount: 0.1, unit: 'chai', estimatedCost: 19000 }
        ],
        instructions: {
          preparation: 'Cá hồi thấm thật khô bằng khăn giấy, rắc đều muối biển và tiêu xay lên hai mặt, ướp 10 phút.',
          seasoning: 'Làm sốt: Hạ lửa nhỏ cho bơ lạt vào đun chảy, phi thơm tỏi băm rồi đổ nước cốt chanh vàng cùng chút muối, tiêu và ngò tây băm nhỏ vào khuấy tan tạo sốt bơ bóng mượt.',
          cookingSteps: 'Đun nóng chảo với chút dầu ô liu, áp chảo mặt da cá lửa vừa trong 3-4 phút cho giòn rụm, lật mặt thịt áp tiếp 2 phút đến khi chín tới. Cho cá ra đĩa. Rưới đều sốt bơ chanh còn ấm nóng lên miếng cá hồi và thưởng thức.',
          presentation: 'Đặt phi lê cá hồi lên đĩa phẳng, trang trí nhánh hương thảo và lát chanh vàng nướng.'
        }
      },
      // 27. Nấm đùi gà kho tiêu xanh (Món kho chay)
      {
        name: 'Nấm đùi gà kho tiêu xanh',
        categoryId: cKho._id,
        price: 50000,
        costPrice: 40000,
        description: 'Nấm đùi gà kho tiêu xanh non cay nồng thơm lừng, sốt sánh quyện đậm đà đưa cơm',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Nấm đùi gà', amount: 0.35, unit: 'kg', estimatedCost: 21000 },
          { ingredientName: 'Tiêu xanh', amount: 2, unit: 'nhánh', estimatedCost: 10000 },
          { ingredientName: 'Nước tương', amount: 0.1, unit: 'chai', estimatedCost: 5000 },
          { ingredientName: 'Nước hàng dừa', amount: 0.1, unit: 'chai', estimatedCost: 4000 }
        ],
        instructions: {
          preparation: 'Nấm ngâm nước muối loãng 5 phút, rửa sạch, cắt khoanh tròn dày 1.5 cm hoặc khứa hình vảy cá. Áp chảo các khoanh nấm không dầu cho vàng xém nhẹ hai mặt để nấm dai ngon hơn.',
          seasoning: 'Ướp nấm với nước tương, nước màu dừa, đường và tiêu xanh đập dập.',
          cookingSteps: 'Phi thơm boa-rô/hành với chút dầu ăn trong nồi nhỏ, cho nấm vào đảo đều. Cho 3 thìa nước tương, 1 thìa đường, 1 thìa nước màu, tiêu xanh đập dập và 1/2 bát con nước lọc vào kho liu riu cho nấm thấm đều sốt sánh đặc lại thì rắc tiêu đen lên trên.',
          presentation: 'Múc ra tộ đất nhỏ, để nguyên vài chùm tiêu xanh tươi lên trên cùng.'
        }
      },
      // 28. Salad ức gà sốt mè rang (Món Healthy)
      {
        name: 'Salad ức gà sốt mè rang',
        categoryId: cNham._id,
        price: 75000,
        costPrice: 60000,
        description: 'Ức gà nướng thảo mộc xé sợi cùng rau xà lách Romaine, cà chua bi, dưa leo và sốt mè rang béo bùi',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Ức gà', amount: 0.25, unit: 'kg', estimatedCost: 21250 },
          { ingredientName: 'Xà lách Romaine', amount: 0.3, unit: 'kg', estimatedCost: 9000 },
          { ingredientName: 'Cà chua', amount: 0.2, unit: 'kg', estimatedCost: 4400 },
          { ingredientName: 'Dưa leo', amount: 0.2, unit: 'kg', estimatedCost: 3600 },
          { ingredientName: 'Sốt mè rang', amount: 0.3, unit: 'chai', estimatedCost: 17400 },
          { ingredientName: 'Ngô ngọt', amount: 0.5, unit: 'bắp', estimatedCost: 4350 }
        ],
        instructions: {
          preparation: 'Ức gà rửa sạch lau khô, khía vài đường nhẹ, rắc muối, tiêu và dầu ô liu. Áp chảo hoặc nướng nồi chiên không dầu ở 180°C trong 12-15 phút. Để nguội bớt rồi xé sợi hoặc thái lát.',
          seasoning: 'Xà lách, dưa leo, cà chua bi rửa sạch ngâm nước muối, vớt thật ráo nước. Xà lách cắt khúc, dưa leo cắt lát, cà chua bi bổ đôi.',
          cookingSteps: 'Bày rau củ và ngô ngọt vào đĩa sâu lòng, xếp ức gà lên trên cùng. Khi ăn rưới sốt mè rang lên trên và trộn đều.',
          presentation: 'Bày đĩa sâu lòng màu gỗ hoặc sứ trắng, rưới sốt mè rang theo hình zíc zắc đẹp mắt.'
        }
      },
      // 29. Trứng hấp vân thịt kiểu Nhật (Món hấp)
      {
        name: 'Trứng hấp vân thịt kiểu Nhật',
        categoryId: cChienLuoc._id,
        price: 48000,
        costPrice: 38000,
        description: 'Chawanmushi trứng hấp bồng bềnh mịn như lụa với thịt băm tôm ngọt và nấm hương nước dashi thanh',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Trứng gà', amount: 2, unit: 'quả', estimatedCost: 6400 },
          { ingredientName: 'Thịt ba chỉ heo', amount: 0.08, unit: 'kg', estimatedCost: 11200 },
          { ingredientName: 'Tôm thẻ', amount: 0.05, unit: 'kg', estimatedCost: 10000 },
          { ingredientName: 'Nấm hương', amount: 0.05, unit: 'kg', estimatedCost: 6000 },
          { ingredientName: 'Bột Dashi', amount: 0.08, unit: 'gói', estimatedCost: 4400 }
        ],
        instructions: {
          preparation: 'Đánh tan trứng gà nhẹ tay để không tạo bọt khí. Hòa tan nước dùng dashi cùng chút nước tương nhạt, sau đó đổ vào trứng khuấy đều. Lọc hỗn hợp trứng qua rây 2 lần để mặt trứng sau hấp được láng mịn.',
          seasoning: 'Nêm chút nước tương nhạt và bột dashi kiểu Nhật tạo vị ngọt thanh umami.',
          cookingSteps: 'Cho thịt băm/tôm và vài lát nấm hương xuống đáy chén sứ, rót hỗn hợp trứng vào gần đầy chén. Bọc kín miệng chén bằng giấy bạc. Hấp cách thủy lửa thật nhỏ trong 12-15 phút đến khi trứng đông mịn bồng bềnh là hoàn thành.',
          presentation: 'Phục vụ nguyên chén sứ có nắp đậy kèm thìa gỗ nhỏ.'
        }
      },
      // 30. Chè hạt sen long nhãn (Món tráng miệng)
      {
        name: 'Chè hạt sen long nhãn',
        categoryId: cTrangMieng._id,
        price: 90000,
        costPrice: 75000,
        description: 'Hạt sen tươi bở bùi lồng trong long nhãn Hưng Yên giòn ngọt nước đường phèn lá dứa thanh mát',
        imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
        station: 'kitchen',
        recipe: [
          { ingredientName: 'Hạt sen tươi', amount: 0.25, unit: 'kg', estimatedCost: 30000 },
          { ingredientName: 'Long nhãn Hưng Yên', amount: 0.15, unit: 'kg', estimatedCost: 33000 },
          { ingredientName: 'Đường phèn', amount: 0.2, unit: 'kg', estimatedCost: 7000 },
          { ingredientName: 'Lá dứa tươi', amount: 0.5, unit: 'bó', estimatedCost: 5000 }
        ],
        instructions: {
          preparation: 'Hạt sen thông tâm để tránh bị đắng, rửa sạch. Long nhãn ngâm nước ấm cho nở mềm, vớt ra để ráo.',
          seasoning: 'Nấu với đường phèn thanh khiết và cuộn lá dứa tươi tạo mùi thơm ngọt ngào.',
          cookingSteps: 'Cho hạt sen vào nồi với lượng nước vừa ngập, đun sôi rồi hạ nhỏ lửa hầm khoảng 15-20 phút cho sen bở mềm tơi không nát. Thêm đường phèn và lá dứa vào nồi, đun lửa nhỏ 5 phút cho sen ngấm vị ngọt thanh. Long nhãn ngâm nước ấm cho nở mềm, vớt ra thả vào nồi chè đun sôi lại 1 phút là tắt bếp ngay để giữ độ giòn sần sật. Dùng nóng hoặc ướp lạnh.',
          presentation: 'Múc ra bát thủy tinh trong suốt, có thể thêm đá bào hoặc ăn nóng tùy mùa.'
        }
      },

      // Đồ uống bổ sung (Kèm Bia Heineken sửa ảnh chuẩn theo đặc tả)
      {
        name: 'Bia Heineken Lon Ướp Lạnh',
        categoryId: cTrangMieng._id,
        price: 32000,
        costPrice: 19000,
        description: 'Bia Heineken lon 330ml ướp đá lạnh sảng khoái',
        imageUrl: '/assets/heineken.png',
        station: 'bar',
        recipe: [
          { ingredientName: 'Bia Heineken lon', amount: 1, unit: 'lon', estimatedCost: 19000 }
        ],
        instructions: {
          preparation: 'Lấy lon Heineken từ tủ mát 2-4 độ C.',
          seasoning: 'Chuẩn bị ly thủy tinh có đá bi sạch.',
          cookingSteps: 'Bật nắp lon bia rót nhẹ nghiêng ly 45 độ tạo lớp bọt trắng mịn 2cm.',
          presentation: 'Phục vụ kèm đĩa đậu phộng rang hoặc đồ nhắm.'
        }
      },
      {
        name: 'Bia Tiger Crystal Bạc',
        categoryId: cTrangMieng._id,
        price: 30000,
        costPrice: 18000,
        description: 'Bia Tiger Crystal lên men lạnh cực đã',
        imageUrl: '/assets/tiger.png',
        station: 'bar',
        recipe: [
          { ingredientName: 'Bia Tiger Crystal', amount: 1, unit: 'lon', estimatedCost: 18000 }
        ],
        instructions: {
          preparation: 'Lon bảo quản tủ mát.',
          seasoning: '',
          cookingSteps: 'Rót ly đá lạnh.',
          presentation: 'Phục vụ lạnh.'
        }
      },
      {
        name: 'Nước Ngọt Coca-Cola',
        categoryId: cTrangMieng._id,
        price: 18000,
        costPrice: 9500,
        description: 'Coca-Cola lon 320ml ướp lạnh sảng khoái',
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
        station: 'bar',
        recipe: [
          { ingredientName: 'Nước ngọt Coca-Cola', amount: 1, unit: 'lon', estimatedCost: 9500 }
        ],
        instructions: {
          preparation: 'Lấy từ tủ mát.',
          seasoning: 'Kèm lát chanh tươi trong ly.',
          cookingSteps: 'Rót đầy ly đá.',
          presentation: 'Phục vụ kèm ống hút.'
        }
      }
    ];

    const createdDishes = await MenuItem.create(dishes30);
    console.log(`🍲 Đã tạo ${createdDishes.length} món ăn và đồ uống (Gồm đúng 30 món gia đình chuẩn đặc tả)`);

    // 6. Tạo đơn hàng và hóa đơn mẫu
    const sampleTable = createdTables[0]; // Bàn 01
    const sampleOrder = await Order.create({
      tableId: sampleTable._id,
      orderCode: 'ORD-20261022-001',
      guestCount: 4,
      status: 'completed',
      items: [
        {
          menuItemId: createdDishes[0]._id,
          name: createdDishes[0].name,
          price: createdDishes[0].price,
          quantity: 2,
          station: 'kitchen',
          status: 'served'
        },
        {
          menuItemId: createdDishes[1]._id,
          name: createdDishes[1].name,
          price: createdDishes[1].price,
          quantity: 1,
          station: 'kitchen',
          status: 'served'
        },
        {
          menuItemId: createdDishes[createdDishes.length - 3]._id,
          name: createdDishes[createdDishes.length - 3].name,
          price: createdDishes[createdDishes.length - 3].price,
          quantity: 4,
          station: 'bar',
          status: 'served'
        }
      ],
      totalAmount: 498000
    });

    await Invoice.create({
      invoiceCode: 'INV-20261022-001',
      orderId: sampleOrder._id,
      tableId: sampleTable._id,
      subtotal: 498000,
      discountAmount: 0,
      vatPercent: 8,
      vatAmount: 39840,
      finalAmount: 537840,
      paymentMethod: 'vietqr',
      paymentStatus: 'paid',
      cashierName: 'Trần Thu Ngân',
      paidAt: new Date()
    });
    console.log('💰 Đã tạo hóa đơn mẫu');

    // 7. Tạo dữ liệu điện nước mẫu
    await Utility.create([
      {
        monthYear: '9/2026',
        electricity: { oldIndex: 14200, newIndex: 16150, consumed: 1950, unitPrice: 3500, totalAmount: 6825000 },
        water: { oldIndex: 510, newIndex: 588, consumed: 78, unitPrice: 25000, totalAmount: 1950000 },
        totalBill: 8775000,
        status: 'paid',
        recordedBy: 'Phạm Tổng Quản Lý'
      },
      {
        monthYear: '10/2026',
        electricity: { oldIndex: 16150, newIndex: 18100, consumed: 1950, unitPrice: 3500, totalAmount: 6825000 },
        water: { oldIndex: 588, newIndex: 660, consumed: 72, unitPrice: 25000, totalAmount: 1800000 },
        totalBill: 8625000,
        status: 'paid',
        recordedBy: 'Phạm Tổng Quản Lý'
      }
    ]);
    console.log('⚡ Đã tạo dữ liệu điện nước mẫu');

    console.log('🎉 TOÀN BỘ DỮ LIỆU ĐÃ ĐƯỢC SEED THÀNH CÔNG RỰC RỠ!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi seed cơ sở dữ liệu:', error);
    process.exit(1);
  }
};

seedDatabase();
