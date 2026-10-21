import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ReceptionPage from './pages/ReceptionPage';
import TablesPage from './pages/TablesPage';
import KitchenKDS from './pages/KitchenKDS';
import CashierPage from './pages/CashierPage';
import ManagerPage from './pages/ManagerPage';

export default function App() {
  // Mặc định vai trò là 'reception' (Lễ tân) hoặc 'waiter' (Phục vụ)
  const [activeRole, setActiveRole] = useState('reception');

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Thanh điều hướng tích hợp Role Switcher Demo */}
      <Navbar activeRole={activeRole} setActiveRole={setActiveRole} />

      {/* Nội dung chuyên môn theo từng vai trò */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeRole === 'reception' && <ReceptionPage />}
        {activeRole === 'waiter' && <TablesPage />}
        {activeRole === 'kitchen' && <KitchenKDS />}
        {activeRole === 'cashier' && <CashierPage />}
        {activeRole === 'manager' && <ManagerPage />}
      </main>
    </div>
  );
}
