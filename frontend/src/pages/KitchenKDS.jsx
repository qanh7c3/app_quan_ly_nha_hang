import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle, Flame, Check, AlertCircle, Ban, X, BookOpen, Utensils, Sparkles, Search, Layers } from 'lucide-react';
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

  // Modal Xem Công thức chế biến & Sổ tay 30 món gia đình
  const [recipeModal, setRecipeModal] = useState({ open: false, item: null });
  const [recipeSearch, setRecipeSearch] = useState('');

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
    const fullMenu = menuItems.find(m => m._id === (item.menuItemId?._id || item.menuItemId));
    if (fullMenu) {
      setRecipeModal({ open: true, item: fullMenu });
    } else {
      setRecipeModal({ open: true, item });
    }
  };

  // Lọc 30 món trong modal sổ tay
  const filteredRecipes = menuItems.filter(m =>
    m.name.toLowerCase().includes(recipeSearch.toLowerCase()) ||
    m.categoryId?.name?.toLowerCase().includes(recipeSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bếp KDS Hiện Đại */}
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
              Phân luồng Bếp Nóng / Bar • Sổ tay công thức 30 món gia đình chuẩn • Báo hết món (86ing) • Cảnh báo trễ &gt; 20 phút
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Nút Xem Sổ Tay Công Thức 30 Món Gia Đình */}
          <button
            onClick={() => {
              if (menuItems.length > 0) setRecipeModal({ open: true, item: menuItems[0] });
            }}
            className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-white" /> Sổ Tay Công Thức (30 Món)
          </button>

          {/* Nút Báo hết món 86ing */}
          <button
            onClick={() => setShow86Modal(true)}
            className="px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-rose-600/25 transition-all active:scale-95"
          >
            <Ban className="w-4 h-4" /> Báo Hết Món (86ing)
          </button>

          {/* Phân luồng trạm */}
          <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/10">
            {['ALL', 'kitchen', 'bar'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStation(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterStation === st
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'Tất Cả Món' : st === 'kitchen' ? 'Bếp Nóng' : 'Quầy Bar'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lưới các Vé Order Bếp & Bar */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">Đang đồng bộ dữ liệu bếp trực tiếp...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 p-16 text-center text-slate-400 shadow-sm">
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
                  isLate ? 'bg-rose-100/90 border-rose-300' : 'bg-slate-50 border-slate-200'
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
                            <p className="text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md mt-1 font-semibold italic inline-block border border-rose-200">
                              ⚠️ Ghi chú: {item.note}
                            </p>
                          )}
                        </div>

                        {/* Nút Xem Công Thức Chi Tiết Cho Món Này */}
                        <button
                          onClick={() => openRecipeByItem(item)}
                          title="Xem công thức & định lượng 30 món"
                          className="px-2 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg shrink-0 flex items-center gap-1 text-[11px] font-bold transition-all"
                        >
                          <BookOpen className="w-3 h-3 text-amber-600" />
                          <span>Công thức</span>
                        </button>
                      </div>

                      {/* Nút chuyển trạng thái món */}
                      <div className="flex items-center gap-1.5">
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, item._id, 'cooking')}
                            className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                          >
                            <Flame className="w-3.5 h-3.5" /> Bắt đầu nấu
                          </button>
                        )}
                        {item.status === 'cooking' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, item._id, 'ready')}
                            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" /> Món Xong (Báo Phục Vụ)
                          </button>
                        )}
                        {item.status === 'ready' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, item._id, 'served')}
                            className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl active:scale-95 transition-all"
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

                {/* Footer Vé */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between items-center">
                  <span>Trạm: <b>{filterStation === 'bar' ? 'Quầy Bar' : 'Bếp Nóng'}</b></span>
                  <span className="font-bold text-slate-700">{visibleItems.length} món</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL SỔ TAY CÔNG THỨC 30 MÓN GIA ĐÌNH CHO ĐẦU BẾP */}
      {recipeModal.open && recipeModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto border border-slate-100">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl shadow-md shadow-orange-500/20">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-slate-900">
                      Sổ Tay Công Thức Đầu Bếp (30 Món Gia Đình)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Recipe SOP
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Định lượng chuẩn 1 suất • Quy trình 4 bước chuẩn SOP • Chi phí nguyên liệu thực tế
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRecipeModal({ open: false, item: null })}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thanh tìm kiếm & chuyển nhanh giữa 30 món */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm món trong 30 món gia đình..."
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Chọn món:</span>
                <select
                  value={recipeModal.item._id}
                  onChange={(e) => {
                    const picked = menuItems.find(m => m._id === e.target.value);
                    if (picked) setRecipeModal({ open: true, item: picked });
                  }}
                  className="text-xs border border-slate-200 bg-white rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-amber-500 max-w-[200px] truncate"
                >
                  {filteredRecipes.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chi tiết Món ăn được chọn */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/70">
              <img
                src={recipeModal.item.imageUrl}
                alt={recipeModal.item.name}
                className="w-24 h-24 rounded-2xl object-cover shadow-md shrink-0 border-2 border-white"
              />
              <div className="text-xs space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-base text-slate-900">{recipeModal.item.name}</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                    {recipeModal.item.categoryId?.name || 'Món ăn'}
                  </span>
                </div>
                <p className="text-slate-600">{recipeModal.item.description}</p>
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <span className="font-extrabold text-orange-600 bg-white px-2.5 py-1 rounded-lg border border-orange-200">
                    Giá bán siêu thị: {recipeModal.item.price?.toLocaleString('vi-VN')} đ
                  </span>
                  {recipeModal.item.costPrice > 0 && (
                    <span className="font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      Giá vốn chợ: {recipeModal.item.costPrice?.toLocaleString('vi-VN')} đ
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Lợi nhuận gộp: {Math.max(0, (recipeModal.item.price || 0) - (recipeModal.item.costPrice || 0)).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>

            {/* Định lượng nguyên liệu chuẩn */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-rose-500" />
                Định Lượng Nguyên Liệu & Gia Vị Tự Động Trừ Kho (1 Suất):
              </h4>

              {(!recipeModal.item.recipe || recipeModal.item.recipe.length === 0) ? (
                <p className="text-xs text-slate-400 italic">Chưa cấu hình định lượng cho món này.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {recipeModal.item.recipe.map((ing, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <span className="font-bold text-slate-800">{ing.ingredientName}</span>
                      <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        {ing.amount} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quy trình chế biến chi tiết SOP */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Hướng Dẫn Các Bước Nấu & Chế Biến Chi Tiết (SOP):
              </h4>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80">
                  <span className="font-bold text-amber-900 block mb-0.5">Bước 1: Sơ chế & Chuẩn bị nguyên liệu</span>
                  <p className="leading-relaxed">{recipeModal.item.instructions?.preparation || 'Sơ chế sạch sẽ các nguyên liệu theo quy chuẩn an toàn vệ sinh thực phẩm.'}</p>
                </div>

                <div className="p-3 bg-orange-50/70 rounded-xl border border-orange-200/80">
                  <span className="font-bold text-orange-900 block mb-0.5">Bước 2: Tẩm ướp gia vị</span>
                  <p className="leading-relaxed">{recipeModal.item.instructions?.seasoning || 'Tẩm ướp đúng liều lượng gia vị trong sổ tay để đảm bảo tròn vị món ăn.'}</p>
                </div>

                <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/80">
                  <span className="font-bold text-rose-900 block mb-0.5">Bước 3: Chế biến nhiệt (Xào / Kho / Nấu canh / Chiên / Áp chảo)</span>
                  <p className="leading-relaxed">{recipeModal.item.instructions?.cookingSteps || 'Thực hiện chế biến với nhiệt độ chuẩn xác, canh lửa và thời gian hợp lý.'}</p>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                  <span className="font-bold text-emerald-900 block mb-0.5">Bước 4: Trình bày & Ra đồ</span>
                  <p className="leading-relaxed">{recipeModal.item.instructions?.presentation || 'Bày ra đĩa/tô đẹp mắt, trang trí rau thơm và bấm nút [Món Xong] trên màn hình KDS.'}</p>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-3 border-t flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Đang hiển thị món {menuItems.findIndex(m => m._id === recipeModal.item._id) + 1} / {menuItems.length}
              </span>
              <button
                onClick={() => setRecipeModal({ open: false, item: null })}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
              >
                Đóng Sổ Tay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BÁO HẾT MÓN KHẨN CẤP (86ing) */}
      {show86Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <form onSubmit={handle86Submit} className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl space-y-4 border border-rose-200">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2 text-rose-600">
                <Ban className="w-6 h-6" />
                <h3 className="font-extrabold text-base text-slate-900">Báo Hết Món Khẩn Cấp (86ing)</h3>
              </div>
              <button type="button" onClick={() => setShow86Modal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Khi bấm xác nhận, món ăn này sẽ lập tức bị <b>khóa lại theo thời gian thực</b> trên toàn bộ máy POS của nhân viên phục vụ, tránh khách gọi nhầm.
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
                className="px-4 py-2.5 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/25 active:scale-95 transition-all"
              >
                Khóa Món Ngay Lập Tức
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
