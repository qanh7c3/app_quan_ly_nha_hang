import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, AlertCircle, X, Check } from 'lucide-react';

export default function PinModal({
  targetRoleLabel,
  currentRoleLabel,
  onSuccess,
  onClose
}) {
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (pin === '654321') {
      onSuccess();
    } else {
      setErrorMessage('Mã PIN không chính xác! Vui lòng nhập lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden">
        
        <div className="bg-gradient-to-r from-[#0b1329] via-[#101b38] to-[#0b1329] px-6 py-5 text-white flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-300">XÁC THỰC MÃ PIN BẢO MẬT</h3>
              <p className="text-[11px] text-slate-300">Quyền truy cập phân hệ chéo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 text-xs text-slate-700">
            Bạn đang đăng nhập vai trò <span className="font-extrabold text-amber-800">{currentRoleLabel}</span>.
            Để xem phân hệ <span className="font-extrabold text-slate-900">{targetRoleLabel}</span>, bạn cần nhập mã ủy quyền:
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nhập mã PIN bảo mật:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Nhập mã 6 chữ số..."
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg tracking-widest font-black focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              HỦY BỎ
            </button>
            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>XÁC NHẬN MÃ</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
