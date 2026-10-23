import React, { useState, useEffect } from 'react';
import {
  Receipt,
  QrCode,
  CreditCard,
  Banknote,
  Printer,
  CheckCircle,
  Award,
  PlusCircle,
  Briefcase,
  Lock,
  Unlock,
  Split,
  History,
  Search,
  Calendar,
  X,
  Eye,
  FileText
} from 'lucide-react';
import {
  getTables,
  getInvoicePreview,
  settlePayment,
  getCurrentShift,
  openShift,
  closeShift,
  getAllInvoices
} from '../services/api';
import socket from '../services/socket';

export default function CashierPage() {
  const [activeSubTab, setActiveSubTab] = useState('billing'); // 'billing', 'history', 'shift'
  const [occupiedTables, setOccupiedTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [invoicePreview, setInvoicePreview] = useState(null);

  // Khổ in nhiệt: K80 (80mm) hoặc K58 (58mm)
  const [printPaperWidth, setPrintPaperWidth] = useState('k80');

  // Khuyến mãi & Phụ thu
  const [discountPercent, setDiscountPercent] = useState(0);
  const [memberTier, setMemberTier] = useState('none');
  const [vatPercent, setVatPercent] = useState(8);
  const [surchargeAmount, setSurchargeAmount] = useState(0);
  const [surchargeReason, setSurchargeReason] = useState('');

  // Hình thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState('vietqr');
  const [splitCash, setSplitCash] = useState(0);
  const [splitTransfer, setSplitTransfer] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // Lịch sử hóa đơn
  const [invoicesHistory, setInvoicesHistory] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [viewInvoiceModal, setViewInvoiceModal] = useState({ open: false, invoice: null });

  // Quản lý ca làm việc (Shift)
  const [currentShift, setCurrentShift] = useState(null);
  const [openingCashInput, setOpeningCashInput] = useState(1000000);
  const [closingCashInput, setClosingCashInput] = useState(0);
  const [closingNotes, setClosingNotes] = useState('');

  // Thông tin tài khoản MB Bank của người dùng
  const BANK_INFO = {
    bankId: 'MB',
    bankName: 'MB Bank (Quân Đội)',
    accountNo: '0963769034',
    accountName: 'CAO QUOC ANH'
  };

  const fetchBillingData = async () => {
    try {
      const res = await getTables();
      if (res.data.success) {
        const occupied = res.data.data.filter((t) => t.status === 'occupied' && t.currentOrderId);
        setOccupiedTables(occupied);
        if (occupied.length > 0 && !selectedTable) {
          handleSelectTable(occupied[0]);
        }
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu thu ngân:', err);
    }
  };

  const fetchShiftData = async () => {
    try {
      const res = await getCurrentShift();
      if (res.data.success) {
        setCurrentShift(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải ca:', err);
    }
  };

  const fetchHistoryData = async () => {
    try {
      const res = await getAllInvoices({ search: historySearch });
      if (res.data.success) {
        setInvoicesHistory(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải lịch sử hóa đơn:', err);
    }
  };

  useEffect(() => {
    fetchBillingData();
    fetchShiftData();
    fetchHistoryData();

    const handleUpdate = () => {
      fetchBillingData();
      fetchShiftData();
      fetchHistoryData();
    };

    const handleResetAll = () => {
      setSelectedTable(null);
      setPreview(null);
      setOccupiedTables([]);
      fetchBillingData();
      fetchShiftData();
      fetchHistoryData();
    };

    socket.on('table:status_changed', handleUpdate);
    socket.on('order:created', handleUpdate);
    socket.on('payment:completed', handleUpdate);
    socket.on('restaurant:reset_all', handleResetAll);

    return () => {
      socket.off('table:status_changed', handleUpdate);
      socket.off('order:created');
      socket.off('payment:completed');
      socket.off('restaurant:reset_all', handleResetAll);
    };
  }, []);

  const handleSelectTable = async (table) => {
    setSelectedTable(table);
    setPaymentSuccessData(null);
    if (!table.currentOrderId) return;

    try {
      const orderId = typeof table.currentOrderId === 'object' ? table.currentOrderId._id : table.currentOrderId;
      const res = await getInvoicePreview({
        orderId,
        discountAmount: 0,
        vatPercent: 8,
        memberTier: 'none',
        surcharge: 0
      });
      if (res.data.success) {
        setInvoicePreview(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tính hóa đơn:', err);
    }
  };

  // Tính lại tiền
  const calculateFinalTotals = () => {
    if (!invoicePreview?.order) return { subtotal: 0, discountAmount: 0, vatAmount: 0, finalAmount: 0 };
    const subtotal = invoicePreview.order.totalAmount || 0;

    let memberDiscountPercent = 0;
    if (memberTier === 'silver') memberDiscountPercent = 5;
    else if (memberTier === 'gold') memberDiscountPercent = 10;
    else if (memberTier === 'diamond') memberDiscountPercent = 15;

    const totalDiscountRate = Math.min(100, discountPercent + memberDiscountPercent);
    const discountAmount = Math.round((subtotal * totalDiscountRate) / 100);

    const amountAfterDiscount = Math.max(0, subtotal - discountAmount + Number(surchargeAmount));
    const vatAmount = Math.round((amountAfterDiscount * vatPercent) / 100);
    const finalAmount = amountAfterDiscount + vatAmount;

    return { subtotal, discountAmount, vatAmount, finalAmount };
  };

  const { subtotal, discountAmount, vatAmount, finalAmount } = calculateFinalTotals();

  // Xác nhận thanh toán
  const handleSettle = async () => {
    if (!selectedTable?.currentOrderId) return;
    setIsProcessing(true);
    try {
      const orderId = typeof selectedTable.currentOrderId === 'object'
        ? selectedTable.currentOrderId._id
        : selectedTable.currentOrderId;

      const res = await settlePayment({
        orderId,
        tableId: selectedTable._id,
        paymentMethod,
        discountAmount,
        discountReason: discountPercent > 0 ? `Giảm ${discountPercent}%` : '',
        vatPercent,
        memberTier,
        surcharge: surchargeAmount > 0 ? { amount: Number(surchargeAmount), reason: surchargeReason || 'Phụ thu' } : null,
        splitDetails: paymentMethod === 'split' ? { cash: splitCash, bankTransfer: splitTransfer } : null,
        cashierName: currentShift?.cashierName || 'Trần Thu Ngân'
      });

      if (res.data.success) {
        setPaymentSuccessData(res.data.data);
        setSelectedTable(null);
        setInvoicePreview(null);
        fetchBillingData();
        fetchShiftData();
        fetchHistoryData();
      }
    } catch (err) {
      alert('Lỗi thanh toán: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  // In hóa đơn nhiệt
  const handlePrintReceipt = () => {
    window.print();
  };

  // Mở ca
  const handleOpenShift = async (e) => {
    e.preventDefault();
    try {
      const res = await openShift({
        openingCash: openingCashInput,
        cashierName: 'Trần Thu Ngân'
      });
      if (res.data.success) {
        alert('Mở ca làm việc thành công!');
        fetchShiftData();
      }
    } catch (err) {
      alert('Lỗi mở ca: ' + err.message);
    }
  };

  // Kết thúc ca
  const handleCloseShift = async (e) => {
    e.preventDefault();
    try {
      const res = await closeShift({
        actualCashAtClosing: closingCashInput,
        notes: closingNotes
      });
      if (res.data.success) {
        alert('Đã kết ca và chốt sổ thành công!');
        fetchShiftData();
      }
    } catch (err) {
      alert('Lỗi kết ca: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Quầy Thu Ngân Hiện Đại */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-teal-500/20 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
            <Receipt className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight">Hệ Thống Thu Ngân & Xuất Hóa Đơn (POS Cashier)</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                Cloud POS
              </span>
            </div>
            <p className="text-xs text-teal-200/90 mt-1">
              Thanh toán đa phương thức • Quét VietQR MB Bank tự động • In hóa đơn nhiệt K80/K58 • Lịch sử hóa đơn • Quản lý ca & két tiền
            </p>
          </div>
        </div>

        {/* Chuyển đổi tab con và khổ in */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chọn khổ giấy in nhiệt K80 / K58 */}
          <div className="flex items-center bg-black/40 p-1 rounded-xl text-xs font-bold border border-white/10">
            <span className="text-[11px] text-slate-300 px-2 flex items-center gap-1">
              <Printer className="w-3 h-3 text-teal-400" /> Khổ in:
            </span>
            <button
              onClick={() => setPrintPaperWidth('k80')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                printPaperWidth === 'k80' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              K80 (80mm)
            </button>
            <button
              onClick={() => setPrintPaperWidth('k58')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                printPaperWidth === 'k58' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              K58 (58mm)
            </button>
          </div>

          {/* 3 Tab chức năng */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl text-xs font-bold border border-white/10">
            <button
              onClick={() => setActiveSubTab('billing')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'billing' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Thanh Toán ({occupiedTables.length})
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeSubTab === 'history' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Lịch Sử ({invoicesHistory.length})
            </button>
            <button
              onClick={() => setActiveSubTab('shift')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeSubTab === 'shift' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> Quản Lý Ca
            </button>
          </div>
        </div>
      </div>

      {/* Thông báo thanh toán thành công */}
      {paymentSuccessData && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center justify-between text-xs animate-fade-in shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-extrabold text-emerald-900 text-sm">
                Thanh toán thành công hóa đơn #{paymentSuccessData.invoiceCode} ({paymentSuccessData.finalAmount?.toLocaleString('vi-VN')} đ)!
              </p>
              <p className="text-xs text-emerald-700">
                Bàn đã tự động giải phóng và kho nguyên liệu đã được trừ theo định lượng món ăn.
              </p>
            </div>
          </div>
          <button
            onClick={handlePrintReceipt}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" /> In Hóa Đơn Cho Khách ({printPaperWidth.toUpperCase()})
          </button>
        </div>
      )}

      {activeSubTab === 'billing' ? (
        /* TAB 1: THANH TOÁN BÀN ĐANG ĂN */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Danh sách bàn đang ăn */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-extrabold text-sm text-slate-800 px-1">Chọn bàn cần thanh toán</h3>
            {occupiedTables.length === 0 ? (
              <div className="p-12 bg-white/90 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs shadow-sm">
                Hiện không có bàn nào đang chờ thanh toán.
              </div>
            ) : (
              occupiedTables.map((t) => (
                <div
                  key={t._id}
                  onClick={() => handleSelectTable(t)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    selectedTable?._id === t._id
                      ? 'border-emerald-500 bg-emerald-50/60 shadow-md'
                      : 'bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{t.tableNumber}</h4>
                    <span className="text-xs text-slate-500">{t.zone} • {t.guestCount || 2} khách</span>
                  </div>
                  <span className="font-black text-sm text-emerald-600">
                    {t.currentOrderId?.totalAmount?.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Cột phải: Chi tiết hóa đơn & Quét VietQR MB Bank */}
          <div className="lg:col-span-8">
            {selectedTable && invoicePreview?.order ? (
              <div className="bg-white/95 rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      Mã: {invoicePreview.order.orderCode}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1">
                      Thanh Toán: {selectedTable.tableNumber} ({selectedTable.zone} - {selectedTable.guestCount || 2} khách)
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrintReceipt}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Printer className="w-3.5 h-3.5 text-teal-400" /> In Phiếu Tạm Tính ({printPaperWidth.toUpperCase()})
                    </button>
                  </div>
                </div>

                {/* Danh sách món ăn */}
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto text-xs">
                  {invoicePreview.order.items?.filter(i => i.status !== 'cancelled').map((item, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-100 font-bold flex items-center justify-center text-slate-700">
                          {item.quantity}
                        </span>
                        <span className="font-semibold text-slate-800">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  ))}
                </div>

                {/* Khuyến mãi, Thành viên & Phụ thu */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-2xl text-xs border border-slate-200/80">
                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Hạng thành viên</label>
                    <select
                      value={memberTier}
                      onChange={(e) => setMemberTier(e.target.value)}
                      className="w-full p-2 bg-white border rounded-xl font-semibold"
                    >
                      <option value="none">Khách thường (0%)</option>
                      <option value="silver">Bạc - Silver (5%)</option>
                      <option value="gold">Vàng - Gold (10%)</option>
                      <option value="diamond">Kim cương - VIP (15%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Voucher / Giảm giá (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full p-2 bg-white border rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Phụ thu (Phòng VIP/Rượu)</label>
                    <input
                      type="number"
                      placeholder="0 đ"
                      value={surchargeAmount}
                      onChange={(e) => setSurchargeAmount(Number(e.target.value))}
                      className="w-full p-2 bg-white border rounded-xl font-bold"
                    />
                  </div>
                </div>

                {/* Tổng kết số tiền */}
                <div className="space-y-1.5 text-xs text-slate-600 border-t pt-3">
                  <div className="flex justify-between">
                    <span>Tiền món ăn:</span>
                    <span className="font-bold">{subtotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Tổng giảm giá:</span>
                      <span>-{discountAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  {surchargeAmount > 0 && (
                    <div className="flex justify-between text-indigo-600 font-bold">
                      <span>Phụ thu:</span>
                      <span>+{Number(surchargeAmount).toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Thuế VAT ({vatPercent}%):</span>
                    <span>+{vatAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-slate-900 border-t pt-2">
                    <span>Khách Phải Trả:</span>
                    <span className="text-xl text-emerald-600 font-black">{finalAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

                {/* Chọn phương thức thanh toán */}
                <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                  {[
                    { id: 'vietqr', label: 'Mã MB Bank', icon: QrCode },
                    { id: 'cash', label: 'Tiền mặt', icon: Banknote },
                    { id: 'card', label: 'Thẻ POS', icon: CreditCard },
                    { id: 'split', label: 'Kết hợp', icon: Split }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === m.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <m.icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Quét Mã VietQR MB Bank của người dùng */}
                {(paymentMethod === 'vietqr' || paymentMethod === 'split') && (
                  <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-teal-500/30">
                    <div className="text-xs space-y-1.5 text-center sm:text-left">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 uppercase">
                        Mã VietQR Tự Động (MB Bank)
                      </span>
                      <p className="font-extrabold text-sm text-slate-100">
                        Số tài khoản: <span className="text-amber-400">{BANK_INFO.accountNo}</span>
                      </p>
                      <p className="text-slate-300">
                        Chủ tài khoản: <b>{BANK_INFO.accountName}</b> • Ngân hàng: <b>{BANK_INFO.bankName}</b>
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Số tiền: <b className="text-white font-bold">{finalAmount.toLocaleString('vi-VN')} đ</b> | ND: TT {invoicePreview.order.orderCode}
                      </p>
                    </div>

                    <div className="p-2 bg-white rounded-2xl shadow-lg shrink-0">
                      <img
                        src={`https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-compact2.png?amount=${finalAmount}&addInfo=TT%20${invoicePreview.order.orderCode}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`}
                        alt="VietQR MB Bank"
                        className="w-32 h-32 object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Nút hành động chính theo Button Hierarchy */}
                <button
                  disabled={isProcessing}
                  onClick={handleSettle}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {isProcessing ? 'ĐANG XỬ LÝ THANH TOÁN...' : 'XÁC NHẬN ĐÃ THU TIỀN & GIẢI PHÓNG BÀN'}
                </button>
              </div>
            ) : (
              <div className="p-20 bg-white/90 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs shadow-sm">
                Chọn một bàn bên trái để xem chi tiết hóa đơn và quét mã thanh toán MB Bank.
              </div>
            )}
          </div>
        </div>
      ) : activeSubTab === 'history' ? (
        /* TAB 2: LỊCH SỬ CHỨA TẤT CẢ HÓA ĐƠN */
        <div className="bg-white/95 rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Toàn Bộ Lịch Sử Hóa Đơn Thanh Toán</h3>
              <p className="text-xs text-slate-400">Xem lại tất cả hóa đơn đã thu tiền, in lại hóa đơn cho khách</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm mã hóa đơn (INV-...)"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchHistoryData()}
                  className="pl-9 pr-3 py-2 text-xs border rounded-xl w-56 focus:outline-none focus:border-teal-500"
                />
              </div>
              <button
                onClick={fetchHistoryData}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl active:scale-95 transition-all"
              >
                Tìm kiếm
              </button>
            </div>
          </div>

          {invoicesHistory.length === 0 ? (
            <p className="text-center text-slate-400 py-12 text-xs">Chưa có hóa đơn thanh toán nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-slate-500 font-bold">
                  <tr>
                    <th className="p-3">Mã Hóa Đơn</th>
                    <th className="p-3">Bàn Ăn</th>
                    <th className="p-3">Thời Gian Thanh Toán</th>
                    <th className="p-3">Hình Thức</th>
                    <th className="p-3 text-right">Tổng Tiền</th>
                    <th className="p-3 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoicesHistory.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-mono font-bold text-slate-900">{inv.invoiceCode}</td>
                      <td className="p-3 font-semibold text-slate-700">
                        {inv.tableId?.tableNumber || 'Bàn'} ({inv.tableId?.zone})
                      </td>
                      <td className="p-3 text-slate-500">
                        {new Date(inv.paidAt || inv.createdAt).toLocaleTimeString('vi-VN')}, {new Date(inv.paidAt || inv.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                          inv.paymentMethod === 'vietqr' ? 'bg-blue-100 text-blue-800' :
                          inv.paymentMethod === 'cash' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {inv.paymentMethod === 'vietqr' ? 'MB Bank' : inv.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3 text-right font-black text-emerald-600 text-sm">
                        {inv.finalAmount?.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setViewInvoiceModal({ open: true, invoice: inv })}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-xl text-[11px] font-bold text-slate-700 transition-all active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" /> Chi Tiết & In
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* TAB 3: QUẢN LÝ CA LÀM VIỆC & KÉT TIỀN */
        <div className="bg-white/95 rounded-3xl border border-slate-200 p-6 max-w-2xl mx-auto space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Quản Lý Ca Làm Việc & Két Tiền</h3>
              <p className="text-xs text-slate-400">Đối soát tiền mặt, tiền chuyển khoản MB Bank và bàn giao ca</p>
            </div>
          </div>

          {currentShift ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Thu ngân trực:</span>
                  <span className="font-bold text-slate-900">{currentShift.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Thời gian mở ca:</span>
                  <span>{new Date(currentShift.openingTime).toLocaleTimeString('vi-VN')}, {new Date(currentShift.openingTime).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Tiền lẻ ban đầu:</span>
                  <span className="font-bold">{currentShift.openingCash?.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Tổng thu tiền mặt trong ca:</span>
                  <span className="font-bold text-emerald-600">+{currentShift.totalCashCollected?.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Tổng thu MB Bank (VietQR):</span>
                  <span className="font-bold text-blue-600">+{currentShift.totalTransferCollected?.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-sm font-black text-slate-900">
                  <span>Tiền mặt dự kiến có trong két:</span>
                  <span className="text-rose-600">{currentShift.expectedCashInDrawer?.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              <form onSubmit={handleCloseShift} className="space-y-3 pt-2">
                <h4 className="font-bold text-xs text-slate-800">Kết Ca & Bàn Giao Két:</h4>
                <div className="text-xs space-y-1">
                  <label className="font-semibold text-slate-600">Số tiền mặt thực tế đếm được trong két *</label>
                  <input
                    required
                    type="number"
                    value={closingCashInput}
                    onChange={(e) => setClosingCashInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border rounded-xl font-bold text-sm"
                  />
                </div>

                <div className="text-xs space-y-1">
                  <label className="font-semibold text-slate-600">Ghi chú bàn giao ca</label>
                  <input
                    type="text"
                    placeholder="Bàn giao ca tối, két đủ tiền..."
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Lock className="w-4 h-4" /> KẾT THÚC CA & BÀN GIAO KÉT
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleOpenShift} className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800">
                Chưa có ca làm việc nào đang mở. Vui lòng nhập số tiền lẻ đầu ca để bắt đầu.
              </div>

              <div className="text-xs space-y-1">
                <label className="font-bold text-slate-700">Tiền lẻ ban đầu có trong két (VNĐ) *</label>
                <input
                  type="number"
                  value={openingCashInput}
                  onChange={(e) => setOpeningCashInput(Number(e.target.value))}
                  className="w-full px-4 py-3 border rounded-2xl font-black text-base text-emerald-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
              >
                <Unlock className="w-4 h-4" /> BẮT ĐẦU MỞ CA THU NGÂN
              </button>
            </form>
          )}
        </div>
      )}

      {/* MODAL XEM CHI TIẾT & IN LẠI HÓA ĐƠN TRONG LỊCH SỬ */}
      {viewInvoiceModal.open && viewInvoiceModal.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                Hóa Đơn #{viewInvoiceModal.invoice.invoiceCode}
              </h3>
              <button
                onClick={() => setViewInvoiceModal({ open: false, invoice: null })}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Bàn:</span>
                <span className="font-bold text-slate-900">{viewInvoiceModal.invoice.tableId?.tableNumber || 'Bàn'}</span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian thanh toán:</span>
                <span>{new Date(viewInvoiceModal.invoice.paidAt || viewInvoiceModal.invoice.createdAt).toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Phương thức:</span>
                <span className="font-bold uppercase">{viewInvoiceModal.invoice.paymentMethod === 'vietqr' ? 'MB Bank' : viewInvoiceModal.invoice.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-black text-slate-900">
                <span>Thành tiền:</span>
                <span className="text-emerald-600">{viewInvoiceModal.invoice.finalAmount?.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Printer className="w-4 h-4" /> In Hóa Đơn ({printPaperWidth.toUpperCase()})
              </button>
              <button
                onClick={() => setViewInvoiceModal({ open: false, invoice: null })}
                className="px-4 py-3 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BẢN IN HÓA ĐƠN NHIỆT K80 (80MM) / K58 (58MM) CHUẨN ĐẶC TẢ NHÀ HÀNG NGOÀI ĐỜI */}
      <div
        id="printable-receipt"
        className={`hidden print:block text-slate-900 font-mono text-xs leading-tight ${
          printPaperWidth === 'k58' ? 'print-k58' : 'print-k80'
        }`}
      >
        <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-1">
          <h2 className="font-black text-sm uppercase tracking-tight">HỆ THỐNG QUẢN LÝ NHÀ HÀNG ĐÁM MÂY - CLOUD POS & KDS</h2>
          <p className="text-[10px] font-bold">50 Cát Bi, Hải An, Hải Phòng</p>
          <p className="text-[10px]">Hotline: 0963.769.034 • Wifi: CloudRestaurant (Pass: 88888888)</p>
          <p className="font-black text-xs uppercase pt-1">PHIẾU THANH TOÁN TẠM TÍNH</p>
        </div>

        <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
          <div className="flex justify-between">
            <span>Bàn: <b>{selectedTable?.tableNumber || viewInvoiceModal.invoice?.tableId?.tableNumber || 'Bàn'}</b></span>
            <span>Số khách: <b>{selectedTable?.guestCount || 2}</b></span>
          </div>
          <div className="flex justify-between">
            <span>Mã HĐ: <b>{invoicePreview?.order?.orderCode || viewInvoiceModal.invoice?.invoiceCode || 'INV-001'}</b></span>
            <span>Thu ngân: <b>Trần Thu Ngân</b></span>
          </div>
          <div className="flex justify-between">
            <span>Ngày in: {new Date().toLocaleTimeString('vi-VN')}, {new Date().toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        {/* Bảng danh sách món ăn */}
        <div className="py-2 border-b border-dashed border-slate-400 text-[10px]">
          <div className="flex justify-between font-bold border-b pb-1 mb-1">
            <span className="w-1/2">Tên món</span>
            <span className="w-1/6 text-center">SL</span>
            <span className="w-1/3 text-right">T.Tiền</span>
          </div>
          {(invoicePreview?.order?.items || viewInvoiceModal.invoice?.orderId?.items || []).filter(i => i.status !== 'cancelled').map((it, idx) => (
            <div key={idx} className="flex justify-between py-0.5">
              <span className="w-1/2 truncate">{it.name}</span>
              <span className="w-1/6 text-center">{it.quantity}</span>
              <span className="w-1/3 text-right font-bold">{(it.price * it.quantity).toLocaleString('vi-VN')} đ</span>
            </div>
          ))}
        </div>

        {/* Tổng tiền */}
        <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-1">
          <div className="flex justify-between">
            <span>Tiền món ăn:</span>
            <span>{(subtotal || viewInvoiceModal.invoice?.subtotal || 0).toLocaleString('vi-VN')} đ</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between">
              <span>Giảm giá / Voucher:</span>
              <span>-{(discountAmount || viewInvoiceModal.invoice?.discountAmount || 0).toLocaleString('vi-VN')} đ</span>
            </div>
          )}
          {surchargeAmount > 0 && (
            <div className="flex justify-between">
              <span>Phụ thu:</span>
              <span>+{(surchargeAmount || viewInvoiceModal.invoice?.surcharge?.amount || 0).toLocaleString('vi-VN')} đ</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Thuế VAT ({vatPercent}%):</span>
            <span>+{(vatAmount || viewInvoiceModal.invoice?.vatAmount || 0).toLocaleString('vi-VN')} đ</span>
          </div>
          <div className="flex justify-between text-xs font-black pt-1 border-t">
            <span>TỔNG CỘNG:</span>
            <span>{(finalAmount || viewInvoiceModal.invoice?.finalAmount || 0).toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        {/* Quét QR MB Bank tại chân bill */}
        <div className="text-center pt-2 space-y-1">
          <p className="text-[10px] font-bold">QUÉT MÃ MB BANK ĐỂ THANH TOÁN</p>
          <img
            src={`https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-compact2.png?amount=${finalAmount || viewInvoiceModal.invoice?.finalAmount || 0}&addInfo=TT%20${invoicePreview?.order?.orderCode || 'BILL'}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`}
            alt="VietQR MB Bank"
            className="w-28 h-28 mx-auto"
          />
          <p className="text-[9px] font-semibold">STK: {BANK_INFO.accountNo} - {BANK_INFO.accountName}</p>
          <p className="text-[9px] italic pt-1">Cảm ơn Quý khách & Hẹn gặp lại!</p>
        </div>
      </div>
    </div>
  );
}
