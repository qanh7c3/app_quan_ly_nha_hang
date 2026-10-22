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
  ShoppingCart
} from 'lucide-react';
import {
  getReportStats,
  getInventory,
  importStock,
  getImportHistory,
  getUtilities,
  createUtilityRecord,
  getMenuCostAnalysis,
  getAuditLogs
} from '../services/api';

export default function ManagerPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'inventory', 'imports', 'costAnalysis', 'utilities', 'audit'
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [importsHistory, setImportsHistory] = useState([]);
  const [costAnalysis, setCostAnalysis] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Nhập kho
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
      if (costRes.data.success) setCostAnalysis(costRes.data.data);
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
  }, []);

  // Xử lý nhập kho
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    try {
      await importStock(importModal.item._id, {
        addQuantity: importModal.addQty,
        costPerUnit: importModal.costPerUnit || importModal.item.costPerUnit,
        supplier: importModal.supplier,
        importedBy: 'Tổng Quản Lý'
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
        recordedBy: 'Tổng Quản Lý'
      });
      alert('Đã lưu chỉ số điện nước thành công!');
      setUtilityModal({ ...utilityModal, open: false });
      loadData();
    } catch (err) {
      alert('Lỗi ghi điện nước: ' + err.message);
    }
  };

  const lowStockItems = inventory.filter(i => i.quantityInStock <= i.minThreshold);

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
              Theo dõi Doanh thu • Giá Vốn (Cost) • Lịch sử Nhập hàng & Bán hàng • Tiền Điện Nước • Nhật ký Audit Log
            </p>
          </div>
        </div>

        {/* 6 Tab điều khiển chức năng Quản lý */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl text-xs font-bold">
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
            <Calculator className="w-3.5 h-3.5" /> Giá Cost & Lợi Nhuận
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
            <div className="bg-white/90 p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
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

            <div className="bg-white/90 p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
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

            <div className="bg-white/90 p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
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
          <div className="bg-white/90 p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
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
        /* TAB 2: KHO NGUYÊN LIỆU ĐA DẠNG & GIA VỊ ĐƠN LẺ */
        <div className="space-y-4">
          {lowStockItems.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-3xl flex items-center gap-3 text-rose-800 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold">Cảnh báo nguyên liệu sắp hết:</p>
                <p>
                  Có {lowStockItems.length} mặt hàng đã giảm dưới ngưỡng an toàn (ví dụ: {lowStockItems.map(i => i.name).join(', ')}). Cần nhập bổ sung ngay để Bếp không bị thiếu!
                </p>
              </div>
            </div>
          )}

          <div className="bg-white/95 rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <span className="font-extrabold text-sm text-slate-800">
                Danh Sách {inventory.length} Nguyên Vật Liệu & Gia Vị Trong Kho
              </span>
              <span className="text-xs text-slate-400">Đầy đủ thịt, hải sản, rau củ và các loại gia vị đơn lẻ</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-slate-500 font-bold">
                <tr>
                  <th className="p-3.5">Tên Nguyên Liệu / Gia Vị</th>
                  <th className="p-3.5">Phân Nhóm</th>
                  <th className="p-3.5">Tồn Kho Hiện Tại</th>
                  <th className="p-3.5">Ngưỡng An Toàn</th>
                  <th className="p-3.5">Giá Vốn Nhập (Cost/Đơn vị)</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => {
                  const isLow = item.quantityInStock <= item.minThreshold;
                  return (
                    <tr key={item._id} className={isLow ? 'bg-rose-50/40' : 'hover:bg-slate-50/50'}>
                      <td className="p-3.5 font-bold text-slate-900">{item.name}</td>
                      <td className="p-3.5 text-slate-500">{item.category}</td>
                      <td className="p-3.5">
                        <span className={`font-black px-2.5 py-1 rounded-lg ${
                          isLow ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {item.quantityInStock} {item.unit}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500">{item.minThreshold} {item.unit}</td>
                      <td className="p-3.5 font-bold text-slate-800">
                        {item.costPerUnit?.toLocaleString('vi-VN')} đ / {item.unit}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setImportModal({
                            open: true,
                            item,
                            addQty: 10,
                            costPerUnit: item.costPerUnit,
                            supplier: 'Chợ đầu mối / Nhà cung cấp uy tín'
                          })}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl font-bold transition-all"
                        >
                          <Plus className="w-3 h-3 inline mr-1" /> Nhập Kho
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
        /* TAB 4: GIÁ VỐN (COST) & TỶ SUẤT LỢI NHUẬN TỪNG MÓN ĂN */
        <div className="bg-white/95 rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Bảng Phân Tích Giá Cost (Vốn) & Tỷ Suất Lợi Nhuận</h3>
              <p className="text-xs text-slate-400">So sánh Giá vốn nguyên liệu vs Giá bán niêm yết của 25 món ăn</p>
            </div>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-bold border border-emerald-200">
              Biên Lợi Nhuận Gộp Mục Tiêu: &gt; 50%
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-slate-500 font-bold">
              <tr>
                <th className="p-3">Tên Món Ăn</th>
                <th className="p-3">Danh Mục</th>
                <th className="p-3">Giá Bán Niêm Yết</th>
                <th className="p-3">Giá Vốn (Cost Nguyên Liệu)</th>
                <th className="p-3">Lãi Gộp (VNĐ)</th>
                <th className="p-3 text-right">Tỷ Suất Lợi Nhuận (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {costAnalysis.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">{item.name}</td>
                  <td className="p-3 text-slate-500">{item.category}</td>
                  <td className="p-3 font-black text-slate-800">{item.price.toLocaleString('vi-VN')} đ</td>
                  <td className="p-3 font-semibold text-rose-600">{item.costPrice.toLocaleString('vi-VN')} đ</td>
                  <td className="p-3 font-extrabold text-emerald-600">{item.grossProfit.toLocaleString('vi-VN')} đ</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-1 rounded-lg font-black ${
                      item.marginPercent >= 60 ? 'bg-emerald-100 text-emerald-800' :
                      item.marginPercent >= 45 ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {item.marginPercent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
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
            <button onClick={loadData} className="px-3 py-1.5 border rounded-xl text-xs font-semibold flex items-center gap-1">
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

      {/* MODAL NHẬP KHO NGUYÊN LIỆU */}
      {importModal.open && importModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleImportSubmit} className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-black text-base text-slate-900">
              Nhập Hàng: {importModal.item.name}
            </h3>
            <p className="text-xs text-slate-500">
              Tồn kho hiện tại: <b>{importModal.item.quantityInStock} {importModal.item.unit}</b>
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
              <label className="font-bold text-slate-700">Nhà cung cấp / Nguồn gốc</label>
              <input
                type="text"
                placeholder="Chợ đầu mối Bình Điền, Công ty thực phẩm..."
                value={importModal.supplier}
                onChange={(e) => setImportModal({ ...importModal, supplier: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t">
              <button
                type="button"
                onClick={() => setImportModal({ open: false, item: null, addQty: 10, costPerUnit: 0, supplier: '' })}
                className="px-4 py-2 border rounded-xl text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
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
                className="px-4 py-2 border rounded-xl text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-bold"
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
