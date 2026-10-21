import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Award, Calendar, RefreshCw } from 'lucide-react';
import { getReportStats } from '../services/api';

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getReportStats();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải báo cáo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Báo cáo */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800">Báo Cáo & Thống Kê Doanh Thu Đám Mây</h2>
          <p className="text-xs text-slate-400">
            Dữ liệu tổng hợp từ hệ thống CSDL MongoDB Atlas theo thời gian thực
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Đang tổng hợp báo cáo...</div>
      ) : (
        <>
          {/* Thẻ Chỉ số KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Doanh thu hôm nay */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Doanh thu hôm nay</p>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {(stats?.todayRevenue || 0).toLocaleString('vi-VN')} đ
                </h3>
              </div>
            </div>

            {/* Đơn hoàn tất hôm nay */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Hóa đơn hôm nay</p>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {stats?.todayOrdersCount || 0} đơn
                </h3>
              </div>
            </div>

            {/* Tổng doanh thu tích lũy */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Tổng doanh thu tích lũy</p>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {(stats?.totalRevenue || 0).toLocaleString('vi-VN')} đ
                </h3>
              </div>
            </div>

            {/* Tổng hóa đơn tích lũy */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Tổng hóa đơn phục vụ</p>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {stats?.totalInvoicesCount || 0} đơn
                </h3>
              </div>
            </div>
          </div>

          {/* Danh mục Món ăn Bán chạy nhất (Top Sellers) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-800">
                  Top Món Ăn Bán Chạy Nhất
                </h3>
              </div>

              {(!stats?.topItems || stats.topItems.length === 0) ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Chưa có dữ liệu đơn hàng hoàn tất
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {stats.topItems.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-xs ${
                          idx === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-slate-800">{item._id}</p>
                          <span className="text-slate-400 text-[11px]">
                            Doanh số: {(item.totalSales || 0).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      </div>

                      <span className="font-extrabold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                        {item.totalQuantity} suất
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lịch sử hóa đơn gần đây */}
            <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-800">
                Hóa Đơn Gần Đây Nhất
              </h3>

              {(!stats?.recentInvoices || stats.recentInvoices.length === 0) ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Chưa có hóa đơn nào được thanh toán
                </p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {stats.recentInvoices.slice(0, 8).map((inv) => (
                    <div key={inv._id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-slate-700">
                          {inv.invoiceCode}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {new Date(inv.paidAt || inv.createdAt).toLocaleTimeString('vi-VN')}, {new Date(inv.paidAt || inv.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-emerald-600">
                          +{inv.finalAmount.toLocaleString('vi-VN')} đ
                        </span>
                        <p className="text-[10px] uppercase font-semibold text-slate-400">
                          {inv.paymentMethod}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
