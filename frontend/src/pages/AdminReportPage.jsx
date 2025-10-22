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

    // Tạo dữ liệu burn-up chart: tích lũy doanh thu theo ngày
    const burnUpData = (() => {
    if (!report?.dailySummary || report.dailySummary.length === 0) return [];

    // Nếu chỉ có 1 ngày, tạo dữ liệu mock tăng dần để test chart
    if (report.dailySummary.length === 1) {
        const today = report.dailySummary[0];
        const todayDate = new Date(today.date).toLocaleDateString('vi-VN');

        // Tạo 5 ngày giả lập với doanh thu tăng dần
        const mockData = [];
        let cumulative = 0;
        for (let i = 0; i < 5; i++) {
            cumulative += Math.floor(Math.random() * 500000) + 100000; // mỗi ngày tăng 100k-600k
            const date = new Date();
            date.setDate(date.getDate() + i);
            mockData.push({
                date: date.toLocaleDateString('vi-VN'),
                cumulativeRevenue: cumulative
            });
        }
        return mockData;
    }

        // Nếu có nhiều ngày thật thì tính như bình thường
        // return report.dailySummary.map((item, idx) => ({
        //     date: new Date(item.date).toLocaleDateString('vi-VN'),
        //     cumulativeRevenue: report.dailySummary.slice(0, idx + 1).reduce((sum, day) => sum + day.totalRevenue, 0),
        // }));
    })();

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-base-content mb-2">Báo cáo thống kê</h1>
                <p className="text-base-content/70">Xem báo cáo doanh thu tích lũy theo ngày</p>
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
                    {/* Biểu đồ burn-up chart */}
                    <div className="card bg-base-100 shadow-xl mb-6">
                        <div className="card-body">
                            <h2 className="card-title mb-4">Doanh thu tích lũy theo ngày</h2>
                            <ResponsiveContainer width="100%" height={350}>
                                <AreaChart data={burnUpData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={(value) => value.toLocaleString()} />
                                    <Tooltip formatter={(value) => value.toLocaleString() + ' đ'} />
                                    <Area
                                        type="monotone"
                                        dataKey="cumulativeRevenue"
                                        stroke="#4ade80"
                                        fill="#4ade80aa"
                                    >
                                        <LabelList dataKey="cumulativeRevenue" position="top" formatter={(value) => value.toLocaleString() + ' đ'} />
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
