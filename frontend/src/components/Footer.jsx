import React from 'react';
import { Phone, Mail, MapPin, Sparkles, ChevronRight } from 'lucide-react';

export default function Footer({ setActiveRole }) {
  const modules = [
    { id: 'reception', label: 'Lễ tân & Đặt bàn' },
    { id: 'waiter', label: 'Phục vụ & POS (Sơ đồ bàn)' },
    { id: 'kitchen', label: 'Bếp / Bar & KDS' },
    { id: 'cashier', label: 'Thu ngân & Két' },
    { id: 'manager', label: 'Quản lý & Kho nguyên liệu' }
  ];

  return (
    <footer className="relative mt-auto bg-gradient-to-b from-[#0b1329] via-[#080d1c] to-[#040711] text-slate-200 border-t border-amber-500/25 overflow-hidden">
      {/* Hiệu ứng tia sáng vi mạch công nghệ vàng gold phía trên */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent"></div>
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-amber-500/20">
          
          {/* CỘT 1: Logo & Giới thiệu hệ thống */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#141e36] to-[#0a1020] p-1 border border-amber-400/40 shadow-lg shadow-amber-500/15 flex items-center justify-center shrink-0">
                <img
                  src="/assets/logo.png"
                  alt="Cloud Restaurant RMS Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg tracking-wider bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                  CLOUD RESTAURANT
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-widest text-amber-400">RMS</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    • Restaurant Management System
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300/90 leading-relaxed max-w-md pt-1">
              Hệ thống quản lý nhà hàng đa phân hệ, tối ưu hóa quy trình từ lễ tân, phục vụ đến bếp và kho quỹ.
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-amber-300/90">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Nền Tảng Đám Mây • Kết Nối Thời Gian Thực Socket.IO</span>
            </div>
          </div>

          {/* CỘT 2: Phân hệ chức năng */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-amber-400 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-amber-400 rounded-full"></span>
              Phân Hệ Chức Năng
            </h4>
            <ul className="space-y-2 text-xs">
              {modules.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => setActiveRole && setActiveRole(m.id)}
                    className="group flex items-center gap-2 text-slate-300 hover:text-amber-300 transition-colors text-left py-0.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500/60 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                    <span>{m.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 3: Thông tin liên hệ (Địa chỉ: 50 Cát Bi, Hải An, Hải Phòng) */}
          <div className="md:col-span-4 space-y-3.5">
            <h4 className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-amber-400 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-amber-400 rounded-full"></span>
              Thông Tin Liên Hệ
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5 text-amber-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-slate-100">Hotline: 1900 8888 / 0963 769 034</span>
                  <span className="text-[11px] text-amber-400/80 font-medium">(Hỗ trợ kỹ thuật 24/7)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5 text-amber-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Email:</span>
                  <a href="mailto:contact@cloudrms.vn" className="font-bold text-slate-100 hover:text-amber-300 transition-colors">
                    contact@cloudrms.vn
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5 text-amber-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Địa chỉ nhà hàng:</span>
                  <span className="font-bold text-slate-100 block">
                    50 Cát Bi, Hải An, Hải Phòng
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Chân trang dưới cùng */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-medium">
          <p>
            Copyright © 2026 <span className="font-bold text-amber-400/90">CLOUD RESTAURANT RMS</span>. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="hover:text-amber-300 cursor-pointer transition-colors">Điều khoản sử dụng</span>
            <span>|</span>
            <span className="hover:text-amber-300 cursor-pointer transition-colors">Chính sách bảo mật</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
