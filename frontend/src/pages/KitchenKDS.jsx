import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle, Flame, Check, AlertCircle, Ban, X } from 'lucide-react';
import { getKitchenOrders, updateOrderItemStatus, getMenuItems, emergencyOutOfStock } from '../services/api';
import socket from '../services/socket';

export default function KitchenKDS() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStation, setFilterStation] = useState('ALL');
  const [menuItems, setMenuItems] = useState([]);
  const [show86Modal, setShow86Modal] = useState(false);
  const [selected86Item, setSelected86Item] = useState('');
  const [reason86, setReason86] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [ordRes, menuRes] = await Promise.all([
        getKitchenOrders(),
        getMenuItems()
      ]);
      if (ordRes.data.success) setOrders(ordRes.data.data);
      if (menuRes.data.success) setMenuItems(menuRes.data.data);
    } catch (err) {
      console.error('Lỗi tải danh sách bếp:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    socket.emit('join:kitchen');

    const handleNewOrder = (newOrder) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o._id === newOrder._id);
        if (exists) return prev.map((o) => (o._id === newOrder._id ? newOrder : o));
        return [...prev, newOrder];
      });
    };

    const handleItemStatusChanged = ({ orderId, itemId, status, order }) => {
      setOrders((prev) => prev.map((o) => (o._id === orderId ? order : o)));
    };

    socket.on('order:created', handleNewOrder);
    socket.on('kitchen:item_status_changed', handleItemStatusChanged);
    socket.on('payment:completed', () => fetchOrders());
    socket.on('order:item_cancelled', () => fetchOrders());

    return () => {
      socket.off('order:created', handleNewOrder);
      socket.off('kitchen:item_status_changed', handleItemStatusChanged);
      socket.off('payment:completed');
      socket.off('order:item_cancelled');
    };
  }, []);

  const handleUpdateStatus = async (orderId, itemId, nextStatus) => {
    try {
      await updateOrderItemStatus(orderId, itemId, nextStatus);
    } catch (err) {
      alert('Lỗi cập nhật món: ' + err.message);
    }
  };

  // Xử lý Bếp Báo Hết Món Khẩn Cấp (86ing)
  const handle86Submit = async (e) => {
    e.preventDefault();
    try {
      await emergencyOutOfStock({
        menuItemId: selected86Item,
        reason: reason86,
        performedBy: 'Đầu Bếp Trưởng'
      });
      alert('Đã khóa món khẩn cấp trên toàn hệ thống thành công!');
      setShow86Modal(false);
      setSelected86Item('');
      setReason86('');
      fetchOrders();
    } catch (err) {
      alert('Lỗi báo hết món: ' + err.message);
    }
  };

  const getMinutesPassed = (dateString) => {
    const diff = Math.floor((new Date() - new Date(dateString)) / 60000);
    return Math.max(0, diff);
  };

  return (
    <div className="space-y-6">
      {/* Header Bếp & Quầy Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Màn Hình Điều Phối Bếp & Quầy Bar (KDS)</h2>
            <p className="text-xs text-slate-400">
              Phân luồng Bếp Nóng / Bếp Lạnh / Bar | Cảnh báo trễ &gt; 20 phút | Khóa món khẩn cấp (86ing)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút 86ing: Báo hết món */}
          <button
            onClick={() => setShow86Modal(true)}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Ban className="w-4 h-4" /> Báo Hết Món (86ing)
          </button>

          {/* Phân luồng */}
          {['ALL', 'kitchen', 'bar'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStation(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStation === st
                  ? 'bg-orange-500 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'Tất Cả Món' : st === 'kitchen' ? 'Bếp Nóng' : 'Quầy Bar'}
            </button>
          ))}
        </div>
      </div>

      {/* Lưới Vé Order */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Đang đồng bộ đơn Bếp...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-3 stroke-1" />
          <h3 className="text-base font-bold text-slate-700">Tất cả món đã hoàn thành!</h3>
          <p className="text-xs text-slate-400 mt-1">Hiện không có đơn nào đang chờ chế biến.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((order) => {
            const minutes = getMinutesPassed(order.createdAt);
            const isLate = minutes >= 20;

            const visibleItems = order.items.filter((item) => {
              if (item.status === 'cancelled') return false;
              if (filterStation === 'ALL') return true;
              return item.menuItemId?.station === filterStation;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div
                key={order._id}
                className={`bg-white rounded-2xl border-2 flex flex-col overflow-hidden shadow-sm transition-all ${
                  isLate ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200'
                }`}
              >
                {/* Header Vé Order */}
                <div className={`p-3.5 border-b flex items-center justify-between ${
                  isLate ? 'bg-rose-100/70 border-rose-300' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      {order.tableId?.tableNumber || 'Bàn'} ({order.guestCount || 2} khách)
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500">{order.orderCode}</span>
                  </div>

                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                    isLate
                      ? 'bg-rose-600 text-white animate-bounce'
                      : minutes > 10
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{minutes} phút trước</span>
                  </div>
                </div>

                {/* Danh sách món */}
                <div className="p-3 divide-y divide-slate-100 flex-1 space-y-2.5 overflow-y-auto max-h-[350px]">
                  {visibleItems.map((item) => (
                    <div key={item._id} className="pt-2 first:pt-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                              {item.quantity}
                            </span>
                            <span className="font-bold text-xs text-slate-800">{item.name}</span>
                          </div>
                          {item.note && (
                            <p className="text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded mt-1 font-medium italic inline-block">
                              ⚠️ {item.note}
                            </p>
                          )}
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          item.status === 'ready' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'cooking' ? 'bg-amber-100 text-amber-800' :
                          item.status === 'served' ? 'bg-slate-100 text-slate-400 line-through' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status === 'pending' ? 'Chờ làm' :
                           item.status === 'cooking' ? 'Đang nấu' :
                           item.status === 'ready' ? 'Đã xong' : 'Đã bưng'}
                        </span>
                      </div>

                      {/* Các nút bấm Bếp */}
                      <div className="mt-2 flex items-center gap-1.5">
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, item._id, 'cooking')}
                            className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                          >
                            <Flame className="w-3.5 h-3.5" /> Bắt đầu nấu
                          </button>
                        )}
                        {item.status === 'cooking' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, item._id, 'ready')}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Món Xong (Báo Phục Vụ)
                          </button>
                        )}
                        {item.status === 'ready' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, item._id, 'served')}
                            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg"
                          >
                            Đã Bưng Ra Bàn
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {order.generalNote && (
                  <div className="px-3 py-2 bg-amber-50 text-amber-900 text-xs font-medium border-t border-amber-200">
                    📌 {order.generalNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Báo Hết Món Khẩn Cấp (86ing) */}
      {show86Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <form onSubmit={handle86Submit} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 border border-rose-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <Ban className="w-6 h-6" />
                <h3 className="font-extrabold text-base text-slate-900">Báo Hết Món Khẩn Cấp (86ing)</h3>
              </div>
              <button type="button" onClick={() => setShow86Modal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Khi bấm xác nhận, món ăn này sẽ lập tức bị <b>khóa lại theo thời gian thực</b> trên toàn bộ máy tính bảng/điện thoại của nhân viên phục vụ.
            </p>

            <div className="text-xs space-y-1">
              <label className="font-bold text-slate-700">Chọn món đã hết nguyên liệu *</label>
              <select
                required
                value={selected86Item}
                onChange={(e) => setSelected86Item(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              >
                <option value="">-- Chọn món cần khóa --</option>
                {menuItems.map(m => (
                  <option key={m._id} value={m._id}>{m.name} ({m.price.toLocaleString('vi-VN')} đ)</option>
                ))}
              </select>
            </div>

            <div className="text-xs space-y-1">
              <label className="font-bold text-slate-700">Lý do hết món *</label>
              <input
                required
                type="text"
                placeholder="Hết hải sản tươi trong ca, nhà cung cấp chưa giao..."
                value={reason86}
                onChange={(e) => setReason86(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShow86Modal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">
                Khóa Món Ngay Lập Tức
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
