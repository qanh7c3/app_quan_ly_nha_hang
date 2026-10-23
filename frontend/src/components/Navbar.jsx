import React, { useState, useEffect } from 'react';
import {
  Bell,
  Wifi,
  WifiOff,
  Clock,
  UserCheck,
  UtensilsCrossed,
  ChefHat,
  Receipt,
  ShieldAlert,
  X
} from 'lucide-react';
import socket from '../services/socket';

export default function Navbar({ activeRole, setActiveRole }) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('vi-VN'));
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Lắng nghe thông báo trả món từ Bếp
    const handleItemReady = (data) => {
      setNotifications((prev) => [
        { id: Date.now(), type: 'ready', message: data.message, time: new Date().toLocaleTimeString('vi-VN') },
        ...prev.slice(0, 4)
      ]);
    };

    // Lắng nghe thông báo Bếp báo hết món (86ing)
    const handleItemOutOfStock = (data) => {
      setNotifications((prev) => [
        { id: Date.now(), type: 'out_of_stock', message: data.message, time: new Date().toLocaleTimeString('vi-VN') },
        ...prev.slice(0, 4)
      ]);
    };

    socket.on('order:item_ready', handleItemReady);
    socket.on('menu:item_out_of_stock', handleItemOutOfStock);

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN'));
    }, 1000);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('order:item_ready', handleItemReady);
      socket.off('menu:item_out_of_stock', handleItemOutOfStock);
      clearInterval(timer);
    };
  }, []);

  const roles = [
    { id: 'reception', label: '1. Lễ Tân', subtitle: 'Đặt bàn & Chờ', icon: UserCheck, color: 'text-purple-600' },
    { id: 'waiter', label: '2. Phục Vụ', subtitle: 'Sơ đồ & Order', icon: UtensilsCrossed, color: 'text-orange-600' },
    { id: 'kitchen', label: '3. Đầu Bếp / Bar', subtitle: 'KDS & 86ing', icon: ChefHat, color: 'text-rose-600' },
    { id: 'cashier', label: '4. Thu Ngân', subtitle: 'VietQR & Két', icon: Receipt, color: 'text-emerald-600' },
    { id: 'manager', label: '5. Quản Lý', subtitle: 'Kho & Audit Log', icon: ShieldAlert, color: 'text-blue-600' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Banner thông báo nổi nếu có món mới hoàn thành hoặc báo hết món */}
      {notifications.length > 0 && (
        <div className="bg-amber-500 text-slate-900 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-2 max-w-4xl truncate">
            <Bell className="w-4 h-4 shrink-0 animate-bounce" />
            <span>[THÔNG BÁO REALTIME]: {notifications[0].message}</span>
            <span className="text-amber-900 text-[11px]">({notifications[0].time})</span>
          </div>
          <button
            onClick={() => setNotifications([])}
            className="p-1 hover:bg-amber-600/30 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Tên nhà hàng */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#0b1329] p-1 border border-amber-400/40 shadow-md shadow-amber-500/20 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/assets/logo.png"
                alt="Cloud Restaurant RMS"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-sm tracking-wide bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-700 bg-clip-text text-transparent leading-tight">
                Cloud Restaurant RMS
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold">Hệ Thống Quản Trị Đa Phân Hệ</p>
            </div>
          </div>

          {/* Role Switcher Demo (Thanh chuyển đổi nhanh vai trò để thuyết trình đồ án) */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 no-scrollbar">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = activeRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveRole(r.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : r.color}`} />
                  <div className="text-left">
                    <p className="leading-none">{r.label}</p>
                    <p className="text-[9px] opacity-70 font-normal hidden sm:block mt-0.5">{r.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Trạng thái Cloud & Đồng hồ */}
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600 shrink-0">
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentTime}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-semibold ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span className="hidden sm:inline">Cloud Realtime</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Nối lại...</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
