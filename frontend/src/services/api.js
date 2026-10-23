import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cloud_rms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = (data) => api.post('/auth/login', data);
export const registerStaffUser = (data) => api.post('/auth/register-staff', data);
export const registerOwnerUser = (data) => api.post('/auth/register-owner', data);
export const getAllAccounts = () => api.get('/auth/users');
export const updateAccountStatus = (id, data) => api.patch(`/auth/users/${id}/status`, data);
export const deleteAccount = (id) => api.delete(`/auth/users/${id}`);

export const getTables = () => api.get('/tables');
export const updateTableStatus = (id, status) => api.patch(`/tables/${id}/status`, { status });
export const createTable = (data) => api.post('/tables', data);

export const getReservations = () => api.get('/reservations');
export const createReservation = (data) => api.post('/reservations', data);
export const checkInReservation = (id, data) => api.patch(`/reservations/${id}/checkin`, data);
export const getWaitlist = () => api.get('/waitlist');
export const addToWaitlist = (data) => api.post('/waitlist', data);
export const seatWaitlistCustomer = (id, data) => api.patch(`/waitlist/${id}/seat`, data);

export const getCategories = () => api.get('/categories');
export const getMenuItems = (params) => api.get('/menu-items', { params });
export const getMenuCostAnalysis = () => api.get('/menu-items/cost-analysis');
export const toggleMenuItemAvailability = (id) => api.patch(`/menu-items/${id}/toggle`);
export const resetDatabaseMenu30 = () => api.post('/menu-items/reset-30-dishes');

export const openTable = (data) => api.post('/orders/open-table', data);
export const createOrUpdateOrder = (orderData) => api.post('/orders', orderData);
export const transferTable = (data) => api.post('/orders/transfer-table', data);
export const mergeTables = (data) => api.post('/orders/merge-tables', data);
export const cancelOrderItem = (orderId, itemId, data) => api.delete(`/orders/${orderId}/items/${itemId}`, { data });
export const getKitchenOrders = () => api.get('/orders/kitchen');
export const getOrderByTableId = (tableId) => api.get(`/orders/table/${tableId}`);
export const updateOrderItemStatus = (orderId, itemId, status) =>
  api.patch(`/orders/${orderId}/items/${itemId}/status`, { status });

export const emergencyOutOfStock = (data) => api.post('/kitchen/emergency-out-of-stock', data);

export const getInvoicePreview = (data) => api.post('/invoices/preview', data);
export const settlePayment = (data) => api.post('/invoices/settle', data);
export const getAllInvoices = (params) => api.get('/invoices/history', { params });
export const getCurrentShift = () => api.get('/shifts/current');
export const openShift = (data) => api.post('/shifts/open', data);
export const closeShift = (data) => api.post('/shifts/close', data);

export const getInventory = () => api.get('/inventory');
export const importStock = (id, data) => api.patch(`/inventory/${id}/import`, data);
export const getImportHistory = () => api.get('/inventory/imports');
export const getUtilities = () => api.get('/utilities');
export const createUtilityRecord = (data) => api.post('/utilities', data);
export const getAuditLogs = () => api.get('/audit-logs');
export const getReportStats = () => api.get('/reports/overview');
export const resetAllRestaurantData = (data) => api.post('/restaurant/reset-all', data);

export default api;
