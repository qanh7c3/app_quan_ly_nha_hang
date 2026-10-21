import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Send, Trash2, ShoppingCart, Search, Utensils } from 'lucide-react';
import { getCategories, getMenuItems, createOrUpdateOrder } from '../services/api';

export default function OrderModal({ table, onClose, onOrderSuccess }) {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [generalNote, setGeneralNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load danh mục và món ăn
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, menuRes] = await Promise.all([
          getCategories(),
          getMenuItems()
        ]);
        if (catRes.data.success) {
          setCategories(catRes.data.data);
        }
        if (menuRes.data.success) {
          setMenuItems(menuRes.data.data);
        }
      } catch (err) {
        console.error('Lỗi tải thực đơn:', err);
      }
    };
    fetchData();
  }, []);

  // Lọc món ăn theo danh mục và tìm kiếm
  const filteredItems = menuItems.filter((item) => {
    const matchCategory = selectedCategory ? item.categoryId?._id === selectedCategory : true;
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Thêm vào giỏ
  const addToCart = (item) => {
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
        generalNote
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="w-3 h-8 bg-orange-500 rounded-full"></span>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Gọi Món: <span className="text-orange-600">{table.tableNumber}</span>
              </h2>
              <p className="text-xs text-slate-500">
                Khu vực: {table.zone} | Sức chứa: {table.capacity} người
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Thân Modal: 2 Cột (Trái: Menu món ăn, Phải: Giỏ gọi món) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Cột 1: Thực đơn món ăn (8 cột) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col border-r border-slate-200 overflow-hidden bg-slate-50/50">
            {/* Bộ lọc Danh mục & Tìm kiếm */}
            <div className="p-4 border-b border-slate-200 bg-white space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn, đồ uống..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white border border-transparent focus:border-orange-500"
                />
              </div>

              {/* Danh sách tab danh mục */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === null
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat._id
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Lưới hiển thị các món ăn */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  onClick={() => addToCart(item)}
                  className="group bg-white rounded-xl border border-slate-200/80 p-2.5 flex flex-col justify-between hover:shadow-md hover:border-orange-300 transition-all cursor-pointer relative"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1.5 right-1.5 bg-slate-900/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                      {item.station === 'bar' ? 'Quầy Bar' : 'Bếp'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm text-slate-800 line-clamp-1 group-hover:text-orange-600">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.description || 'Thơm ngon đậm vị'}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-orange-600">
                      {item.price.toLocaleString('vi-VN')} đ
                    </span>
                    <button className="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cột 2: Giỏ món chuẩn bị gửi Bếp (5 cột) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-sm text-slate-800">
                  Món mới chọn ({cart.length})
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium"
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
                  <p className="text-sm font-medium">Chưa có món nào được chọn</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Nhấp vào món ăn bên trái để thêm vào danh sách gửi bếp
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-xs text-slate-800">{item.name}</h4>
                        <span className="text-xs text-orange-600 font-bold">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      {/* Tăng giảm số lượng */}
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.menuItemId, -1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800 min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menuItemId, 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Ghi chú từng món */}
                    <input
                      type="text"
                      placeholder="Ghi chú món (ví dụ: ít ngọt, không hành...)"
                      value={item.note}
                      onChange={(e) => updateItemNote(item.menuItemId, e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                ))
              )}
            </div>

            {/* Footer giỏ hàng: Ghi chú chung & Nút gửi Bếp */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <input
                type="text"
                placeholder="Ghi chú chung cho toàn đơn..."
                value={generalNote}
                onChange={(e) => setGeneralNote(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-orange-500"
              />

              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-600 text-sm">Tổng tiền món mới:</span>
                <span className="text-lg text-orange-600">
                  {cartTotal.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <button
                disabled={cart.length === 0 || isSubmitting}
                onClick={handleSubmitOrder}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  cart.length > 0 && !isSubmitting
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Đang gửi...' : 'GỬI ĐƠN SANG BẾP (KDS)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
