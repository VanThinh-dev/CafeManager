import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import api from '../api/axios';

export default function AdminReportPage() {
  const [report, setReport] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const loadToday = async () => {
      await fetchTodayReport();
      setInitialized(true);
    };
    loadToday();
  }, []);

  useEffect(() => {
    if (initialized) fetchReport(selectedDate);
  }, [selectedDate, initialized]);

  const fetchReport = async (dateStr) => {
    try {
      const response = await api.get(`/admin/reports/date?date=${dateStr}`);
      setReport(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải báo cáo');
    }
  };

  const fetchTodayReport = async () => {
    try {
      const response = await api.get('/admin/reports/today');
      setReport(response.data);
      setSelectedDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải báo cáo hôm nay');
    }
  };

  // Dữ liệu doanh thu từng ngày
  const dailyRevenueData = (() => {
    if (!report?.dailySummary || report.dailySummary.length === 0) return [];

    const dailyRevenueData = report.dailySummary.length === 1 
  ? [
      { date: new Date(report.dailySummary[0].date).toLocaleDateString('vi-VN'), revenue: report.dailySummary[0].totalRevenue },
      { date: new Date(report.dailySummary[0].date).toLocaleDateString('vi-VN'), revenue: 0 }, // thêm điểm phụ
    ]
  : report.dailySummary.map(item => ({
      date: new Date(item.date).toLocaleDateString('vi-VN'),
      revenue: item.totalRevenue,
    }));

    // Nhiều ngày thật => lấy doanh thu từng ngày
    return report.dailySummary.map(item => ({
      date: new Date(item.date).toLocaleDateString('vi-VN'),
      revenue: item.totalRevenue
    }));
  })();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-base-content mb-2">Báo cáo thống kê</h1>
        <p className="text-base-content/70">Xem doanh thu từng ngày</p>
      </header>

      {/* Chọn ngày */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="form-control flex-1">
              <label className="label">
                <span className="label-text font-medium">Chọn ngày:</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <button
              onClick={fetchTodayReport}
              className="btn btn-primary flex items-center gap-2"
            >
              Báo cáo hôm nay
            </button>
          </div>
        </div>
      </div>

      {report ? (
        <>
          {/* Biểu đồ doanh thu từng ngày */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title mb-4">Doanh thu từng ngày</h2>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={dailyRevenueData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => value.toLocaleString()} />
                  <Tooltip formatter={(value) => value.toLocaleString() + ' đ'} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4ade80"
                    fill="#4ade80aa"
                  >
                    <LabelList
                      dataKey="revenue"
                      position="top"
                      formatter={(value) => value.toLocaleString() + ' đ'}
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bảng chi tiết báo cáo */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Chi tiết báo cáo</h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <tbody>
                    <tr>
                      <td className="font-bold">Ngày báo cáo</td>
                      <td>{new Date(selectedDate).toLocaleDateString('vi-VN')}</td>
                    </tr>
                    <tr>
                      <td className="font-bold">Tổng số khách</td>
                      <td>{report.totalCustomers} khách</td>
                    </tr>
                    <tr>
                      <td className="font-bold">Tổng doanh thu</td>
                      <td className="text-error font-bold text-lg">{report.totalRevenue.toLocaleString()} VNĐ</td>
                    </tr>
                    <tr>
                      <td className="font-bold">Tổng số đơn hàng</td>
                      <td>{report.totalOrders} đơn</td>
                    </tr>
                    <tr>
                      <td className="font-bold">Đơn đã thanh toán</td>
                      <td>{report.completedOrders} đơn</td>
                    </tr>
                    <tr>
                      <td className="font-bold">Đơn chưa thanh toán</td>
                      <td>{report.totalOrders - report.completedOrders} đơn</td>
                    </tr>
                    <tr>
                      <td className="font-bold">Doanh thu trung bình/đơn</td>
                      <td className="text-warning font-bold">
                        {report.completedOrders > 0
                          ? (report.totalRevenue / report.completedOrders).toLocaleString()
                          : '0'} VNĐ
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h3 className="text-lg font-semibold">Không có dữ liệu cho ngày đã chọn</h3>
            <p className="text-base-content/70">Hãy chọn ngày khác hoặc nhấn "Báo cáo hôm nay".</p>
          </div>
        </div>
      )}
    </div>
  );
}
