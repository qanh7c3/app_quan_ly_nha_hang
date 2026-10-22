import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  CheckCircle2,
  ArrowRightLeft,
  Combine,
  FileText,
  Trash2,
  ShieldAlert,
  UserCheck,
  AlertTriangle,
  Sparkles,
  Layers
} from 'lucide-react';
import { getTables, updateTableStatus, transferTable, mergeTables, cancelOrderItem, openTable } from '../services/api';
import socket from '../services/socket';
import OrderModal from './OrderModal';

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [activeTableForOrder, setActiveTableForOrder] = useState(null);

  // Modal Báo Có Khách (Mở Bàn)
  const [openTableModal, setOpenTableModal] = useState({ open: false, table: null, guestCount: 4, error: '' });

  // State cho nghiệp vụ Chuyển bàn
  const [transferModal, setTransferModal] = useState({ open: false, fromTable: null, toTableId: '', reason: '' });

  // State cho nghiệp vụ Ghép bàn
  const [mergeModal, setMergeModal] = useState({ open: false, primaryTable: null, secondaryTableId: '' });

  // State cho nghiệp vụ Xem tạm tính / Hủy món
  const [previewModal, setPreviewModal] = useState({ open: false, table: null });
  const [cancelReasonModal, setCancelReasonModal] = useState({ open: false, orderId: null, itemId: null, reason: '', itemName: '' });

  const fetchTablesList = async () => {
    try {
      setLoading(true);
      const res = await getTables();
      if (res.data.success) {
        setTables(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách bàn:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTablesList();

    const handleUpdate = () => fetchTablesList();
    socket.on('table:status_changed', handleUpdate);
    socket.on('order:created', handleUpdate);
    socket.on('payment:completed', handleUpdate);
    socket.on('reservation:updated', handleUpdate);

    return () => {
      socket.off('table:status_changed', handleUpdate);
      socket.off('order:created', handleUpdate);
      socket.off('payment:completed');
      socket.off('reservation:updated');
    };
  }, []);

  const zones = ['ALL', ...new Set(tables.map((t) => t.zone))];
  const filteredTables = selectedZone === 'ALL' ? tables : tables.filter((t) => t.zone === selectedZone);

  // Tính tổng sức chứa
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);

  // Xử lý Phục vụ Báo có khách & Mở bàn
  const handleConfirmOpenTable = async (e) => {
    e.preventDefault();
    try {
      const res = await openTable({
        tableId: openTableModal.table._id,
        guestCount: Number(openTableModal.guestCount)
      });
      if (res.data.success) {
        const openedTable = res.data.data;
        setOpenTableModal({ open: false, table: null, guestCount: 4, error: '' });
        fetchTablesList();
        // Sau khi mở bàn thành công, mở ngay cửa sổ gọi món cho bàn đó
        setActiveTableForOrder(openedTable);
      }
    } catch (err) {
      setOpenTableModal(prev => ({ ...prev, error: err.response?.data?.message || err.message }));
    }
  };

  // Xử lý Chuyển bàn
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      await transferTable({
        fromTableId: transferModal.fromTable._id,
        toTableId: transferModal.toTableId,
        reason: transferModal.reason,
        performedBy: 'Nhân viên Phục vụ'
      });
      alert('Chuyển bàn thành công!');
      setTransferModal({ open: false, fromTable: null, toTableId: '', reason: '' });
      fetchTablesList();
    } catch (err) {
      alert('Lỗi chuyển bàn: ' + (err.response?.data?.message || err.message));
    }
  };

  // Xử lý Ghép bàn
  const handleMergeSubmit = async (e) => {
    e.preventDefault();
    try {
      await mergeTables({
        primaryTableId: mergeModal.primaryTable._id,
        secondaryTableId: mergeModal.secondaryTableId,
        performedBy: 'Nhân viên Phục vụ'
      });
      alert('Ghép bàn thành công!');
      setMergeModal({ open: false, primaryTable: null, secondaryTableId: '' });
      fetchTablesList();
    } catch (err) {
      alert('Lỗi ghép bàn: ' + (err.response?.data?.message || err.message));
    }
  };

  // Xử lý Hủy món
  const handleConfirmCancelItem = async () => {
    try {
      await cancelOrderItem(cancelReasonModal.orderId, cancelReasonModal.itemId, {
        reason: cancelReasonModal.reason,
        performedBy: 'Nhân viên Phục vụ',
        approvedBy: 'Quản lý Duyệt'
      });
      alert(`Đã hủy món ${cancelReasonModal.itemName}`);
      setCancelReasonModal({ open: false, orderId: null, itemId: null, reason: '', itemName: '' });
      setPreviewModal({ open: false, table: null });
      fetchTablesList();
    } catch (err) {
      alert('Lỗi hủy món: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'occupied':
        return {
          label: 'Đang Có Khách',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          border: 'border-rose-400 bg-rose-50/30 shadow-sm shadow-rose-100',
          tagBg: 'bg-rose-500'
        };
      case 'reserved':
        return {
          label: 'Đã Đặt Trước',
          badge: 'bg-purple-50 text-purple-700 border-purple-200',
          border: 'border-purple-400 bg-purple-50/30 shadow-sm shadow-purple-100',
          tagBg: 'bg-purple-500'
        };
      case 'cleaning':
        return {
          label: 'Chờ Dọn Dẹp',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          border: 'border-amber-400 bg-amber-50/30 shadow-sm shadow-amber-100',
          tagBg: 'bg-amber-500'
        };
      case 'empty':
      default:
        return {
          label: 'Bàn Trống',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          border: 'border-emerald-300 bg-white hover:border-emerald-500 hover:shadow-md',
          tagBg: 'bg-emerald-500'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Phục Vụ Hiện Đại */}
      <div className="bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-extrabold text-slate-900">Sơ Đồ Bàn Ăn & Phục Vụ (Waitstaff POS)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
              Tổng {tables.length} bàn ({totalCapacity} chỗ ngồi)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quy trình: Bấm <b>"Báo Có Khách"</b> $\rightarrow$ Nhập số lượng khách $\rightarrow$ Mở bàn $\rightarrow$ Mới được gọi món. Không được xếp trùng bàn đã đặt trước!
          </p>
        </div>

        {/* Tab lọc khu vực */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedZone === zone
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {zone === 'ALL' ? 'Tất Cả Khu Vực' : zone}
            </button>
          ))}
        </div>
      </div>

      {/* Lưới Sơ đồ Bàn */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">Đang tải sơ đồ 22 bàn ăn...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {filteredTables.map((table) => {
            const style = getStatusBadge(table.status);
            const isOccupied = table.status === 'occupied';
            const isReserved = table.status === 'reserved';
            const isEmpty = table.status === 'empty';

            return (
              <div
                key={table._id}
                className={`relative rounded-3xl p-4 border-2 transition-all flex flex-col justify-between min-h-[210px] ${style.border}`}
              >
                {/* Header bàn */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-slate-900">{table.tableNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{table.zone}</p>
                </div>

                {/* Giữa: Nội dung theo trạng thái bàn */}
                <div className="my-2.5">
                  {isOccupied && table.currentOrderId ? (
                    <div className="bg-white/95 p-2.5 rounded-2xl border border-rose-200/80 text-xs space-y-1 shadow-xs">
                      <div className="flex justify-between font-bold text-rose-600">
                        <span>Đang ăn ({table.guestCount || 2} khách)</span>
                        <span>{table.currentOrderId.totalAmount?.toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <button
                          onClick={() => setPreviewModal({ open: true, table })}
                          className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> Phiếu kiểm đồ
                        </button>
                        <span className="text-[10px] text-slate-400">
                          {table.currentOrderId.items?.filter(i => i.status !== 'cancelled').length || 0} món
                        </span>
                      </div>
                    </div>
                  ) : isReserved ? (
                    <div className="bg-purple-100/70 p-2.5 rounded-2xl border border-purple-200 text-xs text-purple-900 space-y-1">
                      <div className="flex items-center gap-1 font-bold text-[11px] text-purple-700">
                        <AlertTriangle className="w-3.5 h-3.5" /> Bàn Đã Đặt Trước
                      </div>
                      <p className="text-[11px] text-purple-600">
                        Sức chứa: {table.capacity} khách. Vui lòng qua Lễ tân check-in!
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 py-2">
                      <Users className="w-3.5 h-3.5" />
                      <span>Sức chứa: <b>{table.capacity} khách</b></span>
                    </div>
                  )}
                </div>

                {/* Footer: Nghiệp vụ Phục vụ (Rõ ràng, không tự ý gọi món khi chưa mở bàn) */}
                <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between gap-1 text-xs font-bold">
                  {isEmpty ? (
                    /* Nút Báo Có Khách & Mở Bàn (Không cho bấm gọi món ngay) */
                    <button
                      onClick={() => setOpenTableModal({ open: true, table, guestCount: 4, error: '' })}
                      className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Báo Có Khách (Mở Bàn)
                    </button>
                  ) : isOccupied ? (
                    <>
                      <button
                        onClick={() => setActiveTableForOrder(table)}
                        className="py-1.5 px-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" /> Gọi Món
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          title="Chuyển bàn"
                          onClick={() => setTransferModal({ open: true, fromTable: table, toTableId: '', reason: '' })}
                          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Ghép bàn"
                          onClick={() => setMergeModal({ open: true, primaryTable: table, secondaryTableId: '' })}
                          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95"
                        >
                          <Combine className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : isReserved ? (
                    <span className="text-[11px] font-bold text-purple-700 w-full text-center py-1.5 bg-purple-50 rounded-xl">
                      Chờ Khách Đến
                    </span>
                  ) : (
                    /* Cleaning */
                    <button
                      onClick={() => updateTableStatus(table._id, 'empty')}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Xác Nhận Đã Dọn Xong
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Báo Có Khách & Mở Bàn (Nhập số lượng người thực tế) */}
      {openTableModal.open && openTableModal.table && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleConfirmOpenTable} className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center gap-3 border-b pb-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Mở Bàn: {openTableModal.table.tableNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Khu vực: {openTableModal.table.zone} • Tối đa: {openTableModal.table.capacity} khách
                </p>
              </div>
            </div>

            {openTableModal.error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {openTableModal.error}
              </div>
            )}

            <div className="text-xs space-y-2">
              <label className="font-bold text-slate-700 block">
                Báo số lượng khách thực tế ngồi vào bàn *
              </label>
              <input
                required
                type="number"
                min="1"
                max={openTableModal.table.capacity + 4}
                value={openTableModal.guestCount}
                onChange={(e) => setOpenTableModal({ ...openTableModal, guestCount: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl font-black text-lg text-emerald-700 focus:ring-2 focus:ring-emerald-500/20"
              />

              {/* Nút chọn nhanh số lượng */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400 font-medium">Chọn nhanh:</span>
                {[2, 4, 6, 8, 10].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setOpenTableModal({ ...openTableModal, guestCount: num })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      Number(openTableModal.guestCount) === num
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {num} người
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t">
              <button
                type="button"
                onClick={() => setOpenTableModal({ open: false, table: null, guestCount: 4, error: '' })}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25"
              >
                Xác Nhận Có Khách & Mở Gọi Món
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Chuyển Bàn */}
      {transferModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleTransferSubmit} className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              Chuyển Bàn: {transferModal.fromTable?.tableNumber}
            </h3>

            <div className="text-xs space-y-1">
              <label className="font-bold text-slate-700">Chọn bàn trống muốn chuyển tới *</label>
              <select
                required
                value={transferModal.toTableId}
                onChange={(e) => setTransferModal({ ...transferModal, toTableId: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl"
              >
                <option value="">-- Chọn bàn trống --</option>
                {tables.filter(t => t.status === 'empty').map(t => (
                  <option key={t._id} value={t._id}>{t.tableNumber} ({t.zone} - {t.capacity} khách)</option>
                ))}
              </select>
            </div>

            <div className="text-xs space-y-1">
              <label className="font-bold text-slate-700">Lý do chuyển bàn *</label>
              <input
                required
                type="text"
                placeholder="Khách muốn vào phòng điều hòa..."
                value={transferModal.reason}
                onChange={(e) => setTransferModal({ ...transferModal, reason: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setTransferModal({ open: false, fromTable: null, toTableId: '', reason: '' })}
                className="px-4 py-2 border rounded-xl text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button type="submit" className="px-5 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold">
                Xác Nhận Chuyển Bàn
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Ghép Bàn */}
      {mergeModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleMergeSubmit} className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              Ghép Bàn Cho: {mergeModal.primaryTable?.tableNumber}
            </h3>

            <div className="text-xs space-y-1">
              <label className="font-bold text-slate-700">Chọn bàn phụ muốn ghép vào bàn chính *</label>
              <select
                required
                value={mergeModal.secondaryTableId}
                onChange={(e) => setMergeModal({ ...mergeModal, secondaryTableId: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl"
              >
                <option value="">-- Chọn bàn cần ghép --</option>
                {tables.filter(t => t._id !== mergeModal.primaryTable?._id).map(t => (
                  <option key={t._id} value={t._id}>
                    {t.tableNumber} ({t.zone} - {t.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setMergeModal({ open: false, primaryTable: null, secondaryTableId: '' })}
                className="px-4 py-2 border rounded-xl text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
                Xác Nhận Ghép Bàn
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Xem Phiếu Kiểm Đồ & Hủy Món Có Kiểm Soát */}
      {previewModal.open && previewModal.table?.currentOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3.5">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Phiếu Kiểm Đồ: {previewModal.table.tableNumber}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Mã: {previewModal.table.currentOrderId.orderCode} • {previewModal.table.guestCount || 2} khách
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl"
              >
                In Phiếu Tạm Tính
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {previewModal.table.currentOrderId.items?.map((item) => (
                <div key={item._id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{item.name} x {item.quantity}</span>
                    <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.status === 'cooking' ? 'bg-amber-100 text-amber-800' :
                      item.status === 'ready' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'cancelled' ? 'bg-rose-100 text-rose-800 line-through' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {item.status}
                    </span>
                    {item.note && <p className="text-[10px] text-slate-400 italic">{item.note}</p>}
                  </div>

                  {item.status !== 'cancelled' && (
                    <button
                      onClick={() => setCancelReasonModal({
                        open: true,
                        orderId: previewModal.table.currentOrderId._id,
                        itemId: item._id,
                        reason: '',
                        itemName: item.name
                      })}
                      className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hủy món
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t flex justify-between font-extrabold text-sm">
              <span>Tổng Tạm Tính:</span>
              <span className="text-rose-600">{previewModal.table.currentOrderId.totalAmount?.toLocaleString('vi-VN')} đ</span>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewModal({ open: false, table: null })}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nhập lý do hủy món */}
      {cancelReasonModal.open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 border border-rose-200">
            <div className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-extrabold text-base text-slate-900">
                Xác Nhận Hủy Món: {cancelReasonModal.itemName}
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Món ăn đang được theo dõi trên hệ thống. Mọi thao tác hủy đều sẽ được lưu lại trong <b>Nhật ký kiểm soát (Audit Log)</b> để Quản lý đối soát.
            </p>

            <div className="text-xs space-y-1">
              <label className="font-bold text-slate-700">Lý do hủy món *</label>
              <textarea
                required
                rows={3}
                placeholder="Khách đổi ý, khách chờ quá lâu, bếp hết nguyên liệu..."
                value={cancelReasonModal.reason}
                onChange={(e) => setCancelReasonModal({ ...cancelReasonModal, reason: e.target.value })}
                className="w-full p-3 border rounded-xl focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t">
              <button
                type="button"
                onClick={() => setCancelReasonModal({ open: false, orderId: null, itemId: null, reason: '', itemName: '' })}
                className="px-4 py-2 border rounded-xl text-xs font-semibold"
              >
                Không Hủy Nữa
              </button>
              <button
                type="button"
                disabled={!cancelReasonModal.reason}
                onClick={handleConfirmCancelItem}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                Xác Nhận Hủy Món
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gọi món cho bàn (sau khi đã mở bàn thành công) */}
      {activeTableForOrder && (
        <OrderModal
          table={activeTableForOrder}
          onClose={() => setActiveTableForOrder(null)}
          onOrderSuccess={() => {
            fetchTablesList();
            setActiveTableForOrder(null);
          }}
        />
      )}
    </div>
  );
}
