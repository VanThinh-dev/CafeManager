import React, { useEffect, useState } from "react";
import api from "../../api/api";

export default function TableStatusPage() {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    api.get("/tables")
      .then((res) => setTables(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <h2 className="text-3xl font-bold text-center mb-6">🪑 Trạng thái bàn</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left bg-white rounded-xl shadow-lg overflow-hidden">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="py-3 px-4">Số bàn</th>
              <th className="py-3 px-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((t) => (
              <tr key={t._id} className="border-b hover:bg-green-50">
                <td className="py-3 px-4">{t.tableNumber}</td>
                <td
                  className={`py-3 px-4 font-semibold ${
                    t.status === "Trống" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
