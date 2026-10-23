import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import PinModal from './components/PinModal';
import ReceptionPage from './pages/ReceptionPage';
import TablesPage from './pages/TablesPage';
import KitchenKDS from './pages/KitchenKDS';
import CashierPage from './pages/CashierPage';
import ManagerPage from './pages/ManagerPage';
import AccountManagementPage from './pages/AccountManagementPage';
import { getActiveUser, clearActiveUserSession } from './services/authStorage';

const ROLE_NAME_MAP = {
  reception: '1. Lễ Tân (Đặt bàn & Chờ)',
  waiter: '2. Phục Vụ (Sơ đồ & Gọi món)',
  kitchen: '3. Đầu Bếp / Bar (KDS & Công thức)',
  cashier: '4. Thu Ngân (VietQR & Hóa đơn)',
  manager: '5. Quản Lý (Kho & Báo cáo)',
  accounts: '6. Quản Lý Tài Khoản (Chủ sở hữu)'
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getActiveUser());
  const [activeRole, setActiveRole] = useState(() => {
    const user = getActiveUser();
    if (!user) return 'reception';
    if (user.accountType === 'owner') return 'reception';
    return user.position || 'reception';
  });

  const [pinPrompt, setPinPrompt] = useState({
    isOpen: false,
    targetRoleId: null
  });

  useEffect(() => {
    if (currentUser) {
      if (currentUser.accountType !== 'owner') {
        const allowedRoles = ['reception', 'waiter', 'kitchen', 'cashier', 'manager'];
        if (!allowedRoles.includes(activeRole)) {
          setActiveRole(currentUser.position || 'reception');
        }
      }
    }
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.accountType === 'owner') {
      setActiveRole('reception');
    } else {
      setActiveRole(user.position || 'reception');
    }
  };

  const handleLogout = () => {
    clearActiveUserSession();
    setCurrentUser(null);
    setActiveRole('reception');
  };

  const handleSelectRole = (targetRoleId) => {
    if (!currentUser) return;

    if (targetRoleId === 'accounts') {
      if (currentUser.accountType === 'owner') {
        setActiveRole('accounts');
      }
      return;
    }

    if (currentUser.accountType === 'owner') {
      setActiveRole(targetRoleId);
      return;
    }

    if (currentUser.position === 'manager') {
      setActiveRole(targetRoleId);
      return;
    }

    if (currentUser.position === targetRoleId) {
      setActiveRole(targetRoleId);
      return;
    }

    setPinPrompt({
      isOpen: true,
      targetRoleId
    });
  };

  const handlePinSuccess = () => {
    if (pinPrompt.targetRoleId) {
      setActiveRole(pinPrompt.targetRoleId);
    }
    setPinPrompt({ isOpen: false, targetRoleId: null });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {!currentUser && (
        <AuthModal onLoginSuccess={handleLoginSuccess} />
      )}

      {pinPrompt.isOpen && (
        <PinModal
          currentRoleLabel={ROLE_NAME_MAP[currentUser?.position] || currentUser?.position}
          targetRoleLabel={ROLE_NAME_MAP[pinPrompt.targetRoleId] || pinPrompt.targetRoleId}
          onSuccess={handlePinSuccess}
          onClose={() => setPinPrompt({ isOpen: false, targetRoleId: null })}
        />
      )}

      <Navbar
        activeRole={activeRole}
        onSelectRole={handleSelectRole}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeRole === 'reception' && <ReceptionPage />}
        {activeRole === 'waiter' && <TablesPage />}
        {activeRole === 'kitchen' && <KitchenKDS />}
        {activeRole === 'cashier' && <CashierPage />}
        {activeRole === 'manager' && <ManagerPage />}
        {activeRole === 'accounts' && <AccountManagementPage currentUser={currentUser} />}
      </main>

      <Footer
        onSelectRole={handleSelectRole}
        currentUser={currentUser}
      />
    </div>
  );
}
