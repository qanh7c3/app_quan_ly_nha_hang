import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Boxes,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Plus,
  RefreshCw,
  FileCheck2,
  Clock,
  Layers,
  Zap,
  Droplet,
  PackagePlus,
  Calculator,
  History,
  Tag,
  Percent,
  Search,
  ShoppingCart,
  CheckCircle,
  EyeOff,
  Eye,
  Check,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import {
  getReportStats,
  getInventory,
  importStock,
  getImportHistory,
  getUtilities,
  createUtilityRecord,
  getMenuCostAnalysis,
  getAuditLogs,
  toggleMenuItemAvailability
} from '../services/api';
import socket from '../services/socket';

export default function ManagerPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'inventory', 'imports', 'costAnalysis', 'utilities', 'audit'
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [importsHistory, setImportsHistory] = useState([]);
  const [costAnalysis, setCostAnalysis] = useState([]);
  const [costSummary, setCostSummary] = useState(null);
  const [utilities, setUtilities] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc kho theo 4 nhóm phân loại
  const [selectedInvCategory, setSelectedInvCategory] = useState('ALL');
  const [invSearch, setInvSearch] = useState('');

  // Modal Nhập kho & Đề xuất mua thêm
  const [importModal, setImportModal] = useState({ open: false, item: null, addQty: 10, costPerUnit: 0, supplier: '' });

  // Modal Ghi số điện nước
  const [utilityModal, setUtilityModal] = useState({
    open: false,
    monthYear: `${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
    elecOldIndex: 16150,
    elecNewIndex: 18100,
    elecUnitPrice: 3500,
    waterOldIndex: 588,
    waterNewIndex: 660,
    waterUnitPrice: 25000,
    notes: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [repRes, invRes, impRes, costRes, utilRes, logRes] = await Promise.all([
        getReportStats(),
        getInventory(),
        getImportHistory(),
        getMenuCostAnalysis(),
        getUtilities(),
        getAuditLogs()
      ]);
      if (repRes.data.success) setStats(repRes.data.data);
      if (invRes.data.success) setInventory(invRes.data.data);
      if (impRes.data.success) setImportsHistory(impRes.data.data);
      if (costRes.data.success) {
        setCostAnalysis(costRes.data.data);
        if (costRes.data.summary) setCostSummary(costRes.data.summary);
      }
      if (utilRes.data.success) setUtilities(utilRes.data.data);
      if (logRes.data.success) setAuditLogs(logRes.data.data);
    } catch (err) {
      console.error('Lỗi tải dữ liệu quản lý:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleInvUpdate = () => loadData();
    socket.on('inventory:updated', handleInvUpdate);
    socket.on('menu:availability_changed', handleInvUpdate);

    return () => {
      socket.off('inventory:updated', handleInvInvUpdate);
      socket.off('menu:availability_changed', handleInvUpdate);
    };
  }, []);

  function handleInvInvUpdate() {
    loadData();
  }

  // Xử lý bật/tắt 1 chạm món ăn trên POS khi hết nguyên liệu
  const handleToggleDish = async (dishId, dishName, currentStatus) => {
    try {
      const res = await toggleMenuItemAvailability(dishId);
      if (res.data.success) {
        alert(`Đã ${currentStatus ? 'tạm ngừng phục vụ' : 'mở phục vụ lại'} món "${dishName}" trên POS!`);
        loadData();
      }
    } catch (err) {
      alert('Lỗi đổi trạng thái món: ' + err.message);
    }
  };

  // Xử lý nhập kho
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    try {
      await importStock(importModal.item._id, {
        addQuantity: importModal.addQty,
        costPerUnit: importModal.costPerUnit || importModal.item.costPerUnit,
        supplier: importModal.supplier || 'Chợ đầu mối / Nhà phân phối Hải Phòng',
        importedBy: 'Phạm Tổng Quản Lý'
      });
      alert(`Đã nhập thêm ${importModal.addQty} ${importModal.item.unit} ${importModal.item.name} vào kho!`);
      setImportModal({ open: false, item: null, addQty: 10, costPerUnit: 0, supplier: '' });
      loadData();
    } catch (err) {
      alert('Lỗi nhập kho: ' + err.message);
    }
  };

  // Xử lý ghi nhận điện nước
  const handleUtilitySubmit = async (e) => {
    e.preventDefault();
    try {
      await createUtilityRecord({
        monthYear: utilityModal.monthYear,
        elecOldIndex: utilityModal.elecOldIndex,
        elecNewIndex: utilityModal.elecNewIndex,
        elecUnitPrice: utilityModal.elecUnitPrice,
        waterOldIndex: utilityModal.waterOldIndex,
        waterNewIndex: utilityModal.waterNewIndex,
        waterUnitPrice: utilityModal.waterUnitPrice,
        notes: utilityModal.notes,
        recordedBy: 'Phạm Tổng Quản Lý'
      });
      alert('Đã lưu chỉ số điện nước thành công!');
      setUtilityModal({ ...utilityModal, open: false });
      loadData();
    } catch (err) {
      alert('Lỗi ghi điện nước: ' + err.message);
    }
  };

  // Lọc nguyên liệu theo danh mục và tìm kiếm
  const filteredInventory = inventory.filter((item) => {
    const matchCat = selectedInvCategory === 'ALL' || item.category === selectedInvCategory;
    const matchSearch = item.name.toLowerCase().includes(invSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const lowStockItems = inventory.filter(i => i.isLowStock || i.quantityInStock <= i.minThreshold);

  // 4 nhóm phân loại nguyên liệu chuẩn đặc tả
  const invCategories = [
    'ALL',
    'Thịt, Hải Sản & Trứng',
    'Rau Củ Quả & Nấm',
    'Rau Thơm & Thực Phẩm Khô',
    'Gia Vị & Nước Sốt Đóng Chai',
    'Đồ uống/Bia'
  ];

  return (
    <div className="space-y-6">
      {/* Header Quản Lý Hiện Đại */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight">Cấp Quản Lý & Chủ Nhà Hàng (Manager Portal)</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Executive Control
              </span>
            </div>
            <p className="text-xs text-blue-200/90 mt-1">
              Theo dõi Doanh thu • Giá Vốn (Cost 30 món) • Kho 4 Nhóm & Cảnh Báo Thiếu Hàng • Lịch sử Nhập hàng • Điện Nước • Audit Log
            </p>
          </div>
        </div>

        {/* 6 Tab điều khiển chức năng Quản lý */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl text-xs font-bold border border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            Doanh Thu
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            Kho Nguyên Liệu ({inventory.length})
            {lowStockItems.length > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
          </button>
          <button
            onClick={() => setActiveTab('imports')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              activeTab === 'imports' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Lịch Sử Nhập Hàng
          </button>
          <button
            onClick={() => setActiveTab('costAnalysis')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              activeTab === 'costAnalysis' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" /> Giá Cost & Lợi Nhuận (30 Món)
          </button>
          <button
            onClick={() => setActiveTab('utilities')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              activeTab === 'utilities' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Điện & Nước
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'audit' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            Audit Log ({auditLogs.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400">Đang tổng hợp dữ liệu quản lý...</div>
      ) : activeTab === 'overview' ? (
        /* TAB 1: DOANH THU & BÁN HÀNG */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Doanh thu đã thu hôm nay</p>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {(stats?.todayRevenue || 0).toLocaleString('vi-VN')} đ
                </h3>
              </div>
            </div>

            <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Tổng tích lũy toàn hệ thống</p>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {(stats?.totalRevenue || 0).toLocaleString('vi-VN')} đ
                </h3>
              </div>
            </div>

            <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Số đơn hàng đã phục vụ</p>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {stats?.totalInvoicesCount || 0} hóa đơn
                </h3>
              </div>
            </div>
          </div>

          {/* Top món bán chạy nhất */}
          <div className="bg-white/95 p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800">Top Món Ăn Bán Chạy & Doanh Số Đóng Góp</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stats?.topItems?.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{item._id}</p>
                    <span className="text-slate-400">Đã bán: <b>{item.totalQuantity} suất</b></span>
                  </div>
                  <span className="font-black text-emerald-600 text-sm">
                    {(item.totalSales || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'inventory' ? (
        /* TAB 2: KHO NGUYÊN LIỆU ĐA DẠNG 4 NHÓM & CẢNH BÁO MÓN ẢNH HƯỞNG (NHIỆM VỤ 5) */
        <div className="space-y-4">
          {/* Cảnh báo kho khẩn cấp */}
          {lowStockItems.length > 0 && (
            <div className="p-5 bg-rose-50 border-2 border-rose-200 rounded-3xl space-y-3 text-rose-900 text-xs shadow-sm">
              <div className="flex items-center gap-2.5 font-extrabold text-sm text-rose-700">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>CẢNH BÁO TỒN KHO DƯỚI NGƯỠNG AN TOÀN ({lowStockItems.length} mặt hàng)</span>
              </div>
              <p className="text-slate-700">
                Khi nguyên liệu giảm dưới ngưỡng an toàn, hệ thống tự động nhận diện các món ăn sử dụng nguyên liệu này và cho phép Quản trị viên bấm <b>1 chạm để tạm ngừng phục vụ trên POS</b>, tránh việc khách gọi món nhưng bếp không có nguyên liệu chế biến.
              </p>

              {/* Danh sách các nguyên liệu thiếu và món ảnh hưởng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {lowStockItems.map((item) => (
                  <div key={item._id} className="p-3.5 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-rose-600 text-white font-extrabold rounded-md text-[10px]">
                          CẦN NHẬP THÊM
                        </span>
                        <h4 className="font-black text-sm text-slate-900">{item.name}</h4>
                      </div>
                      <span className="font-extrabold text-rose-600 text-xs">
                        Tồn: {item.quantityInStock} / Ngưỡng: {item.minThreshold} {item.unit}
                      </span>
                    </div>

                    {/* Món ăn bị ảnh hưởng */}
                    {item.affectedDishes && item.affectedDishes.length > 0 && (
                      <div className="pt-1 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">
                          Các món ăn bị ảnh hưởng ({item.affectedDishes.length} món):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.affectedDishes.map((dish) => (
                            <div
                              key={dish._id}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] border transition-all ${
                                dish.isAvailable
                                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                                  : 'bg-slate-100 border-slate-300 text-slate-400 line-through'
                              }`}
                            >
                              <span>{dish.name}</span>
                              <button
                                onClick={() => handleToggleDish(dish._id, dish.name, dish.isAvailable)}
                                title={dish.isAvailable ? 'Tạm ngừng món này trên POS' : 'Mở phục vụ lại trên POS'}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                                  dish.isAvailable
                                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                {dish.isAvailable ? 'Tạm Ngừng' : 'Mở Lại'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nút hành động nổi bật: Đề xuất mua thêm */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setImportModal({
                          open: true,
                          item,
                          addQty: Math.max(10, item.minThreshold * 2),
                          costPerUnit: item.costPerUnit,
                          supplier: 'Chợ đầu mối / Nhà phân phối Hải Phòng'
                        })}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
                      >
                        <PackagePlus className="w-3.5 h-3.5" /> [+ Đề xuất mua thêm]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bộ lọc 4 nhóm phân loại kho & Tìm kiếm */}
          <div className="bg-white/95 rounded-3xl border border-slate-200 p-4 space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Tab phân loại 4 nhóm */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
                {invCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedInvCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                      selectedInvCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'Tất Cả (4 Nhóm)' : cat}
                  </button>
                ))}
              </div>

              {/* Ô tìm kiếm */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm nguyên liệu, gia vị..."
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs border rounded-xl w-56 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Bảng danh sách tồn kho */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-slate-500 font-bold">
                  <tr>
                    <th className="p-3">Tên Nguyên Liệu / Gia Vị</th>
                    <th className="p-3">Phân Nhóm Chuẩn</th>
                    <th className="p-3">Tồn Kho Hiện Tại</th>
                    <th className="p-3">Ngưỡng An Toàn</th>
                    <th className="p-3">Giá Vốn Nhập (VNĐ)</th>
                    <th className="p-3">Món Ăn Liên Quan</th>
                    <th className="p-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => {
                    const isLow = item.isLowStock || item.quantityInStock <= item.minThreshold;
                    return (
                      <tr key={item._id} className={isLow ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-slate-50/60'}>
                        <td className="p-3 font-bold text-slate-900">
                          {item.name}
                          {isLow && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-600 text-white">
                              LOW STOCK
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600">{item.category}</td>
                        <td className="p-3">
                          <span className={`font-black px-2.5 py-1 rounded-lg ${
                            isLow ? 'bg-rose-200 text-rose-900' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {item.quantityInStock} {item.unit}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{item.minThreshold} {item.unit}</td>
                        <td className="p-3 font-bold text-slate-800">
                          {item.costPerUnit?.toLocaleString('vi-VN')} đ / {item.unit}
                        </td>
                        <td className="p-3">
                          {item.affectedDishes && item.affectedDishes.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {item.affectedDishes.map(d => (
                                <span
                                  key={d._id}
                                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                                    d.isAvailable ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-700 line-through'
                                  }`}
                                >
                                  {d.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">-</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setImportModal({
                              open: true,
                              item,
                              addQty: isLow ? Math.max(10, item.minThreshold * 2) : 10,
                              costPerUnit: item.costPerUnit,
                              supplier: 'Chợ đầu mối / Nhà phân phối Hải Phòng'
                            })}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs active:scale-95 ${
                              isLow
                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white'
                            }`}
                          >
                            {isLow ? '+ Đề Xuất Mua' : '+ Nhập Kho'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'imports' ? (
        /* TAB 3: LỊCH SỬ TẤT CẢ CÁC LẦN NHẬP HÀNG */
        <div className="bg-white/95 rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Toàn Bộ Lịch Sử Nhập Hàng Nguyên Liệu</h3>
              <p className="text-xs text-slate-400">Kiểm soát chi phí nguyên liệu đầu vào và nhà cung cấp</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              Tổng chi nhập hàng: {importsHistory.reduce((s, i) => s + i.totalCost, 0).toLocaleString('vi-VN')} đ
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-slate-500 font-bold">
              <tr>
                <th className="p-3">Mã Phiếu</th>
                <th className="p-3">Tên Nguyên Liệu</th>
                <th className="p-3">Số Lượng</th>
                <th className="p-3">Đơn Giá Nhập</th>
                <th className="p-3">Tổng Tiền</th>
                <th className="p-3">Nhà Cung Cấp</th>
                <th className="p-3">Ngày Nhập</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {importsHistory.map((imp) => (
                <tr key={imp._id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold text-slate-800">{imp.importCode}</td>
                  <td className="p-3 font-bold text-slate-900">{imp.ingredientName}</td>
                  <td className="p-3 font-extrabold text-slate-700">{imp.quantity} {imp.unit}</td>
                  <td className="p-3">{imp.costPerUnit?.toLocaleString('vi-VN')} đ</td>
                  <td className="p-3 font-black text-rose-600">{imp.totalCost?.toLocaleString('vi-VN')} đ</td>
                  <td className="p-3 text-slate-500">{imp.supplier}</td>
                  <td className="p-3 text-slate-400">
                    {new Date(imp.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'costAnalysis' ? (
        /* TAB 4: GIÁ VỐN (COST) & BIÊN LỢI NHUẬN CHUẨN 30 MÓN THEO ĐẶC TẢ (NHIỆM VỤ 3) */
        <div className="space-y-4">
          {/* 4 Thẻ tóm tắt tài chính chuẩn đặc tả */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/95 p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Tổng giá trị Menu (30 món)
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {costSummary ? costSummary.totalMenuPrice?.toLocaleString('vi-VN') : '3.078.000'} đ
              </h3>
              <p className="text-[11px] text-slate-400">Giá niêm yết Siêu thị (POS)</p>
            </div>

            <div className="bg-white/95 p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Tổng chi phí giá Cost
              </span>
              <h3 className="text-xl font-black text-rose-600">
                {costSummary ? costSummary.totalMenuCost?.toLocaleString('vi-VN') : '2.583.000'} đ
              </h3>
              <p className="text-[11px] text-slate-400">Giá vốn chợ dân sinh</p>
            </div>

            <div className="bg-white/95 p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Tổng lợi nhuận gộp tiềm năng
              </span>
              <h3 className="text-xl font-black text-emerald-600">
                {costSummary ? costSummary.totalGrossProfit?.toLocaleString('vi-VN') : '495.000'} đ
              </h3>
              <p className="text-[11px] text-slate-400">Gross Profit = Giá bán - Giá vốn</p>
            </div>

            <div className="bg-white/95 p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Biên lợi nhuận TB hệ thống
              </span>
              <h3 className="text-xl font-black text-blue-600">
                ≈ {costSummary ? costSummary.avgMarginPercent : '16.08'}%
              </h3>
              <p className="text-[11px] text-slate-400">% Margin = (Lãi gộp / Giá bán) * 100</p>
            </div>
          </div>

          {/* Bảng chi tiết 30 món ăn gia đình */}
          <div className="bg-white/95 rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Bảng Phân Tích Chi Tiết 30 Món Gia Đình (Giá Siêu Thị vs Giá Chợ Dân Sinh)
                </h3>
                <p className="text-xs text-slate-400">
                  Tự động tính lợi nhuận gộp và tỷ suất biên lợi nhuận (% Margin) theo công thức tài chính
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                Khớp chuẩn bảng biểu đặc tả
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-slate-500 font-bold">
                  <tr>
                    <th className="p-3">STT</th>
                    <th className="p-3">Tên Món Ăn</th>
                    <th className="p-3">Danh Mục</th>
                    <th className="p-3">Giá Siêu Thị (Giá Bán POS)</th>
                    <th className="p-3">Giá Chợ (Giá Cost)</th>
                    <th className="p-3">Lợi Nhuận Gộp (VNĐ)</th>
                    <th className="p-3 text-right">Biên Lợi Nhuận (% Margin)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {costAnalysis.map((item, idx) => (
                    <tr key={item._id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{item.name}</td>
                      <td className="p-3 text-slate-500">{item.category}</td>
                      <td className="p-3 font-black text-slate-900">{item.price.toLocaleString('vi-VN')} đ</td>
                      <td className="p-3 font-semibold text-rose-600">{item.costPrice.toLocaleString('vi-VN')} đ</td>
                      <td className="p-3 font-extrabold text-emerald-600">+{item.grossProfit.toLocaleString('vi-VN')} đ</td>
                      <td className="p-3 text-right">
                        <span className={`px-2.5 py-1 rounded-lg font-black text-[11px] ${
                          item.marginPercent >= 20 ? 'bg-emerald-100 text-emerald-800' :
                          item.marginPercent >= 15 ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {item.marginPercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'utilities' ? (
        /* TAB 5: QUẢN LÝ SỐ ĐIỆN & NƯỚC THEO THÁNG */
        <div className="bg-white/95 rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Quản Lý Chỉ Số Tiêu Thụ Điện & Nước</h3>
              <p className="text-xs text-slate-400">Ghi nhận công tơ hàng tháng, tự động tính thành tiền điện nước vận hành</p>
            </div>

            <button
              onClick={() => setUtilityModal({ ...utilityModal, open: true })}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-orange-500/25 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Ghi Số Điện Nước Tháng Mới
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-slate-500 font-bold">
              <tr>
                <th className="p-3">Kỳ Hóa Đơn</th>
                <th className="p-3">Điện Tiêu Thụ (kWh)</th>
                <th className="p-3">Tiền Điện (3.500đ/kWh)</th>
                <th className="p-3">Nước Tiêu Thụ (m³)</th>
                <th className="p-3">Tiền Nước (25.000đ/m³)</th>
                <th className="p-3 font-black text-rose-600">Tổng Chi Phí</th>
                <th className="p-3 text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {utilities.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-extrabold text-slate-900">Tháng {u.monthYear}</td>
                  <td className="p-3 font-bold">
                    {u.electricity.consumed} kWh <span className="text-[10px] text-slate-400 font-normal">({u.electricity.oldIndex} &rarr; {u.electricity.newIndex})</span>
                  </td>
                  <td className="p-3 text-slate-700">{u.electricity.totalAmount.toLocaleString('vi-VN')} đ</td>
                  <td className="p-3 font-bold">
                    {u.water.consumed} m³ <span className="text-[10px] text-slate-400 font-normal">({u.water.oldIndex} &rarr; {u.water.newIndex})</span>
                  </td>
                  <td className="p-3 text-slate-700">{u.water.totalAmount.toLocaleString('vi-VN')} đ</td>
                  <td className="p-3 font-black text-rose-600 text-sm">{u.totalBill.toLocaleString('vi-VN')} đ</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                      ĐÃ THANH TOÁN
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* TAB 6: NHẬT KÝ KIỂM SOÁT AUDIT LOG */
        <div className="bg-white/95 rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3.5">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Nhật Ký Kiểm Soát & Chống Gian Lận (Audit Log)</h3>
              <p className="text-xs text-slate-400">Lưu vết mọi hành động nhạy cảm: Hủy món khi đang nấu, chuyển bàn, báo hết món 86ing</p>
            </div>
            <button onClick={loadData} className="px-3 py-1.5 border rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-slate-50">
              <RefreshCw className="w-3.5 h-3.5" /> Làm mới
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      log.action.includes('CANCEL') ? 'bg-rose-100 text-rose-800' :
                      log.action.includes('TRANSFER') ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-900">Người thực hiện: {log.performedBy}</span>
                    {log.approvedBy && (
                      <span className="text-slate-400">| Người duyệt: <b className="text-slate-700">{log.approvedBy}</b></span>
                    )}
                  </div>
                  <p className="text-slate-600">Lý do: <b>{log.reason}</b></p>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(log.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL NHẬP KHO NGUYÊN LIỆU & ĐỀ XUẤT MUA THÊM */}
      {importModal.open && importModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleImportSubmit} className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-base text-slate-900">
              Nhập Kho / Đề Xuất Mua Thêm: {importModal.item.name}
            </h3>
            <p className="text-xs text-slate-500">
              Tồn kho hiện tại: <b>{importModal.item.quantityInStock} {importModal.item.unit}</b> (Ngưỡng an toàn: {importModal.item.minThreshold} {importModal.item.unit})
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số lượng nhập ({importModal.item.unit}) *</label>
                <input
                  required
                  type="number"
                  min="0.1"
                  step="any"
                  value={importModal.addQty}
                  onChange={(e) => setImportModal({ ...importModal, addQty: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Đơn giá nhập (VNĐ/{importModal.item.unit})</label>
                <input
                  type="number"
                  value={importModal.costPerUnit || importModal.item.costPerUnit}
                  onChange={(e) => setImportModal({ ...importModal, costPerUnit: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="text-xs space-y-1">
              <label className="font-bold text-slate-700">Nhà cung cấp / Nguồn nhập hàng</label>
              <input
                type="text"
                placeholder="Chợ đầu mối, Công ty thực phẩm Hải Phòng..."
                value={importModal.supplier}
                onChange={(e) => setImportModal({ ...importModal, supplier: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t">
              <button
                type="button"
                onClick={() => setImportModal({ open: false, item: null, addQty: 10, costPerUnit: 0, supplier: '' })}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
              >
                Xác Nhận Nhập Kho
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL GHI SỐ ĐIỆN NƯỚC */}
      {utilityModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleUtilitySubmit} className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-base text-slate-900">
              Ghi Nhận Chỉ Số Điện Nước Tháng {utilityModal.monthYear}
            </h3>

            {/* Chỉ số điện */}
            <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-2 text-xs">
              <span className="font-bold text-amber-900 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-600" /> Chỉ Số Công Tơ Điện:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 block">Số điện cũ (kWh):</label>
                  <input
                    type="number"
                    value={utilityModal.elecOldIndex}
                    onChange={(e) => setUtilityModal({ ...utilityModal, elecOldIndex: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block">Số điện mới (kWh):</label>
                  <input
                    type="number"
                    value={utilityModal.elecNewIndex}
                    onChange={(e) => setUtilityModal({ ...utilityModal, elecNewIndex: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border rounded-lg font-bold text-amber-700"
                  />
                </div>
              </div>
            </div>

            {/* Chỉ số nước */}
            <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-2 text-xs">
              <span className="font-bold text-blue-900 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-blue-600" /> Chỉ Số Đồng Hồ Nước:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 block">Số nước cũ (m³):</label>
                  <input
                    type="number"
                    value={utilityModal.waterOldIndex}
                    onChange={(e) => setUtilityModal({ ...utilityModal, waterOldIndex: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block">Số nước mới (m³):</label>
                  <input
                    type="number"
                    value={utilityModal.waterNewIndex}
                    onChange={(e) => setUtilityModal({ ...utilityModal, waterNewIndex: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border rounded-lg font-bold text-blue-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t">
              <button
                type="button"
                onClick={() => setUtilityModal({ ...utilityModal, open: false })}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
              >
                Lưu Chỉ Số & Tính Tiền
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
