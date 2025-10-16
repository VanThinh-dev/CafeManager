import React, { useState, useEffect } from "react";
import api from "../../api/api";

export default function BookingPage() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");

  useEffect(() => {
    api.get("/tables")
      .then((res) => setTables(res.data.filter((t) => t.status === "Trống")))
      .catch((err) => console.error(err));
  }, []);

  const handleBooking = async () => {
    if (!selectedTable) return alert("Vui lòng chọn bàn!");
    try {
      await api.put(`/tables/${selectedTable}`, { status: "Đã đặt" });
      alert("✅ Đặt bàn thành công!");
      setSelectedTable("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100">
      <h2 className="text-3xl font-bold mb-6">📅 Đặt bàn trước</h2>

      <div className="flex flex-col items-center gap-4">
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 w-64 shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
        >
          <option value="">-- Chọn bàn trống --</option>
          {tables.map((t) => (
            <option key={t._id} value={t._id}>
              Bàn {t.tableNumber}
            </option>
          ))}
        </select>

        <button
          onClick={handleBooking}
          className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition"
        >
          Xác nhận đặt bàn
        </button>
      </div>
    </div>
  );
}
