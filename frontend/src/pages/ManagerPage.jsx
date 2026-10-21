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
  Layers
} from 'lucide-react';
import { getReportStats, getInventory, importStock, getAuditLogs } from '../services/api';

export default function ManagerPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'inventory', 'audit'
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Nhập kho
  const [importModal, setImportModal] = useState({ open: false, item: null, addQty: 5 });

  const loadData = async () => {
    try {
      setLoading(true);
      const [repRes, invRes, logRes] = await Promise.all([
        getReportStats(),
        getInventory(),
        getAuditLogs()
      ]);
      if (repRes.data.success) setStats(repRes.data.data);
      if (invRes.data.success) setInventory(invRes.data.data);
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

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    try {
      await importStock(importModal.item._id, { addQuantity: importModal.addQty });
      alert(`Đã nhập thêm ${importModal.addQty} ${importModal.item.unit} ${importModal.item.name}!`);
      setImportModal({ open: false, item: null, addQty: 5 });
      loadData();
    } catch (err) {
      alert('Lỗi nhập kho: ' + err.message);
    }
  };

  const lowStockItems = inventory.filter(i => i.quantityInStock <= i.minThreshold);

  return (
    <div className="space-y-6">
      {/* Header Quản Lý */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-400/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Cấp Quản Lý & Chủ Nhà Hàng (Manager Portal)</h2>
            <p className="text-xs text-slate-400">
              Giám sát doanh thu từ xa | Quản lý Kho & Định lượng tự động | Nhật ký chống gian lận (Audit Log)
            </p>
          </div>
        </div>

        {/* 3 Tab quản lý */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Doanh Thu & KPI
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Kho Nguyên Liệu ({inventory.length})
            {lowStockItems.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'audit' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Nhật Ký Kiểm Soát ({auditLogs.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Đang tổng hợp dữ liệu quản lý...</div>
      ) : activeTab === 'overview' ? (
        /* Tab 1: Tổng quan Doanh thu & Báo cáo */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Doanh thu đã thu hôm nay</p>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {(stats?.todayRevenue || 0).toLocaleString('vi-VN')} đ
                </h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Tổng tích lũy toàn hệ thống</p>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {(stats?.totalRevenue || 0).toLocaleString('vi-VN')} đ
                </h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Số đơn hàng đã phục vụ</p>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {stats?.totalInvoicesCount || 0} hóa đơn
                </h3>
              </div>
            </div>
          </div>

          {/* Top món bán chạy */}
          <div className="bg-white p-5 rounded-2xl border space-y-4">
            <h3 className="font-bold text-sm text-slate-800">Top Món Ăn Mang Lại Doanh Thu Cao Nhất</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stats?.topItems?.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{item._id}</p>
                    <span className="text-slate-400">Đã bán: {item.totalQuantity} suất</span>
                  </div>
                  <span className="font-extrabold text-emerald-600">
                    {(item.totalSales || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'inventory' ? (
        /* Tab 2: Quản lý Kho & Định lượng */
        <div className="space-y-4">
          {lowStockItems.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold">Cảnh báo nguyên liệu sắp hết:</p>
                <p>
                  Có {lowStockItems.length} mặt hàng đã giảm dưới ngưỡng an toàn (ví dụ: {lowStockItems.map(i => i.name).join(', ')}). Cần nhập bổ sung ngay để Bếp không bị thiếu!
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-slate-500 font-bold">
                <tr>
                  <th className="p-3.5">Nguyên Vật Liệu</th>
                  <th className="p-3.5">Phân Nhóm</th>
                  <th className="p-3.5">Tồn Kho Hiện Tại</th>
                  <th className="p-3.5">Ngưỡng Tối Thiểu</th>
                  <th className="p-3.5">Giá Vốn Ước Tính</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => {
                  const isLow = item.quantityInStock <= item.minThreshold;
                  return (
                    <tr key={item._id} className={isLow ? 'bg-rose-50/40' : ''}>
                      <td className="p-3.5 font-bold text-slate-900">{item.name}</td>
                      <td className="p-3.5 text-slate-500">{item.category}</td>
                      <td className="p-3.5">
                        <span className={`font-extrabold px-2 py-0.5 rounded ${
                          isLow ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {item.quantityInStock} {item.unit}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500">{item.minThreshold} {item.unit}</td>
                      <td className="p-3.5 font-medium">{item.costPerUnit?.toLocaleString('vi-VN')} đ/{item.unit}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setImportModal({ open: true, item, addQty: 10 })}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition-colors"
                        >
                          <Plus className="w-3 h-3 inline mr-0.5" /> Nhập Kho
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tab 3: Nhật Ký Kiểm Soát Chống Gian Lận (Audit Log) */
        <div className="bg-white rounded-2xl border p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Nhật Ký Kiểm Soát & Chống Gian Lận (Audit Log)</h3>
              <p className="text-xs text-slate-500">Lưu lại lịch sử mọi hành động nhạy cảm (Hủy món đang nấu, chuyển bàn, báo hết món)</p>
            </div>
            <button onClick={loadData} className="px-3 py-1.5 border rounded-lg text-xs font-semibold flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Làm mới
            </button>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">Chưa có ghi nhận thao tác nhạy cảm nào.</p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.map((log) => (
                <div key={log._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.action.includes('CANCEL') ? 'bg-rose-100 text-rose-800' :
                        log.action.includes('MERGE') || log.action.includes('TRANSFER') ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {log.action}
                      </span>
                      <span className="font-bold text-slate-800">Người thực hiện: {log.performedBy}</span>
                      {log.approvedBy && (
                        <span className="text-slate-400">| Người duyệt: <b className="text-slate-700">{log.approvedBy}</b></span>
                      )}
                    </div>
                    <p className="text-slate-600 font-medium">Lý do ghi nhận: {log.reason}</p>
                    {log.details && (
                      <p className="text-[11px] text-slate-400 font-mono">
                        Chi tiết: {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString('vi-VN')}, {new Date(log.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Nhập Kho Nhanh */}
      {importModal.open && importModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleImportSubmit} className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              Nhập Thêm: {importModal.item.name}
            </h3>
            <p className="text-xs text-slate-500">
              Hiện có trong kho: <b>{importModal.item.quantityInStock} {importModal.item.unit}</b>
            </p>

            <div className="text-xs space-y-1">
              <label className="font-bold text-slate-700">Số lượng nhập thêm ({importModal.item.unit}) *</label>
              <input
                required
                type="number"
                min="0.1"
                step="any"
                value={importModal.addQty}
                onChange={(e) => setImportModal({ ...importModal, addQty: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl font-bold text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setImportModal({ open: false, item: null, addQty: 5 })}
                className="px-4 py-2 border rounded-xl text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
                Xác Nhận Nhập Kho
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
