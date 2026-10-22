import React, { useState, useEffect } from 'react';
import { BookOpen, X, Search, Utensils, Sparkles } from 'lucide-react';
import { getStoredMenu30 } from '../data/defaultMenu30';

export default function RecipeModal({ isOpen, onClose, initialDish, dishes = [] }) {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let items = Array.isArray(dishes) && dishes.length >= 30 ? dishes : getStoredMenu30();
    setMenuItems(items);

    if (initialDish) {
      const match = items.find(
        (m) =>
          m._id === initialDish._id ||
          m._id === initialDish.menuItemId ||
          m.name.toLowerCase() === (initialDish.name || '').toLowerCase()
      );
      setSelectedDish(match || initialDish);
    } else if (items.length > 0) {
      setSelectedDish(items[0]);
    }
  }, [isOpen, initialDish, dishes]);

  if (!isOpen || !selectedDish) return null;

  const filteredDishes = menuItems.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.categoryId?.name && m.categoryId.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const price = selectedDish.price || 0;
  const cost = selectedDish.costPrice || 0;
  const profit = Math.max(0, price - cost);
  const currentIndex = menuItems.findIndex((m) => m._id === selectedDish._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto border border-slate-100">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl shadow-md shadow-orange-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-slate-900">
                  Sổ Tay Công Thức 30 Món Gia Đình
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
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm món trong sổ tay 30 món..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Chọn món:</span>
            <select
              value={selectedDish._id}
              onChange={(e) => {
                const picked = menuItems.find((m) => m._id === e.target.value);
                if (picked) setSelectedDish(picked);
              }}
              className="text-xs border border-slate-200 bg-white rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-amber-500 max-w-[220px] truncate"
            >
              {filteredDishes.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/70">
          {selectedDish.imageUrl && (
            <img
              src={selectedDish.imageUrl}
              alt={selectedDish.name}
              className="w-24 h-24 rounded-2xl object-cover shadow-md shrink-0 border-2 border-white"
            />
          )}
          <div className="text-xs space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-base text-slate-900">{selectedDish.name}</h4>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                {selectedDish.categoryId?.name || selectedDish.category || 'Món ăn'}
              </span>
            </div>
            <p className="text-slate-600">{selectedDish.description}</p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="font-extrabold text-orange-600 bg-white px-2.5 py-1 rounded-lg border border-orange-200">
                Giá bán: {price.toLocaleString('vi-VN')} đ
              </span>
              {cost > 0 && (
                <span className="font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  Giá vốn chợ: {cost.toLocaleString('vi-VN')} đ
                </span>
              )}
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Lợi nhuận gộp: {profit.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-rose-500" />
            Định Lượng Nguyên Liệu & Gia Vị Tự Động Trừ Kho (1 Suất):
          </h4>

          {!selectedDish.recipe || selectedDish.recipe.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Chưa cấu hình định lượng cho món này.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {selectedDish.recipe.map((ing, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <span className="font-bold text-slate-800">{ing.ingredientName}</span>
                  <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    {ing.amount} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Hướng Dẫn Các Bước Nấu & Chế Biến Chi Tiết (SOP):
          </h4>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80">
              <span className="font-bold text-amber-900 block mb-0.5">Bước 1: Sơ chế & Chuẩn bị nguyên liệu</span>
              <p className="leading-relaxed">
                {selectedDish.instructions?.preparation ||
                  'Sơ chế sạch sẽ các nguyên liệu theo quy chuẩn an toàn vệ sinh thực phẩm.'}
              </p>
            </div>

            <div className="p-3 bg-orange-50/70 rounded-xl border border-orange-200/80">
              <span className="font-bold text-orange-900 block mb-0.5">Bước 2: Tẩm ướp gia vị</span>
              <p className="leading-relaxed">
                {selectedDish.instructions?.seasoning ||
                  'Tẩm ướp đúng liều lượng gia vị trong sổ tay để đảm bảo tròn vị món ăn.'}
              </p>
            </div>

            <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/80">
              <span className="font-bold text-rose-900 block mb-0.5">
                Bước 3: Chế biến nhiệt (Xào / Kho / Nấu canh / Chiên / Áp chảo)
              </span>
              <p className="leading-relaxed">
                {selectedDish.instructions?.cookingSteps ||
                  'Thực hiện chế biến với nhiệt độ chuẩn xác, canh lửa và thời gian hợp lý.'}
              </p>
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
              <span className="font-bold text-emerald-900 block mb-0.5">Bước 4: Trình bày & Ra đồ</span>
              <p className="leading-relaxed">
                {selectedDish.instructions?.presentation ||
                  'Bày ra đĩa/tô đẹp mắt, trang trí rau thơm và phục vụ chuẩn quy cách.'}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {currentIndex >= 0 ? `Đang hiển thị món ${currentIndex + 1} / ${menuItems.length}` : ''}
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
          >
            Đóng Sổ Tay
          </button>
        </div>
      </div>
    </div>
  );
}
