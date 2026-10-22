const express = require('express');
const router = express.Router();

const tableCtrl = require('../controllers/tableController');
const menuCtrl = require('../controllers/menuController');
const orderCtrl = require('../controllers/orderController');
const invoiceCtrl = require('../controllers/invoiceController');
const reportCtrl = require('../controllers/reportController');
const resCtrl = require('../controllers/reservationController');
const invCtrl = require('../controllers/inventoryController');
const shiftCtrl = require('../controllers/shiftController');
const auditCtrl = require('../controllers/auditLogController');
const utilCtrl = require('../controllers/utilityController');
const { uploadCloud } = require('../config/cloudinary');

// 1. Phân hệ Bàn ăn (Tables)
router.get('/tables', tableCtrl.getTables);
router.post('/tables', tableCtrl.createTable);
router.patch('/tables/:id/status', tableCtrl.updateTableStatus);

// 2. Phân hệ Lễ tân (Reception / Hostess)
router.get('/reservations', resCtrl.getReservations);
router.post('/reservations', resCtrl.createReservation);
router.patch('/reservations/:id/checkin', resCtrl.checkInReservation);
router.get('/waitlist', resCtrl.getWaitlist);
router.post('/waitlist', resCtrl.addToWaitlist);
router.patch('/waitlist/:id/seat', resCtrl.seatWaitlistCustomer);

// 3. Phân hệ Thực đơn & Món ăn & Cost Analysis
router.get('/categories', menuCtrl.getCategories);
router.get('/menu-items', menuCtrl.getMenuItems);
router.get('/menu-items/cost-analysis', menuCtrl.getMenuCostAnalysis);
router.post('/menu-items/reset-30-dishes', menuCtrl.reset30Dishes);
router.post('/menu-items', uploadCloud.single('image'), menuCtrl.createMenuItem);
router.patch('/menu-items/:id/toggle', menuCtrl.toggleAvailability);

// 4. Phân hệ Phục vụ (Mở bàn báo có khách, Order, Chuyển bàn, Ghép bàn, Hủy món)
router.post('/orders/open-table', orderCtrl.openTable);
router.post('/orders', orderCtrl.createOrUpdateOrder);
router.post('/orders/transfer-table', orderCtrl.transferTable);
router.post('/orders/merge-tables', orderCtrl.mergeTables);
router.delete('/orders/:orderId/items/:itemId', orderCtrl.cancelOrderItem);
router.get('/orders/kitchen', orderCtrl.getActiveKitchenOrders);
router.get('/orders/table/:tableId', orderCtrl.getOrderByTableId);
router.patch('/orders/:orderId/items/:itemId/status', orderCtrl.updateOrderItemStatus);

// 5. Phân hệ Bếp & Quầy Bar (86ing - Báo hết món khẩn cấp)
router.post('/kitchen/emergency-out-of-stock', orderCtrl.emergencyOutOfStock);

// 6. Phân hệ Thu ngân & Hóa đơn & Lịch sử
router.post('/invoices/preview', invoiceCtrl.createInvoicePreview);
router.post('/invoices/settle', invoiceCtrl.settlePayment);
router.get('/invoices/history', invoiceCtrl.getAllInvoices);
router.get('/shifts/current', shiftCtrl.getCurrentShift);
router.post('/shifts/open', shiftCtrl.openShift);
router.post('/shifts/close', shiftCtrl.closeShift);

// 7. Phân hệ Quản lý (Kho, Nhập hàng, Điện nước, Audit Log, Báo cáo)
router.get('/inventory', invCtrl.getInventory);
router.post('/inventory', invCtrl.createIngredient);
router.patch('/inventory/:id/import', invCtrl.importStock);
router.get('/inventory/imports', invCtrl.getImportHistory);
router.get('/utilities', utilCtrl.getUtilities);
router.post('/utilities', utilCtrl.createUtilityRecord);
router.get('/audit-logs', auditCtrl.getAuditLogs);
router.get('/reports/overview', reportCtrl.getOverviewStats);

module.exports = router;
