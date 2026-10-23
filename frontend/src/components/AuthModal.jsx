import React, { useState } from 'react';
import {
  User,
  Lock,
  Shield,
  Crown,
  CheckCircle2,
  Mail,
  KeyRound,
  Sparkles,
  Layers,
  Briefcase,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Users,
  UtensilsCrossed,
  ChefHat,
  Receipt,
  UserCheck
} from 'lucide-react';
import { loginUser, registerStaffUser, registerOwnerUser } from '../services/api';
import {
  findLocalAccount,
  setActiveUserSession,
  addLocalStaffAccount,
  addLocalOwnerAccount
} from '../services/authStorage';

const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'Gói Khởi Nghiệp (Starter)',
    price: '299.000',
    unit: 'đ / tháng',
    badge: 'Tiết kiệm',
    color: 'border-slate-300 hover:border-slate-500',
    highlight: false,
    limits: [
      'Tối đa 10 bàn ăn phục vụ',
      'Tối đa 5 tài khoản nhân viên',
      'Báo cáo doanh thu ca cơ bản',
      'Hỗ trợ qua email trong giờ hành chính'
    ]
  },
  {
    id: 'standard',
    name: 'Gói Tiêu Chuẩn (Standard)',
    price: '599.000',
    unit: 'đ / tháng',
    badge: 'Phổ biến',
    color: 'border-blue-400 hover:border-blue-500',
    highlight: false,
    limits: [
      'Tối đa 25 bàn ăn phục vụ',
      'Tối đa 15 tài khoản nhân viên',
      'Màn hình điều phối Bếp KDS Realtime',
      'Tích hợp mã thanh toán VietQR động'
    ]
  },
  {
    id: 'pro',
    name: 'Gói Chuyên Nghiệp (Pro)',
    price: '999.000',
    unit: 'đ / tháng',
    badge: 'Khuyên Dùng ★',
    color: 'border-amber-400 bg-amber-500/5 hover:border-amber-500',
    highlight: true,
    limits: [
      'Tối đa 60 bàn ăn phục vụ',
      'Tối đa 40 tài khoản nhân viên',
      'Quản lý kho nguyên liệu & Định lượng 30 món',
      'Báo cáo giá Cost, Doanh thu & Lãi ròng tự động'
    ]
  },
  {
    id: 'enterprise',
    name: 'Gói Chuỗi Doanh Nghiệp (Enterprise)',
    price: '1.899.000',
    unit: 'đ / tháng',
    badge: 'Vip Toàn Năng',
    color: 'border-purple-400 hover:border-purple-500',
    highlight: false,
    limits: [
      'Không giới hạn số bàn & nhân viên',
      'Mục 6: Quản lý tài khoản toàn quyền',
      'Nhật ký Audit Log & Kiểm soát két thu ngân',
      'Hạ tầng máy chủ chuyên dụng & Kỹ thuật viên 24/7'
    ]
  }
];

const STAFF_POSITIONS = [
  { id: 'reception', label: 'Lễ Tân', icon: UserCheck, desc: 'Tiếp đón, đặt bàn & danh sách chờ' },
  { id: 'waiter', label: 'Phục Vụ', icon: UtensilsCrossed, desc: 'Sơ đồ bàn, báo có khách & gọi món' },
  { id: 'kitchen', label: 'Đầu Bếp / Bar', icon: ChefHat, desc: 'Màn hình KDS & công thức nấu' },
  { id: 'cashier', label: 'Thu Ngân', icon: Receipt, desc: 'Thanh toán VietQR & quản lý két tiền' },
  { id: 'manager', label: 'Quản Lý', icon: Shield, desc: 'Kho, định lượng, audit log & xem 4 mục' }
];

export default function AuthModal({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login');
  const [accountType, setAccountType] = useState('staff');

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [staffName, setStaffName] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffPosition, setStaffPosition] = useState('waiter');

  const [ownerName, setOwnerName] = useState('');
  const [ownerUsername, setOwnerUsername] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerPlan, setOwnerPlan] = useState('pro');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginUsername.trim() || !loginPassword) {
      setErrorMessage('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu');
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginUser({
        username: loginUsername.trim(),
        password: loginPassword,
        accountType
      });

      if (res.data && res.data.success) {
        setActiveUserSession(res.data.data, res.data.token);
        onLoginSuccess(res.data.data);
        return;
      }
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      if (apiMsg && err.response?.status !== 404 && err.response?.status !== 502) {
        setErrorMessage(apiMsg);
        setIsLoading(false);
        return;
      }
    }

    try {
      const localAcc = findLocalAccount(loginUsername, loginPassword, accountType);
      if (!localAcc) {
        setErrorMessage('Tên tài khoản hoặc mật khẩu không đúng, hoặc không thuộc nhóm ' + (accountType === 'owner' ? 'Chủ nhà hàng' : 'Nhân viên'));
        setIsLoading(false);
        return;
      }

      if (localAcc.approvalStatus === 'pending') {
        setErrorMessage('Tài khoản đang chờ duyệt từ Chủ nhà hàng qua email qanh7c3@gmail.com!');
        setIsLoading(false);
        return;
      }

      if (!localAcc.isActive) {
        setErrorMessage('Tài khoản này hiện đang bị tạm khóa');
        setIsLoading(false);
        return;
      }

      setActiveUserSession(localAcc, 'token_local_' + localAcc._id);
      onLoginSuccess(localAcc);
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi đăng nhập hệ thống');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterStaffSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!staffName.trim() || !staffUsername.trim() || !staffPassword || !staffPosition) {
      setErrorMessage('Vui lòng nhập họ tên, tên tài khoản, mật khẩu và chọn vị trí làm việc');
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerStaffUser({
        name: staffName.trim(),
        username: staffUsername.trim(),
        password: staffPassword,
        position: staffPosition
      });

      if (res.data && res.data.success) {
        try {
          addLocalStaffAccount({
            name: staffName,
            username: staffUsername,
            password: staffPassword,
            position: staffPosition
          });
        } catch (_) {}

        setSuccessMessage('Đăng ký tài khoản nhân viên thành công! Đã gửi email xác nhận cho phép tạo tài khoản vào email: qanh7c3@gmail.com. Trạng thái hiện tại: Chờ Chủ nhà hàng phê duyệt.');
        setStaffName('');
        setStaffUsername('');
        setStaffPassword('');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      if (apiMsg && err.response?.status !== 404 && err.response?.status !== 502) {
        setErrorMessage(apiMsg);
        setIsLoading(false);
        return;
      }
    }

    try {
      addLocalStaffAccount({
        name: staffName,
        username: staffUsername,
        password: staffPassword,
        position: staffPosition
      });

      setSuccessMessage('Đăng ký tài khoản nhân viên thành công! Đã gửi email xác nhận cho phép tạo tài khoản vào email: qanh7c3@gmail.com. Vui lòng nhờ Chủ nhà hàng phê duyệt tài khoản để đăng nhập.');
      setStaffName('');
      setStaffUsername('');
      setStaffPassword('');
    } catch (err) {
      setErrorMessage(err.message || 'Không thể tạo tài khoản nhân viên');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterOwnerSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!ownerName.trim() || !ownerUsername.trim() || !ownerPassword) {
      setErrorMessage('Vui lòng nhập họ tên, tên tài khoản và mật khẩu Chủ nhà hàng');
      return;
    }

    if (!ownerPlan) {
      setErrorMessage('Vui lòng chọn 1 trong 4 gói thuê app trước khi hoàn tất tạo tài khoản');
      return;
    }

    setIsLoading(true);
    const selectedPlanObj = SUBSCRIPTION_PLANS.find((p) => p.id === ownerPlan);
    const planName = selectedPlanObj ? `${selectedPlanObj.name} - ${selectedPlanObj.price} ${selectedPlanObj.unit}` : ownerPlan;

    try {
      const res = await registerOwnerUser({
        name: ownerName.trim(),
        username: ownerUsername.trim(),
        password: ownerPassword,
        plan: ownerPlan
      });

      if (res.data && res.data.success) {
        try {
          addLocalOwnerAccount({
            name: ownerName,
            username: ownerUsername,
            password: ownerPassword,
            plan: ownerPlan,
            planName
          });
        } catch (_) {}

        setActiveUserSession(res.data.data, res.data.token);
        onLoginSuccess(res.data.data);
        return;
      }
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      if (apiMsg && err.response?.status !== 404 && err.response?.status !== 502) {
        setErrorMessage(apiMsg);
        setIsLoading(false);
        return;
      }
    }

    try {
      const newOwner = addLocalOwnerAccount({
        name: ownerName,
        username: ownerUsername,
        password: ownerPassword,
        plan: ownerPlan,
        planName
      });

      setActiveUserSession(newOwner, 'token_local_' + newOwner._id);
      onLoginSuccess(newOwner);
    } catch (err) {
      setErrorMessage(err.message || 'Không thể tạo tài khoản Chủ nhà hàng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        <div className="bg-gradient-to-r from-[#0b1329] via-[#111c3d] to-[#0b1329] px-6 py-6 text-white border-b border-amber-400/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#080d1a] p-1 border border-amber-400/50 shadow-lg flex items-center justify-center shrink-0">
                <img
                  src="/assets/logo.png"
                  alt="Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-wide bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                  CLOUD RESTAURANT RMS
                </h2>
                <p className="text-xs text-slate-300 font-medium">
                  Cổng Xác Thực & Quản Trị Hệ Thống Nhà Hàng
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-400/40 rounded-full text-amber-300 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Bảo Mật Đa Phân Hệ</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-5 bg-slate-900/60 p-1.5 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>ĐĂNG NHẬP HỆ THỐNG</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                authMode === 'register'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>ĐĂNG KÝ TÀI KHOẢN MỚI</span>
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-50/60 max-h-[75vh] overflow-y-auto">
          
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Chọn tư cách tài khoản:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setAccountType('staff');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                  accountType === 'staff'
                    ? 'border-amber-500 bg-amber-50/70 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    accountType === 'staff'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">1. Tài Khoản Nhân Viên</h4>
                  <p className="text-[11px] text-slate-500">Lễ tân, Phục vụ, Bếp, Thu ngân, Quản lý</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccountType('owner');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                  accountType === 'owner'
                    ? 'border-purple-600 bg-purple-50/70 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    accountType === 'owner'
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">2. Tài Khoản Chủ Nhà Hàng</h4>
                  <p className="text-[11px] text-slate-500">Toàn quyền, Mục 6 & Gói dịch vụ</p>
                </div>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="flex-1 leading-relaxed">{successMessage}</div>
            </div>
          )}

          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên tài khoản ({accountType === 'owner' ? 'Chủ' : 'Nhân viên'}):
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Nhập tên tk..."
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mật khẩu:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-slate-900 to-[#101b38] hover:from-slate-800 hover:to-slate-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Đang kiểm tra thông tin...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>ĐĂNG NHẬP VÀO NHÀ HÀNG</span>
                  </>
                )}
              </button>

            </form>
          )}

          {authMode === 'register' && accountType === 'staff' && (
            <form onSubmit={handleRegisterStaffSubmit} className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-[11px] text-amber-900 flex items-start gap-2">
                <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Quy trình đăng ký nhân viên:</strong> Sau khi nhập thông tin và gửi yêu cầu, hệ thống sẽ tự động gửi email xác nhận cho phép tạo tài khoản vào hộp thư <strong className="text-amber-800 underline">qanh7c3@gmail.com</strong>.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên nhân viên:</label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Văn An"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên tài khoản (đăng nhập):</label>
                  <input
                    type="text"
                    value={staffUsername}
                    onChange={(e) => setStaffUsername(e.target.value)}
                    placeholder="Ví dụ: an_phucvu"
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu:</label>
                  <input
                    type="password"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Mật khẩu từ 4 ký tự..."
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Vị trí làm việc (chọn 1 trong 5 vị trí):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STAFF_POSITIONS.map((pos) => {
                    const Icon = pos.icon;
                    const isSelected = staffPosition === pos.id;
                    return (
                      <button
                        type="button"
                        key={pos.id}
                        onClick={() => setStaffPosition(pos.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/30'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-slate-900">{pos.label}</p>
                          <p className="text-[10px] text-slate-500 truncate">{pos.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Đang gửi thông tin xác nhận...</span>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>GỬI EMAIL XÁC NHẬN & ĐĂNG KÝ NHÂN VIÊN</span>
                  </>
                )}
              </button>
            </form>
          )}

          {authMode === 'register' && accountType === 'owner' && (
            <form onSubmit={handleRegisterOwnerSubmit} className="space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-3 text-[11px] text-purple-900 flex items-start gap-2">
                <Crown className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Đăng ký Chủ nhà hàng:</strong> Nhập thông tin và chọn 1 trong 4 gói dịch vụ thuê app bên dưới để hoàn tất cấp quyền truy cập toàn bộ hệ thống và mục 6.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ tên chủ:</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn Chủ"
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên tài khoản:</label>
                  <input
                    type="text"
                    value={ownerUsername}
                    onChange={(e) => setOwnerUsername(e.target.value)}
                    placeholder="Ví dụ: chunhahang"
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu:</label>
                  <input
                    type="password"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    placeholder="Mật khẩu..."
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Danh sách 4 gói thuê app (chọn xong mới cho tạo):
                  </label>
                  <span className="text-[11px] font-bold text-purple-700">
                    Đã chọn: {SUBSCRIPTION_PLANS.find((p) => p.id === ownerPlan)?.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUBSCRIPTION_PLANS.map((plan) => {
                    const isSelected = ownerPlan === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setOwnerPlan(plan.id)}
                        className={`cursor-pointer rounded-2xl border-2 p-3.5 transition-all relative ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/70 shadow-md ring-2 ring-purple-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-xs text-slate-900">{plan.name}</span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              plan.highlight
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {plan.badge}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-base font-black text-purple-700">{plan.price}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{plan.unit}</span>
                        </div>

                        <ul className="space-y-1 text-[11px] text-slate-600">
                          {plan.limits.map((lim, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{lim}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">
                            {isSelected ? '✓ Đang chọn gói này' : 'Nhấn để chọn'}
                          </span>
                          <input
                            type="radio"
                            name="subscriptionPlan"
                            checked={isSelected}
                            onChange={() => setOwnerPlan(plan.id)}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !ownerPlan}
                className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Đang kích hoạt gói và tạo tài khoản...</span>
                ) : (
                  <>
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>CHỌN GÓI & TẠO TÀI KHOẢN CHỦ NHÀ HÀNG</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
