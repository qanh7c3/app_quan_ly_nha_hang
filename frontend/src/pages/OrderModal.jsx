import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Send, Trash2, ShoppingCart, Search, Utensils, Ban, Sparkles, BookOpen } from 'lucide-react';
import { getCategories, getMenuItems, createOrUpdateOrder, resetDatabaseMenu30 } from '../services/api';
import { DEFAULT_CATEGORIES, getStoredMenu30, saveStoredMenu30 } from '../data/defaultMenu30';
import socket from '../services/socket';
import RecipeModal from '../components/RecipeModal';

export default function OrderModal({ table, onClose, onOrderSuccess }) {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [generalNote, setGeneralNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipeModal, setRecipeModal] = useState({ open: false, dish: null });

  const fetchMenuData = async () => {
    try {
      const [catRes, menuRes] = await Promise.all([
        getCategories().catch(() => ({ data: { success: false, data: [] } })),
        getMenuItems().catch(() => ({ data: { success: false, data: [] } }))
      ]);

      if (catRes?.data?.success && catRes.data.data.length > 0) {
        setCategories(catRes.data.data);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }

      if (menuRes?.data?.success && Array.isArray(menuRes.data.data) && menuRes.data.data.length >= 30) {
        setMenuItems(menuRes.data.data);
        saveStoredMenu30(menuRes.data.data);
      } else {
        // Nếu DB trả về dưới 30 món (hoặc 7 món cũ), tự động kích hoạt API reset DB nạp 30 món chuẩn
        try {
          const resetRes = await resetDatabaseMenu30();
          if (resetRes?.data?.success && Array.isArray(resetRes.data.data) && resetRes.data.data.length >= 30) {
            setMenuItems(resetRes.data.data);
            saveStoredMenu30(resetRes.data.data);
            return;
          }
        } catch (e) {
          console.warn('API reset DB chưa phản hồi, chuyển sang nạp 30 món từ LocalStorage v2:', e);
        }
        const fallbackItems = getStoredMenu30();
        setMenuItems(fallbackItems);
      }
    } catch (err) {
      console.error('Lỗi tải thực đơn:', err);
      setMenuItems(getStoredMenu30());
      setCategories(DEFAULT_CATEGORIES);
    }
  };

  useEffect(() => {
    fetchMenuData();

    // Lắng nghe sự kiện đổi trạng thái món ăn thời gian thực từ Quản lý hoặc Bếp
    const handleMenuChanged = () => fetchMenuData();
    socket.on('menu:availability_changed', handleMenuChanged);

    return () => {
      socket.off('menu:availability_changed', handleMenuChanged);
    };
  }, []);

  // Lọc món ăn theo danh mục và tìm kiếm
  const filteredItems = menuItems.filter((item) => {
    const itemCatId = item.categoryId?._id || item.categoryId;
    const matchCategory = selectedCategory ? (itemCatId === selectedCategory || item.categoryId === selectedCategory) : true;
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Thêm vào giỏ
  const addToCart = (item) => {
    if (!item.isAvailable) {
      alert(`Món "${item.name}" hiện đang TẠM NGỪNG PHỤC VỤ do thiếu nguyên liệu từ Bếp!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          quantity: 1,
          note: ''
        }
      ];
    });
  };

  // Cập nhật số lượng
  const updateQuantity = (itemId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.menuItemId === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  // Cập nhật ghi chú món
  const updateItemNote = (itemId, note) => {
    setCart((prev) =>
      prev.map((i) => (i.menuItemId === itemId ? { ...i, note } : i))
    );
  };

  // Xóa món khỏi giỏ
  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== itemId));
  };

  // Tổng tiền giỏ hàng mới
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Gửi order sang Bếp
  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await createOrUpdateOrder({
        tableId: table._id,
        items: cart,
        generalNote,
        guestCount: table.guestCount || 2
      });
      if (res.data.success) {
        onOrderSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      alert('Lỗi tạo đơn hàng: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/65 backdrop-blur-xs">
      <div className="bg-white w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-9 bg-emerald-600 rounded-full shadow-sm"></span>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Gọi Món: <span className="text-emerald-700">{table.tableNumber}</span>
              </h2>
              <p className="text-xs text-slate-500">
                Khu vực: <b>{table.zone}</b> | Sức chứa: <b>{table.capacity} người</b> | Đang phục vụ: <b>{table.guestCount || 2} khách</b>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setRecipeModal({ open: true, dish: null })} className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all">
              <BookOpen className="w-3.5 h-3.5" /> Sổ Tay Công Thức
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
            <X className="w-6 h-6" />
          </button>
          </div>
        </div>

        {/* Thân Modal: 2 Cột */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Cột 1: Thực đơn món ăn (8 cột) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col border-r border-slate-200 overflow-hidden bg-slate-50/40">
            {/* Bộ lọc Danh mục & Tìm kiếm */}
            <div className="p-4 border-b border-slate-200 bg-white space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm trong 30 món ăn gia đình & đồ uống..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-100/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white border border-transparent focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Danh sách tab danh mục */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    selectedCategory === null
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({menuItems.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                      selectedCategory === cat._id
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Lưới hiển thị các món ăn */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredItems.map((item) => {
                const isAvailable = item.isAvailable !== false;
                return (
                  <div
                    key={item._id}
                    onClick={() => addToCart(item)}
                    className={`group bg-white rounded-2xl border p-2.5 flex flex-col justify-between transition-all relative ${
                      isAvailable
                        ? 'border-slate-200/90 hover:shadow-lg hover:border-emerald-400 cursor-pointer'
                        : 'border-slate-200 bg-slate-50/80 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-2 bg-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          isAvailable ? 'group-hover:scale-105' : 'grayscale'
                        }`}
                      />
                      <span className="absolute top-1.5 right-1.5 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                        {item.station === 'bar' ? 'Quầy Bar' : 'Bếp'}
                      </span>

                      {/* Badge cảnh báo mờ món khi hết hàng (Nhiệm vụ 5) */}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 text-center">
                          <Ban className="w-5 h-5 text-rose-400 mb-1" />
                          <span className="text-[10px] font-extrabold text-white uppercase tracking-wider bg-rose-600/90 px-2 py-0.5 rounded">
                            Tạm ngừng phục vụ
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className={`font-bold text-xs sm:text-sm line-clamp-1 ${
                        isAvailable ? 'text-slate-900 group-hover:text-emerald-700' : 'text-slate-400 line-through'
                      }`}>
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {item.description || 'Thơm ngon chuẩn vị gia đình'}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className={`font-black text-xs sm:text-sm ${
                        isAvailable ? 'text-emerald-700' : 'text-slate-400'
                      }`}>
                        {item.price.toLocaleString('vi-VN')} đ
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Xem công thức chi tiết"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRecipeModal({ open: true, dish: item });
                          }}
                          className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-all shadow-xs"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                        {isAvailable ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-rose-500 font-bold px-1">Hết</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột 2: Giỏ món chuẩn bị gửi Bếp (4 cột) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Món mới chọn ({cart.length})
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
                </button>
              )}
            </div>

            {/* Danh sách món trong giỏ */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
                  <Utensils className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
                  <p className="text-sm font-bold text-slate-600">Chưa có món nào được chọn</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Nhấp vào món ăn bên trái để thêm vào danh sách gửi bếp
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-extrabold text-xs text-slate-900">{item.name}</h4>
                        <span className="text-xs text-emerald-700 font-black">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      {/* Tăng giảm số lượng */}
                      <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.menuItemId, -1)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 active:scale-95"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-black text-slate-900 min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menuItemId, 1)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Ghi chú từng món */}
                    <input
                      type="text"
                      placeholder="Ghi chú món (ví dụ: ít ngọt, không hành, cay nhẹ...)"
                      value={item.note}
                      onChange={(e) => updateItemNote(item.menuItemId, e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                ))
              )}
            </div>

            {/* Footer giỏ hàng: Ghi chú chung & Nút gửi Bếp theo Button Hierarchy */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <input
                type="text"
                placeholder="Ghi chú chung cho toàn bàn..."
                value={generalNote}
                onChange={(e) => setGeneralNote(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-emerald-500"
              />

              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-600 text-sm">Tổng tiền gọi món:</span>
                <span className="text-xl font-black text-emerald-700">
                  {cartTotal.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <button
                disabled={cart.length === 0 || isSubmitting}
                onClick={handleSubmitOrder}
                className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  cart.length > 0 && !isSubmitting
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/30 active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'ĐANG GỬI SANG BẾP...' : 'GỬI ĐƠN SANG BẾP (KDS)'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <RecipeModal
        isOpen={recipeModal.open}
        onClose={() => setRecipeModal({ open: false, dish: null })}
        initialDish={recipeModal.dish}
        dishes={menuItems}
      />
    </div>
  );
}
