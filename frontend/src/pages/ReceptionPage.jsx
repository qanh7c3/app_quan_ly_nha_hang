import React, { useState, useEffect } from 'react';
import { UserCheck, Calendar, Clock, Plus, Users, Phone, CheckCircle, AlertCircle, Sparkles, Filter, ShieldCheck } from 'lucide-react';
import { getReservations, createReservation, checkInReservation, getWaitlist, addToWaitlist, seatWaitlistCustomer, getTables } from '../services/api';
import socket from '../services/socket';

export default function ReceptionPage() {
  const [reservations, setReservations] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form đặt bàn trước
  const [showResModal, setShowResModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [guestCount, setGuestCount] = useState(4);
  const [reservationTime, setReservationTime] = useState('');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form thêm khách chờ (Waitlist)
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [wlName, setWlName] = useState('');
  const [wlPhone, setWlPhone] = useState('');
  const [wlGuests, setWlGuests] = useState(2);
  const [wlZone, setWlZone] = useState('Bất kỳ');

  // Lấy thời điểm hiện tại định dạng YYYY-MM-DDTHH:mm để khóa ngày giờ quá khứ
  const getCurrentMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resRes, wlRes, tblRes] = await Promise.all([
        getReservations(),
        getWaitlist(),
        getTables()
      ]);
      if (resRes.data.success) setReservations(resRes.data.data);
      if (wlRes.data.success) setWaitlist(wlRes.data.data);
      if (tblRes.data.success) setTables(tblRes.data.data);
    } catch (err) {
      console.error('Lỗi tải dữ liệu lễ tân:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    socket.on('reservation:updated', () => fetchData());
    socket.on('waitlist:updated', () => fetchData());
    socket.on('table:status_changed', () => fetchData());
    socket.on('restaurant:reset_all', () => fetchData());

    return () => {
      socket.off('reservation:updated');
      socket.off('waitlist:updated');
      socket.off('table:status_changed');
      socket.off('restaurant:reset_all');
    };
  }, []);

  // Chỉ lấy danh sách các bàn ĐANG TRỐNG để gán đặt trước (không được trùng với bàn đã có người hoặc đã đặt)
  const availableEmptyTables = tables.filter(t => t.status === 'empty');

  // Xử lý tạo đặt bàn trước
  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Kiểm tra thời gian không được ở quá khứ
    const selectedDate = new Date(reservationTime);
    const now = new Date();
    if (selectedDate < new Date(now.getTime() - 2 * 60000)) {
      setErrorMessage('Thời gian đặt bàn không được chọn ở quá khứ! Vui lòng chọn thời gian từ hiện tại trở đi.');
      return;
    }

    try {
      const res = await createReservation({
        customerName,
        phone,
        guestCount: Number(guestCount),
        reservationTime: selectedDate,
        tableId: selectedTableId || null,
        specialRequests: specialRequests.trim() // Cho phép để trống
      });

      if (res.data.success) {
        setShowResModal(false);
        setCustomerName('');
        setPhone('');
        setSpecialRequests('');
        setSelectedTableId('');
        setReservationTime('');
        fetchData();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message);
    }
  };

  // Đón khách vào bàn (Check-in)
  const handleCheckIn = async (resId, tableId) => {
    try {
      await checkInReservation(resId, { targetTableId: tableId });
      alert('Đã đón khách vào bàn thành công! Trạng thái bàn đã chuyển sang Đang Phục Vụ.');
      fetchData();
    } catch (err) {
      alert('Lỗi đón khách: ' + (err.response?.data?.message || err.message));
    }
  };

  // Thêm vào danh sách chờ
  const handleAddToWaitlist = async (e) => {
    e.preventDefault();
    try {
      await addToWaitlist({
        customerName: wlName,
        phone: wlPhone,
        guestCount: Number(wlGuests),
        preferredZone: wlZone
      });
      setShowWaitlistModal(false);
      setWlName('');
      setWlPhone('');
      fetchData();
    } catch (err) {
      alert('Lỗi thêm danh sách chờ: ' + err.message);
    }
  };

  // Xếp bàn cho khách đang chờ (chỉ xếp vào bàn trống)
  const handleSeatWaitlist = async (wlId, tableId) => {
    try {
      await seatWaitlistCustomer(wlId, { tableId });
      alert('Đã xếp bàn thành công cho khách chờ!');
      fetchData();
    } catch (err) {
      alert('Lỗi xếp bàn: ' + (err.response?.data?.message || err.message));
    }
  };

  const emptyCount = tables.filter(t => t.status === 'empty').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const reservedCount = tables.filter(t => t.status === 'reserved').length;
  const cleaningCount = tables.filter(t => t.status === 'cleaning').length;

  return (
    <div className="space-y-6">
      {/* Header Lễ Tân Hiện Đại */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-purple-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">Bộ Phận Lễ Tân & Điều Phối Chỗ Ngồi</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  Hostess Desk
                </span>
              </div>
              <p className="text-xs text-purple-200/90 mt-1">
                Tiếp nhận Đặt bàn trước (Không trùng lặp) • Quản lý Danh sách chờ • Đón khách & Xếp bàn
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setErrorMessage('');
                setShowResModal(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-purple-500/25 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Tiếp Nhận Đặt Bàn
            </button>
            <button
              onClick={() => setShowWaitlistModal(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-2 border border-white/10 backdrop-blur-md transition-all active:scale-95"
            >
              <Clock className="w-4 h-4 text-purple-300" /> Ghi Khách Chờ (Waitlist)
            </button>
          </div>
        </div>
      </div>

      {/* Sơ đồ màu trạng thái bàn nhanh cho Lễ tân */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></div>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Bàn Đang Trống</span>
            <p className="text-lg font-black text-emerald-600">{emptyCount} bàn</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <div className="w-3.5 h-3.5 rounded-full bg-purple-500 ring-4 ring-purple-100"></div>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Đã Đặt Trước</span>
            <p className="text-lg font-black text-purple-600">{reservedCount} bàn</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <div className="w-3.5 h-3.5 rounded-full bg-rose-500 ring-4 ring-rose-100 animate-pulse"></div>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Đang Có Khách</span>
            <p className="text-lg font-black text-rose-600">{occupiedCount} bàn</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-amber-100"></div>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Chờ Dọn Bàn</span>
            <p className="text-lg font-black text-amber-600">{cleaningCount} bàn</p>
          </div>
        </div>
      </div>

      {/* 2 Cột chính: Trái = Danh sách Đặt bàn trước, Phải = Danh sách chờ (Waitlist) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột 1 (7 cột): Danh sách Đặt bàn trước */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Danh Sách Đặt Bàn Trước ({reservations.length})
                </h3>
                <p className="text-[11px] text-slate-400">Khóa bàn tự động, tránh xếp chồng bàn</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/60">
              {reservations.filter(r => r.status === 'confirmed').length} chờ đến
            </span>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 py-8 text-center">Đang tải lịch đặt bàn...</p>
          ) : reservations.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-1" />
              Chưa có lịch đặt bàn nào hôm nay.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 space-y-2.5">
              {reservations.map((res) => {
                const isSeated = res.status === 'seated';
                const isCancelled = res.status === 'cancelled';

                return (
                  <div key={res._id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{res.customerName}</span>
                        <span className="text-[11px] text-purple-700 bg-purple-50 font-bold px-2 py-0.5 rounded-md border border-purple-200">
                          {res.guestCount} khách
                        </span>
                        {isSeated && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                            Đã vào bàn
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {res.phone}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Clock className="w-3 h-3 text-purple-500" />
                          {new Date(res.reservationTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, {new Date(res.reservationTime).toLocaleDateString('vi-VN')}
                        </span>
                        {res.tableId ? (
                          <span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
                            Bàn: {res.tableId.tableNumber} ({res.tableId.zone})
                          </span>
                        ) : (
                          <span className="text-amber-600 text-[11px] font-medium">Chưa gán bàn</span>
                        )}
                      </div>

                      {res.specialRequests && (
                        <p className="text-[11px] text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md inline-block font-medium">
                          📌 Yêu cầu: {res.specialRequests}
                        </p>
                      )}
                    </div>

                    {!isSeated && !isCancelled && (
                      <div className="shrink-0 flex items-center gap-2">
                        {res.tableId ? (
                          <button
                            onClick={() => handleCheckIn(res._id, res.tableId._id)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Khách Đến & Xếp Bàn
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chọn bàn khi khách đến</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cột 2 (5 cột): Danh sách chờ (Waitlist) */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Khách Chờ Bàn ({waitlist.length})
                </h3>
                <p className="text-[11px] text-slate-400">Điều phối khi có bàn dọn xong</p>
              </div>
            </div>
            <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg">
              Ưu tiên theo thứ tự
            </span>
          </div>

          {waitlist.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-1" />
              Hiện không có khách nào đang chờ bàn.
            </div>
          ) : (
            <div className="space-y-3">
              {waitlist.map((item, idx) => (
                <div key={item._id} className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2.5 hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[11px] font-extrabold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">{item.customerName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        SĐT: {item.phone} • <b>{item.guestCount} người</b> • Thích: {item.preferredZone}
                      </p>
                    </div>

                    <span className="text-[10px] text-amber-700 bg-amber-100 font-bold px-2 py-0.5 rounded-full">
                      Đang đợi
                    </span>
                  </div>

                  {/* Chọn bàn trống để xếp khách */}
                  {availableEmptyTables.length > 0 ? (
                    <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                      <span className="text-[11px] text-slate-600 font-medium shrink-0">Xếp vào bàn:</span>
                      <select
                        onChange={(e) => {
                          if (e.target.value) handleSeatWaitlist(item._id, e.target.value);
                        }}
                        defaultValue=""
                        className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-emerald-700 w-full focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="" disabled>-- Chọn bàn đang trống --</option>
                        {availableEmptyTables.map(t => (
                          <option key={t._id} value={t._id}>
                            {t.tableNumber} ({t.zone} - chứa {t.capacity} người)
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-600 italic pt-1 border-t border-slate-200">
                      Hiện chưa có bàn trống phù hợp, vui lòng chờ dọn bàn.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Tiếp nhận Đặt bàn trước */}
      {showResModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleCreateReservation} className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Tiếp Nhận Đặt Bàn Trước</h3>
                  <p className="text-xs text-slate-400">Kiểm tra không trùng bàn & thời gian tương lai</p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên khách hàng *</label>
                <input
                  required
                  type="text"
                  placeholder="Ví dụ: Anh Cao Quốc Anh"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại *</label>
                <input
                  required
                  type="tel"
                  placeholder="0963769034"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số lượng khách *</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Thời gian đến * (Từ hiện tại trở đi)</label>
                <input
                  required
                  type="datetime-local"
                  min={getCurrentMinDateTime()}
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Chỉ hiển thị các bàn TRỐNG để chọn, không cho phép chọn bàn đã có người hoặc đã đặt */}
            <div className="text-xs space-y-1">
              <label className="font-bold text-slate-700 block">
                Gán trước bàn dự kiến <span className="text-slate-400 font-normal">(Chỉ hiện bàn trống)</span>
              </label>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold bg-white"
              >
                <option value="">-- Chưa gán bàn (Đón khách xếp sau) --</option>
                {availableEmptyTables.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.tableNumber} - {t.zone} (Sức chứa: {t.capacity} khách)
                  </option>
                ))}
              </select>
              {availableEmptyTables.length === 0 && (
                <p className="text-[11px] text-rose-500 italic mt-0.5">
                  ⚠️ Hiện tại không còn bàn trống nào. Bạn có thể lưu đặt bàn và xếp sau khi có bàn trả.
                </p>
              )}
            </div>

            {/* Yêu cầu đặc biệt: CÓ THỂ BỎ TRỐNG */}
            <div className="text-xs space-y-1">
              <label className="font-bold text-slate-700 block">
                Yêu cầu đặc biệt <span className="text-slate-400 font-normal">(Không bắt buộc - có thể bỏ trống)</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Cần ghế trẻ em, hoa tươi trang trí tiệc sinh nhật..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowResModal(false)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/25"
              >
                Xác Nhận Lưu Đặt Bàn
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Thêm vào Danh Sách Chờ (Waitlist) */}
      {showWaitlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleAddToWaitlist} className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900">Ghi Nhận Khách Đang Chờ Bàn</h3>

            <div className="text-xs space-y-1">
              <label className="font-bold text-slate-700 block">Tên khách hàng *</label>
              <input
                required
                type="text"
                placeholder="Ví dụ: Chị Lan"
                value={wlName}
                onChange={(e) => setWlName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại *</label>
                <input
                  required
                  type="tel"
                  placeholder="0912..."
                  value={wlPhone}
                  onChange={(e) => setWlPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số lượng người</label>
                <input
                  type="number"
                  min="1"
                  value={wlGuests}
                  onChange={(e) => setWlGuests(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="text-xs space-y-1">
              <label className="font-bold text-slate-700 block">Khu vực mong muốn</label>
              <select
                value={wlZone}
                onChange={(e) => setWlZone(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-semibold bg-white"
              >
                <option value="Bất kỳ">Bất kỳ khu vực nào có bàn trước</option>
                <option value="Tầng 1 (Trong nhà)">Tầng 1 (Trong nhà)</option>
                <option value="Tầng 2 (Phòng Lạnh)">Tầng 2 (Phòng Lạnh)</option>
                <option value="Sân Vườn (Ngoài trời)">Sân Vườn (Ngoài trời)</option>
                <option value="Phòng VIP">Phòng VIP</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowWaitlistModal(false)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25"
              >
                Thêm Vào Danh Sách Chờ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
