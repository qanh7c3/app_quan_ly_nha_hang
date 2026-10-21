import React, { useState, useEffect } from 'react';
import { UserCheck, Calendar, Clock, Plus, Users, Phone, CheckCircle, AlertCircle, HeartHandshake } from 'lucide-react';
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

  // Form thêm khách chờ (Waitlist)
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [wlName, setWlName] = useState('');
  const [wlPhone, setWlPhone] = useState('');
  const [wlGuests, setWlGuests] = useState(2);
  const [wlZone, setWlZone] = useState('Bất kỳ');

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

    return () => {
      socket.off('reservation:updated');
      socket.off('waitlist:updated');
      socket.off('table:status_changed');
    };
  }, []);

  // Tạo đặt bàn trước
  const handleCreateReservation = async (e) => {
    e.preventDefault();
    try {
      await createReservation({
        customerName,
        phone,
        guestCount: Number(guestCount),
        reservationTime: new Date(reservationTime),
        tableId: selectedTableId || null,
        specialRequests
      });
      setShowResModal(false);
      setCustomerName('');
      setPhone('');
      setSpecialRequests('');
      fetchData();
    } catch (err) {
      alert('Lỗi tạo đặt bàn: ' + err.message);
    }
  };

  // Đón khách vào bàn (Check-in)
  const handleCheckIn = async (resId, tableId) => {
    try {
      await checkInReservation(resId, { targetTableId: tableId });
      alert('Khách đã được xếp vào bàn thành công!');
      fetchData();
    } catch (err) {
      alert('Lỗi xếp bàn: ' + err.message);
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

  // Xếp bàn cho khách đang chờ
  const handleSeatWaitlist = async (wlId, tableId) => {
    try {
      await seatWaitlistCustomer(wlId, { tableId });
      alert('Đã xếp bàn thành công cho khách chờ!');
      fetchData();
    } catch (err) {
      alert('Lỗi xếp bàn: ' + err.message);
    }
  };

  const emptyTables = tables.filter(t => t.status === 'empty');

  return (
    <div className="space-y-6">
      {/* Header Lễ Tân */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-400/30">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Bộ Phận Lễ Tân & Điều Phối Chỗ Ngồi (Hostess)</h2>
            <p className="text-xs text-purple-200">
              Quản lý Đặt bàn trước (Reservation) | Danh sách chờ (Waitlist) | Đón & Xếp bàn trực quan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResModal(true)}
            className="px-3.5 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Đặt Bàn Trước
          </button>
          <button
            onClick={() => setShowWaitlistModal(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Clock className="w-4 h-4" /> Ghi Khách Chờ
          </button>
        </div>
      </div>

      {/* Sơ đồ màu trạng thái bàn nhanh cho Lễ tân */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
          <div>
            <span className="text-xs font-bold text-slate-700">Bàn Trống</span>
            <p className="text-sm font-extrabold text-emerald-600">{emptyTables.length} bàn</p>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-purple-500"></div>
          <div>
            <span className="text-xs font-bold text-slate-700">Đã Đặt Trước</span>
            <p className="text-sm font-extrabold text-purple-600">
              {tables.filter(t => t.status === 'reserved').length} bàn
            </p>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-rose-500"></div>
          <div>
            <span className="text-xs font-bold text-slate-700">Đang Có Khách</span>
            <p className="text-sm font-extrabold text-rose-600">
              {tables.filter(t => t.status === 'occupied').length} bàn
            </p>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-amber-500"></div>
          <div>
            <span className="text-xs font-bold text-slate-700">Chờ Dọn Dẹp</span>
            <p className="text-sm font-extrabold text-amber-600">
              {tables.filter(t => t.status === 'cleaning').length} bàn
            </p>
          </div>
        </div>
      </div>

      {/* 2 Cột chính: Trái = Danh sách Đặt bàn trước, Phải = Danh sách chờ (Waitlist) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột 1 (7 cột): Danh sách Đặt bàn trước */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-sm text-slate-800">
                Danh Sách Đặt Bàn Trước ({reservations.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">Tự động khóa bàn trước giờ đến</span>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 py-6 text-center">Đang tải lịch đặt bàn...</p>
          ) : reservations.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Chưa có lịch đặt bàn nào hôm nay.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 space-y-2">
              {reservations.map((res) => {
                const isSeated = res.status === 'seated';
                return (
                  <div key={res._id} className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{res.customerName}</span>
                        <span className="text-xs text-purple-700 bg-purple-50 font-bold px-2 py-0.5 rounded-md border border-purple-200">
                          {res.guestCount} khách
                        </span>
                        {isSeated && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            Đã vào bàn
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {res.phone}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Clock className="w-3 h-3 text-purple-500" />
                          {new Date(res.reservationTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, {new Date(res.reservationTime).toLocaleDateString('vi-VN')}
                        </span>
                        {res.tableId && (
                          <span className="text-purple-600 font-bold">
                            Bàn: {res.tableId.tableNumber}
                          </span>
                        )}
                      </div>

                      {res.specialRequests && (
                        <p className="text-[11px] text-rose-600 italic">
                          ⚠️ Yêu cầu: {res.specialRequests}
                        </p>
                      )}
                    </div>

                    {!isSeated && (
                      <div className="shrink-0 flex items-center gap-2">
                        {res.tableId ? (
                          <button
                            onClick={() => handleCheckIn(res._id, res.tableId._id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Khách Đến & Xếp Bàn
                          </button>
                        ) : (
                          <span className="text-xs text-amber-600 italic">Chưa gán bàn</span>
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
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-800">
                Danh Sách Khách Chờ ({waitlist.length})
              </h3>
            </div>
            <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
              Xếp khi có bàn trống
            </span>
          </div>

          {waitlist.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Hiện không có khách nào đang chờ bàn.
            </div>
          ) : (
            <div className="space-y-3">
              {waitlist.map((item, idx) => (
                <div key={item._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900">
                        #{idx + 1} {item.customerName}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {item.phone} | {item.guestCount} người | Khu vực: {item.preferredZone}
                      </p>
                    </div>

                    <span className="text-[10px] text-amber-700 bg-amber-100 font-bold px-2 py-0.5 rounded">
                      Đang đợi
                    </span>
                  </div>

                  {emptyTables.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                      <span className="text-[11px] text-slate-600 font-medium">Xếp vào:</span>
                      <select
                        onChange={(e) => {
                          if (e.target.value) handleSeatWaitlist(item._id, e.target.value);
                        }}
                        defaultValue=""
                        className="text-xs bg-white border border-slate-300 rounded px-2 py-1 font-bold text-emerald-700"
                      >
                        <option value="" disabled>-- Chọn bàn trống --</option>
                        {emptyTables.map(t => (
                          <option key={t._id} value={t._id}>
                            {t.tableNumber} ({t.zone} - {t.capacity} người)
                          </option>
                        ))}
                      </select>
                    </div>
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
          <form onSubmit={handleCreateReservation} className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Tiếp Nhận Đặt Bàn Trước</h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên khách hàng *</label>
                <input
                  required
                  type="text"
                  placeholder="Ví dụ: Anh Hoàng"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại *</label>
                <input
                  required
                  type="tel"
                  placeholder="0987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số lượng khách *</label>
                <input
                  type="number"
                  min="1"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Giờ khách đến *</label>
                <input
                  required
                  type="datetime-local"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="font-bold text-slate-700 block mb-1">Gán trước bàn dự kiến</label>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              >
                <option value="">-- Chưa gán bàn (Xếp sau) --</option>
                {tables.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.tableNumber} - {t.zone} (Sức chứa {t.capacity} người) - {t.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs">
              <label className="font-bold text-slate-700 block mb-1">Yêu cầu đặc biệt</label>
              <input
                type="text"
                placeholder="Ghế trẻ em, phòng VIP, hoa sinh nhật, dị ứng..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowResModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
              >
                Lưu Đặt Bàn
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Thêm vào Danh Sách Chờ (Waitlist) */}
      {showWaitlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleAddToWaitlist} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Ghi Nhận Khách Đang Chờ Bàn</h3>

            <div className="text-xs space-y-1">
              <label className="font-bold text-slate-700 block">Tên khách hàng</label>
              <input
                required
                type="text"
                placeholder="Ví dụ: Chị Lan"
                value={wlName}
                onChange={(e) => setWlName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại</label>
                <input
                  required
                  type="tel"
                  placeholder="0912..."
                  value={wlPhone}
                  onChange={(e) => setWlPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số lượng người</label>
                <input
                  type="number"
                  min="1"
                  value={wlGuests}
                  onChange={(e) => setWlGuests(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowWaitlistModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
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
