import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle, Flame, Check, AlertCircle, Ban, X, BookOpen, Utensils, Sparkles } from 'lucide-react';
import { getKitchenOrders, updateOrderItemStatus, getMenuItems, emergencyOutOfStock } from '../services/api';
import socket from '../services/socket';

export default function KitchenKDS() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStation, setFilterStation] = useState('ALL');
  const [menuItems, setMenuItems] = useState([]);

  // Modal Báo hết món 86ing
  const [show86Modal, setShow86Modal] = useState(false);
  const [selected86Item, setSelected86Item] = useState('');
  const [reason86, setReason86] = useState('');

  // Modal Xem Công thức chế biến & Định lượng chi tiết
  const [recipeModal, setRecipeModal] = useState({ open: false, item: null });

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

  // Mở công thức từ order item
  const openRecipeByItem = (item) => {
    // Tìm menuItem tương ứng trong danh sách 25 món
    const fullMenu = menuItems.find(m => m._id === (item.menuItemId?._id || item.menuItemId));
    if (fullMenu) {
      setRecipeModal({ open: true, item: fullMenu });
    } else {
      setRecipeModal({ open: true, item });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bếp & Quầy Bar Hiện Đại */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-rose-500/20 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight">Màn Hình Điều Phối Bếp & Quầy Bar (KDS)</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30">
                Kitchen Display System
              </span>
            </div>
            <p className="text-xs text-rose-200/90 mt-1">
              Phân luồng Bếp Nóng / Bar • Xem công thức & định lượng 25 món • Báo hết món (86ing) • Cảnh báo trễ &gt; 20 phút
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Nút Xem Sổ Tay Công Thức 25 Món */}
          <button
            onClick={() => {
              if (menuItems.length > 0) setRecipeModal({ open: true, item: menuItems[0] });
            }}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-2 border border-white/15 backdrop-blur-md transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-amber-400" /> Sổ Tay Công Thức (25 Món)
          </button>

          {/* Nút 86ing */}
          <button
            onClick={() => setShow86Modal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-rose-600/25 transition-all active:scale-95"
          >
            <Ban className="w-4 h-4" /> Báo Hết Món (86ing)
          </button>

          {/* Phân luồng trạm */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl">
            {['ALL', 'kitchen', 'bar'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStation(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStation === st
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'Tất Cả Món' : st === 'kitchen' ? 'Bếp Nóng' : 'Quầy Bar'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lưới Vé Order Cho Đầu Bếp */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">Đang đồng bộ vé order Bếp...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 p-16 text-center text-slate-400">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-3 stroke-1" />
          <h3 className="text-base font-extrabold text-slate-800">Tất cả món đã hoàn thành xuất sắc!</h3>
          <p className="text-xs text-slate-400 mt-1">Hiện không có đơn nào đang chờ chế biến. Sẵn sàng nhận đơn mới.</p>
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
                className={`bg-white/95 rounded-3xl border-2 flex flex-col overflow-hidden shadow-md transition-all ${
                  isLate ? 'border-rose-500 ring-4 ring-rose-500/20' : 'border-slate-200'
                }`}
              >
                {/* Header Vé Order */}
                <div className={`p-4 border-b flex items-center justify-between ${
                  isLate ? 'bg-rose-100/80 border-rose-300' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <h3 className="font-black text-base text-slate-900">
                      {order.tableId?.tableNumber || 'Bàn'} ({order.guestCount || 2} khách)
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500 font-bold">{order.orderCode}</span>
                  </div>

                  <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl shadow-xs ${
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

                {/* Danh sách món trong vé */}
                <div className="p-3.5 divide-y divide-slate-100 flex-1 space-y-3 overflow-y-auto max-h-[380px]">
                  {visibleItems.map((item) => (
                    <div key={item._id} className="pt-2.5 first:pt-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-xs font-black flex items-center justify-center shrink-0">
                              {item.quantity}
                            </span>
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900">{item.name}</span>
                          </div>

                          {item.note && (
                            <p className="text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md mt-1 font-semibold italic inline-block">
                              ⚠️ Ghi chú: {item.note}
                            </p>
                          )}
                        </div>

                        {/* Nút Xem Công Thức Chi Tiết Cho Món Này */}
                        <button
                          onClick={() => openRecipeByItem(item)}
                          title="Xem công thức & định lượng"
                          className="p-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg shrink-0 flex items-center gap-1 text-[11px] font-bold"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Công thức</span>
                        </button>
                      </div>

                      {/* Nút chuyển trạng thái món */}
                      <div className="flex items-center gap-1.5">
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, item._id, 'cooking')}
                            className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                          >
                            <Flame className="w-3.5 h-3.5" /> Bắt đầu nấu
                          </button>
                        )}
                        {item.status === 'cooking' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, item._id, 'ready')}
                            className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" /> Món Xong (Báo Phục Vụ)
                          </button>
                        )}
                        {item.status === 'ready' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, item._id, 'served')}
                            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl active:scale-95"
                          >
                            Đã Bưng Ra Bàn
                          </button>
                        )}
                        {item.status === 'served' && (
                          <span className="text-[11px] font-bold text-slate-400 py-1 px-2 bg-slate-100 rounded-lg w-full text-center">
                            Đã phục vụ
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {order.generalNote && (
                  <div className="px-4 py-2.5 bg-amber-50 text-amber-900 text-xs font-semibold border-t border-amber-200">
                    📌 Lưu ý toàn đơn: {order.generalNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Xem Công Thức & Định Lượng Chi Tiết Món Ăn (25 Món) */}
      {recipeModal.open && recipeModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">
                    Công Thức & Định Lượng: {recipeModal.item.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Phân loại: {recipeModal.item.categoryId?.name || 'Món ăn'} • Trạm: {recipeModal.item.station === 'bar' ? 'Quầy Bar' : 'Bếp Nóng'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRecipeModal({ open: false, item: null })}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ảnh món ăn & Thông số giá */}
            <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <img
                src={recipeModal.item.imageUrl}
                alt={recipeModal.item.name}
                className="w-20 h-20 rounded-xl object-cover shadow-sm"
              />
              <div className="text-xs space-y-1">
                <p className="font-extrabold text-sm text-slate-900">{recipeModal.item.name}</p>
                <p className="text-slate-500">{recipeModal.item.description}</p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="font-bold text-orange-600">
                    Giá bán: {recipeModal.item.price?.toLocaleString('vi-VN')} đ
                  </span>
                  {recipeModal.item.costPrice > 0 && (
                    <span className="text-slate-500">
                      Giá vốn (Cost): <b>{recipeModal.item.costPrice?.toLocaleString('vi-VN')} đ</b>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bảng định lượng nguyên vật liệu & gia vị đơn lẻ */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-rose-500" />
                Định Lượng Nguyên Liệu & Gia Vị Chuẩn 1 Suất:
              </h4>

              {(!recipeModal.item.recipe || recipeModal.item.recipe.length === 0) ? (
                <p className="text-xs text-slate-400 italic">Chưa cấu hình định lượng cho món này.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {recipeModal.item.recipe.map((ing, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <span className="font-bold text-slate-800">{ing.ingredientName}</span>
                      <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                        {ing.amount} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hướng dẫn công thức 4 bước chế biến cho Đầu Bếp */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Quy Trình Chế Biến Chi Tiết (SOP Nhà Hàng):
              </h4>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60">
                  <span className="font-bold text-amber-800 block mb-0.5">Bước 1: Sơ chế & Chuẩn bị nguyên liệu</span>
                  <p>{recipeModal.item.instructions?.preparation || 'Sơ chế sạch sẽ các nguyên liệu theo quy chuẩn an toàn vệ sinh.'}</p>
                </div>

                <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200/60">
                  <span className="font-bold text-orange-800 block mb-0.5">Bước 2: Tẩm ướp gia vị</span>
                  <p>{recipeModal.item.instructions?.seasoning || 'Tẩm ướp đúng liều lượng gia vị trong sổ tay để đảm bảo tròn vị.'}</p>
                </div>

                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/60">
                  <span className="font-bold text-rose-800 block mb-0.5">Bước 3: Chế biến (Xào/Nấu/Nướng/Pha chế)</span>
                  <p>{recipeModal.item.instructions?.cookingSteps || 'Thực hiện chế biến với nhiệt độ chuẩn xác, không làm cháy khét.'}</p>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
                  <span className="font-bold text-emerald-800 block mb-0.5">Bước 4: Trình bày & Ra đồ</span>
                  <p>{recipeModal.item.instructions?.presentation || 'Bày ra đĩa đẹp mắt, rắc ngò trang trí và bấm nút Món Xong báo phục vụ bê đi.'}</p>
                </div>
              </div>
            </div>

            {/* Chọn nhanh món khác để xem công thức */}
            <div className="pt-3 border-t flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Chuyển món khác:</span>
                <select
                  value={recipeModal.item._id}
                  onChange={(e) => {
                    const picked = menuItems.find(m => m._id === e.target.value);
                    if (picked) setRecipeModal({ open: true, item: picked });
                  }}
                  className="text-xs border rounded-xl px-3 py-1.5 font-bold"
                >
                  {menuItems.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setRecipeModal({ open: false, item: null })}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Báo Hết Món Khẩn Cấp (86ing) */}
      {show86Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <form onSubmit={handle86Submit} className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl space-y-4 border border-rose-200">
            <div className="flex items-center justify-between border-b pb-3.5">
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
                className="w-full px-3.5 py-2.5 border rounded-xl font-semibold bg-white"
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
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShow86Modal(false)}
                className="px-4 py-2.5 border rounded-xl text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button type="submit" className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/25">
                Khóa Món Ngay Lập Tức
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
