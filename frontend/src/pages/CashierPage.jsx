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
  Split
} from 'lucide-react';
import {
  getTables,
  getInvoicePreview,
  settlePayment,
  getCurrentShift,
  openShift,
  closeShift
} from '../services/api';
import socket from '../services/socket';

export default function CashierPage() {
  const [activeSubTab, setActiveSubTab] = useState('billing'); // 'billing' hoặc 'shift'
  const [occupiedTables, setOccupiedTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [invoicePreview, setInvoicePreview] = useState(null);

  // Khuyến mãi & Phụ thu
  const [discountPercent, setDiscountPercent] = useState(0);
  const [memberTier, setMemberTier] = useState('none');
  const [vatPercent, setVatPercent] = useState(8);
  const [surchargeAmount, setSurchargeAmount] = useState(0);
  const [surchargeReason, setSurchargeReason] = useState('');

  // Hình thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState('vietqr'); // 'vietqr', 'cash', 'card', 'split'
  const [splitCash, setSplitCash] = useState(0);
  const [splitTransfer, setSplitTransfer] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // Quản lý ca làm việc (Shift)
  const [currentShift, setCurrentShift] = useState(null);
  const [openingCashInput, setOpeningCashInput] = useState(1000000);
  const [closingCashInput, setClosingCashInput] = useState(0);
  const [closingNotes, setClosingNotes] = useState('');

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

  useEffect(() => {
    fetchBillingData();
    fetchShiftData();

    const handleUpdate = () => {
      fetchBillingData();
      fetchShiftData();
    };

    socket.on('table:status_changed', handleUpdate);
    socket.on('order:created', handleUpdate);

    return () => {
      socket.off('table:status_changed', handleUpdate);
      socket.off('order:created');
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
    else if (memberTier === 'vip') memberDiscountPercent = 15;

    const voucherDiscount = Math.round(subtotal * (discountPercent / 100));
    const memberDiscount = Math.round(subtotal * (memberDiscountPercent / 100));
    const totalDiscount = voucherDiscount + memberDiscount;

    const taxable = Math.max(0, subtotal - totalDiscount + Number(surchargeAmount));
    const vat = Math.round(taxable * (vatPercent / 100));
    const final = taxable + vat;

    return { subtotal, discountAmount: totalDiscount, vatAmount: vat, finalAmount: final };
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
        discountAmount,
        memberTier,
        vatAmount,
        surcharge: surchargeAmount,
        surchargeReason,
        finalAmount,
        paymentMethod,
        splitDetails: paymentMethod === 'split' ? { cashAmount: Number(splitCash), transferAmount: Number(splitTransfer) } : {}
      });

      if (res.data.success) {
        setPaymentSuccessData(res.data.data);
        setSelectedTable(null);
        setInvoicePreview(null);
        fetchBillingData();
        fetchShiftData();
      }
    } catch (err) {
      alert('Lỗi thanh toán: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  // Mở ca
  const handleOpenShift = async (e) => {
    e.preventDefault();
    try {
      await openShift({ openingCash: openingCashInput, cashierName: 'Trần Thu Ngân' });
      alert('Mở ca thành công!');
      fetchShiftData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Chốt ca
  const handleCloseShift = async (e) => {
    e.preventDefault();
    try {
      await closeShift({ actualCashInDrawer: closingCashInput, notes: closingNotes });
      alert('Chốt ca và bàn giao két tiền thành công!');
      fetchShiftData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Thu Ngân */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Bộ Phận Thu Ngân & Quản Lý Két Tiền (Cashier)</h2>
            <p className="text-xs text-slate-400">
              Thanh toán VietQR động | Hạng thành viên | Phụ thu phòng VIP | Quản lý mở & chốt ca
            </p>
          </div>
        </div>

        {/* Nút chuyển đổi Tab Thu ngân vs Ca làm việc */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('billing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'billing' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Thanh Toán Hóa Đơn ({occupiedTables.length})
          </button>
          <button
            onClick={() => setActiveSubTab('shift')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'shift' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Quản Lý Ca & Két Tiền
          </button>
        </div>
      </div>

      {paymentSuccessData && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">
                Thanh toán thành công hóa đơn #{paymentSuccessData.invoiceCode}!
              </p>
              <p className="text-xs text-emerald-600">
                Bàn đã giải phóng và kho nguyên vật liệu đã được tự động trừ theo công thức món.
              </p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> In Hóa Đơn
          </button>
        </div>
      )}

      {activeSubTab === 'billing' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Danh sách bàn đang ăn */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-bold text-sm text-slate-700">Chọn bàn thanh toán</h3>
            {occupiedTables.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border text-center text-slate-400 text-xs">
                Hiện không có bàn nào đang chờ thanh toán.
              </div>
            ) : (
              occupiedTables.map((t) => (
                <div
                  key={t._id}
                  onClick={() => handleSelectTable(t)}
                  className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between ${
                    selectedTable?._id === t._id ? 'border-emerald-500 bg-emerald-50/30' : 'bg-white'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{t.tableNumber}</h4>
                    <span className="text-xs text-slate-500">{t.zone} - {t.guestCount || 2} khách</span>
                  </div>
                  <span className="font-extrabold text-xs text-emerald-600">
                    {t.currentOrderId?.totalAmount?.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Cột phải: Hóa đơn chi tiết */}
          <div className="lg:col-span-8">
            {selectedTable && invoicePreview?.order ? (
              <div className="bg-white rounded-2xl border p-6 shadow-xs space-y-5">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Thanh Toán: {selectedTable.tableNumber} ({selectedTable.zone})
                  </h3>
                  <button onClick={() => window.print()} className="px-3 py-1.5 border rounded-lg text-xs font-semibold">
                    <Printer className="w-3.5 h-3.5 inline mr-1" /> In Tạm Tính
                  </button>
                </div>

                {/* Danh sách món */}
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto text-xs">
                  {invoicePreview.order.items?.filter(i => i.status !== 'cancelled').map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between">
                      <span>{item.name} x {item.quantity}</span>
                      <span className="font-bold">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
                    </div>
                  ))}
                </div>

                {/* Khuyến mãi, Thành viên & Phụ thu */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl text-xs">
                  <div>
                    <label className="font-bold block mb-1">Hạng thành viên</label>
                    <select
                      value={memberTier}
                      onChange={(e) => setMemberTier(e.target.value)}
                      className="w-full p-1.5 bg-white border rounded-lg font-bold text-indigo-700"
                    >
                      <option value="none">Khách Thường (0%)</option>
                      <option value="silver">Bạc (Giảm 5%)</option>
                      <option value="gold">Vàng (Giảm 10%)</option>
                      <option value="vip">VIP Khách Quen (Giảm 15%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Voucher giảm giá (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Phụ thu (Phòng VIP/Rượu)</label>
                    <input
                      type="number"
                      placeholder="0 đ"
                      value={surchargeAmount}
                      onChange={(e) => setSurchargeAmount(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border rounded-lg font-bold"
                    />
                  </div>
                </div>

                {/* Tổng tiền */}
                <div className="space-y-1 text-xs text-slate-600 border-t pt-3">
                  <div className="flex justify-between">
                    <span>Tiền món ăn:</span>
                    <span>{subtotal.toLocaleString('vi-VN')} đ</span>
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
                  <div className="flex justify-between text-lg font-extrabold text-slate-900 border-t pt-2">
                    <span>Khách Cần Thanh Toán:</span>
                    <span className="text-emerald-600">{finalAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

                {/* Chọn phương thức */}
                <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                  {[
                    { id: 'vietqr', label: 'Mã VietQR', icon: QrCode },
                    { id: 'cash', label: 'Tiền mặt', icon: Banknote },
                    { id: 'card', label: 'Thẻ POS', icon: CreditCard },
                    { id: 'split', label: 'Kết hợp', icon: Split }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                        paymentMethod === m.id ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'bg-slate-50'
                      }`}
                    >
                      <m.icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Mã QR VietQR động */}
                {(paymentMethod === 'vietqr' || paymentMethod === 'split') && (
                  <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-amber-400">MÃ VIETQR ĐỘNG TỰ ĐỘNG</span>
                      <p>Số tiền: <b>{finalAmount.toLocaleString('vi-VN')} đ</b></p>
                      <p className="text-slate-400">ND: TT {invoicePreview.order.orderCode}</p>
                    </div>
                    <img
                      src={`https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${finalAmount}&addInfo=TT%20${invoicePreview.order.orderCode}&accountName=NHA%20HANG%20AM%20THUC%20VIET`}
                      alt="VietQR"
                      className="w-28 h-28 bg-white p-1 rounded-lg"
                    />
                  </div>
                )}

                <button
                  disabled={isProcessing}
                  onClick={handleSettle}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl"
                >
                  XÁC NHẬN ĐÃ THU ĐỦ TIỀN & GIẢI PHÓNG BÀN
                </button>
              </div>
            ) : (
              <div className="p-16 bg-white rounded-2xl border text-center text-slate-400 text-xs">
                Chọn bàn bên trái để tiến hành thanh toán
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tab Quản lý Két Tiền & Chốt Ca */
        <div className="bg-white rounded-2xl border p-6 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Quản Lý Ca Làm Việc & Két Tiền</h3>
              <p className="text-xs text-slate-400">Đối soát tiền mặt, tiền chuyển khoản và bàn giao ca</p>
            </div>
          </div>

          {currentShift ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
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
                  <span className="font-semibold text-slate-600">Tổng thu VietQR / Chuyển khoản:</span>
                  <span className="font-bold text-blue-600">+{currentShift.totalTransferCollected?.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-sm font-extrabold text-slate-900">
                  <span>Tiền mặt dự kiến có trong két:</span>
                  <span className="text-rose-600">{currentShift.expectedCashInDrawer?.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              {/* Form chốt ca */}
              <form onSubmit={handleCloseShift} className="space-y-3 pt-2">
                <h4 className="font-bold text-xs text-slate-800">Kết Ca & Bàn Giao Két:</h4>
                <div className="text-xs space-y-1">
                  <label className="font-semibold text-slate-600">Số tiền mặt thực tế đếm được trong két *</label>
                  <input
                    required
                    type="number"
                    value={closingCashInput}
                    onChange={(e) => setClosingCashInput(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-sm"
                  />
                </div>

                <div className="text-xs space-y-1">
                  <label className="font-semibold text-slate-600">Ghi chú bàn giao ca</label>
                  <input
                    type="text"
                    placeholder="Bàn giao ca tối, két đủ tiền..."
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> KẾT THÚC CA & BÀN GIAO KÉT
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleOpenShift} className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                Chưa có ca làm việc nào đang mở. Vui lòng nhập số tiền lẻ đầu ca để bắt đầu.
              </div>

              <div className="text-xs space-y-1">
                <label className="font-bold text-slate-700">Tiền lẻ ban đầu có trong két (VNĐ) *</label>
                <input
                  type="number"
                  value={openingCashInput}
                  onChange={(e) => setOpeningCashInput(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-base text-emerald-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" /> BẮT ĐẦU MỞ CA THU NGÂN
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
