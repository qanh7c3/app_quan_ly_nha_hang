const STORAGE_KEY = 'restaurant_user_accounts_v1';
const AUTH_USER_KEY = 'cloud_rms_auth_user';
const TOKEN_KEY = 'cloud_rms_token';

const DEFAULT_ACCOUNTS = [
  {
    _id: 'acc_owner_1',
    name: 'Nguyễn Văn Chủ',
    username: 'admin',
    password: '123',
    accountType: 'owner',
    position: 'owner',
    plan: 'enterprise',
    planName: 'Gói Chuỗi Doanh Nghiệp (Enterprise) - 1.899.000 đ/tháng',
    approvalStatus: 'approved',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'acc_manager_1',
    name: 'Phạm Tổng Quản Lý',
    username: 'quanly',
    password: '123',
    accountType: 'staff',
    position: 'manager',
    plan: null,
    planName: '',
    approvalStatus: 'approved',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'acc_reception_1',
    name: 'Hoàng Lễ Tân',
    username: 'letan',
    password: '123',
    accountType: 'staff',
    position: 'reception',
    plan: null,
    planName: '',
    approvalStatus: 'approved',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'acc_waiter_1',
    name: 'Lê Văn Phục Vụ',
    username: 'phucvu',
    password: '123',
    accountType: 'staff',
    position: 'waiter',
    plan: null,
    planName: '',
    approvalStatus: 'approved',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'acc_kitchen_1',
    name: 'Nguyễn Bếp Trưởng',
    username: 'daubep',
    password: '123',
    accountType: 'staff',
    position: 'kitchen',
    plan: null,
    planName: '',
    approvalStatus: 'approved',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'acc_cashier_1',
    name: 'Trần Thu Ngân',
    username: 'thungan',
    password: '123',
    accountType: 'staff',
    position: 'cashier',
    plan: null,
    planName: '',
    approvalStatus: 'approved',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const getStoredAccounts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_ACCOUNTS;
  }
};

export const saveStoredAccounts = (accounts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
};

export const getActiveUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setActiveUserSession = (user, token = 'token_local_session') => {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearActiveUserSession = () => {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export const findLocalAccount = (username, password, accountType) => {
  const accounts = getStoredAccounts();
  const cleanUsername = (username || '').trim().toLowerCase();
  return accounts.find(
    (a) =>
      a.username.toLowerCase() === cleanUsername &&
      a.password === password &&
      (!accountType || a.accountType === accountType)
  );
};

export const addLocalStaffAccount = (data) => {
  const accounts = getStoredAccounts();
  const cleanUsername = data.username.trim().toLowerCase();
  if (accounts.some((a) => a.username.toLowerCase() === cleanUsername)) {
    throw new Error('Tên tài khoản này đã được sử dụng');
  }
  const newAccount = {
    _id: 'acc_' + Date.now(),
    name: data.name.trim(),
    username: cleanUsername,
    password: data.password,
    accountType: 'staff',
    position: data.position,
    plan: null,
    planName: '',
    approvalStatus: 'pending',
    isActive: true,
    createdAt: new Date().toISOString()
  };
  accounts.unshift(newAccount);
  saveStoredAccounts(accounts);
  return newAccount;
};

export const addLocalOwnerAccount = (data) => {
  const accounts = getStoredAccounts();
  const cleanUsername = data.username.trim().toLowerCase();
  if (accounts.some((a) => a.username.toLowerCase() === cleanUsername)) {
    throw new Error('Tên tài khoản này đã được sử dụng');
  }
  const newAccount = {
    _id: 'acc_' + Date.now(),
    name: data.name.trim(),
    username: cleanUsername,
    password: data.password,
    accountType: 'owner',
    position: 'owner',
    plan: data.plan,
    planName: data.planName || data.plan,
    approvalStatus: 'approved',
    isActive: true,
    createdAt: new Date().toISOString()
  };
  accounts.unshift(newAccount);
  saveStoredAccounts(accounts);
  return newAccount;
};

export const updateLocalAccountStatus = (id, updates) => {
  const accounts = getStoredAccounts();
  const idx = accounts.findIndex((a) => a._id === id);
  if (idx !== -1) {
    accounts[idx] = { ...accounts[idx], ...updates };
    saveStoredAccounts(accounts);
    return accounts[idx];
  }
  return null;
};

export const deleteLocalAccount = (id) => {
  const accounts = getStoredAccounts();
  const filtered = accounts.filter((a) => a._id !== id);
  saveStoredAccounts(filtered);
  return true;
};
