import { useState } from "react";
import api from "../../api/api";

export default function Report() {
  const [date, setDate] = useState("");
  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    const res = await api.get(`/reports/daily?date=${date}`);
    setReport(res.data);
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">📅 Báo cáo doanh thu</h2>
      <div className="flex gap-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2 rounded" />
        <button onClick={fetchReport} className="bg-blue-500 text-white px-4 py-2 rounded">
          Xem báo cáo
        </button>
      </div>

      {report && (
        <div className="mt-4 border p-4 rounded">
          <p><strong>Ngày:</strong> {report.date}</p>
          <p><strong>Tổng khách:</strong> {report.totalCustomers}</p>
          <p><strong>Doanh thu:</strong> {report.totalRevenue.toLocaleString()} đ</p>
        </div>
      )}
    </div>
  );
}