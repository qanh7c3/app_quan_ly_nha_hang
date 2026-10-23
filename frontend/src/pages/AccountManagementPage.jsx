import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Crown,
  CheckCircle2,
  Clock,
  Ban,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  Mail,
  KeyRound,
  Check,
  UserCheck,
  UtensilsCrossed,
  ChefHat,
  Receipt,
  Sparkles
} from 'lucide-react';
import { getAllAccounts, updateAccountStatus, deleteAccount } from '../services/api';
import {
  getStoredAccounts,
  updateLocalAccountStatus,
  deleteLocalAccount
} from '../services/authStorage';

const POSITION_LABELS = {
  owner: { label: 'Chủ Nhà Hàng', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Crown },
  manager: { label: 'Quản Lý', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Shield },
  reception: { label: 'Lễ Tân', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: UserCheck },
  waiter: { label: 'Phục Vụ', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: UtensilsCrossed },
  kitchen: { label: 'Đầu Bếp / Bar', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: ChefHat },
  cashier: { label: 'Thu Ngân', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Receipt }
};

export default function AccountManagementPage({ currentUser }) {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await getAllAccounts();
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setAccounts(res.data.data);
        return;
      }
    } catch (_) {}

    const localList = getStoredAccounts();
    setAccounts(localList);
    setLoading(false);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleApprove = async (acc) => {
    setActionMessage('');
    try {
      await updateAccountStatus(acc._id, { approvalStatus: 'approved', isActive: true });
    } catch (_) {}

    updateLocalAccountStatus(acc._id, { approvalStatus: 'approved', isActive: true });
    setActionMessage(`Đã phê duyệt thành công tài khoản: ${acc.name} (${acc.username})!`);
    loadAccounts();
  };

  const handleToggleActive = async (acc) => {
    setActionMessage('');
    const newStatus = !acc.isActive;
    try {
      await updateAccountStatus(acc._id, { isActive: newStatus });
    } catch (_) {}

    updateLocalAccountStatus(acc._id, { isActive: newStatus });
    setActionMessage(`Đã ${newStatus ? 'mở khóa' : 'tạm khóa'} tài khoản: ${acc.username}`);
    loadAccounts();
  };

  const handleDelete = async (acc) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${acc.name} (${acc.username})"?`)) {
      return;
    }

    try {
      await deleteAccount(acc._id);
    } catch (_) {}

    deleteLocalAccount(acc._id);
    setActionMessage(`Đã xóa vĩnh viễn tài khoản: ${acc.username}`);
    loadAccounts();
  };

  if (!currentUser || currentUser.accountType !== 'owner') {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-rose-200 shadow-xl max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl mx-auto flex items-center justify-center mb-4">
          <Ban className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">TRUY CẬP BỊ GIỚI HẠN</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Mục <span className="font-bold text-slate-900">6. Quản Lý Tài Khoản</span> chỉ dành riêng cho Chủ Nhà Hàng.
          Tài khoản nhân viên hoặc quản lý không có quyền truy cập khu vực này.
        </p>
      </div>
    );
  }

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      (acc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === 'all' || acc.position === positionFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && acc.approvalStatus === 'pending') ||
      (statusFilter === 'active' && acc.isActive && acc.approvalStatus === 'approved') ||
      (statusFilter === 'locked' && !acc.isActive);

    return matchesSearch && matchesPosition && matchesStatus;
  });

  const totalCount = accounts.length;
  const ownerCount = accounts.filter((a) => a.accountType === 'owner').length;
  const staffCount = accounts.filter((a) => a.accountType === 'staff').length;
  const pendingCount = accounts.filter((a) => a.approvalStatus === 'pending').length;

  return (
    <div className="space-y-6">
      
      <div className="bg-gradient-to-r from-[#0b1329] via-[#101b38] to-[#0b1329] rounded-3xl p-6 sm:p-8 text-white border border-amber-400/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>ĐẶC QUYỀN CHỦ NHÀ HÀNG (OWNER ONLY)</span>
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>PHÂN PHỐI EMAIL: qanh7c3@gmail.com</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              6. Quản Lý Tài Khoản & Phân Quyền Nhân Sự
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Hệ thống theo dõi toàn diện danh sách tài khoản Nhân viên và Chủ sở hữu, phê duyệt các yêu cầu đăng ký mới và kiểm soát quyền hạn phân hệ.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadAccounts}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-2 transition-colors border border-white/10"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới danh sách</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
            <span className="text-[11px] text-slate-300 font-semibold block">Tổng Số Tài Khoản</span>
            <span className="text-2xl font-black text-white">{totalCount}</span>
          </div>

          <div className="bg-purple-500/10 backdrop-blur-sm rounded-2xl p-3.5 border border-purple-400/20">
            <span className="text-[11px] text-purple-200 font-semibold block">Chủ Nhà Hàng</span>
            <span className="text-2xl font-black text-purple-300">{ownerCount}</span>
          </div>

          <div className="bg-blue-500/10 backdrop-blur-sm rounded-2xl p-3.5 border border-blue-400/20">
            <span className="text-[11px] text-blue-200 font-semibold block">Nhân Viên Hệ Thống</span>
            <span className="text-2xl font-black text-blue-300">{staffCount}</span>
          </div>

          <div className="bg-amber-500/10 backdrop-blur-sm rounded-2xl p-3.5 border border-amber-400/20">
            <span className="text-[11px] text-amber-200 font-semibold block">Chờ Phê Duyệt Email</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-amber-300">{pendingCount}</span>
              {pendingCount > 0 && (
                <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  Cần duyệt
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage('')}
            className="text-emerald-700 hover:text-emerald-900 font-black text-sm"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên hoặc tên tài khoản..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">Tất cả chức danh (5 vị trí + Chủ)</option>
            <option value="owner">Chủ Nhà Hàng</option>
            <option value="manager">Quản Lý</option>
            <option value="reception">Lễ Tân</option>
            <option value="waiter">Phục Vụ</option>
            <option value="kitchen">Đầu Bếp / Bar</option>
            <option value="cashier">Thu Ngân</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ phê duyệt email</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Bị khóa tạm</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-black uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Họ Tên & Tài Khoản</th>
                <th className="px-4 py-3.5">Phân Loại</th>
                <th className="px-4 py-3.5">Vị Trí Phân Hệ</th>
                <th className="px-4 py-3.5">Gói Thuê App (Chủ)</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
                <th className="px-5 py-3.5 text-right">Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 font-medium">
                    Không tìm thấy tài khoản nào phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const posMeta = POSITION_LABELS[acc.position] || {
                    label: acc.position || 'Nhân viên',
                    color: 'bg-slate-100 text-slate-700 border-slate-200',
                    icon: Users
                  };
                  const PosIcon = posMeta.icon;
                  const isOwner = acc.accountType === 'owner';
                  const isPending = acc.approvalStatus === 'pending';

                  return (
                    <tr key={acc._id || acc.username} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                              isOwner
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                                : 'bg-slate-900 text-amber-300'
                            }`}
                          >
                            {acc.name ? acc.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block text-xs">
                              {acc.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              @{acc.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {isOwner ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-300">
                            <Crown className="w-3 h-3 text-purple-700" />
                            <span>Chủ Nhà Hàng</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <span>Nhân Viên</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${posMeta.color}`}
                        >
                          <PosIcon className="w-3 h-3" />
                          <span>{posMeta.label}</span>
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {isOwner ? (
                          <div className="text-[11px]">
                            <span className="font-extrabold text-purple-900 block">
                              {acc.planName || acc.plan || 'Gói Doanh Nghiệp'}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold">
                              Toàn quyền 6 phân hệ
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Theo gói của Chủ</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Chờ duyệt (qanh7c3@gmail.com)</span>
                          </span>
                        ) : acc.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Đang hoạt động</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <Ban className="w-3 h-3 text-rose-600" />
                            <span>Đã khóa</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <button
                              onClick={() => handleApprove(acc)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                              title="Phê duyệt kích hoạt tài khoản"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Duyệt</span>
                            </button>
                          )}

                          {!isOwner && (
                            <button
                              onClick={() => handleToggleActive(acc)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                                acc.isActive
                                  ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                                  : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              }`}
                              title={acc.isActive ? 'Tạm khóa tài khoản' : 'Mở khóa tài khoản'}
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>{acc.isActive ? 'Khóa' : 'Mở'}</span>
                            </button>
                          )}

                          {acc.username !== currentUser.username && (
                            <button
                              onClick={() => handleDelete(acc)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                              title="Xóa vĩnh viễn tài khoản"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
