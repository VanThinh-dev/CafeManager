import { useEffect, useState } from "react";
import api from "../../api/api";

export default function ManageTables() {
  const [tables, setTables] = useState([]);
  const [tableNumber, setTableNumber] = useState("");

  const loadTables = async () => {
    const res = await api.get("/tables");
    setTables(res.data);
  };

  const addTable = async () => {
    if (!tableNumber) return alert("Nhập số bàn!");
    await api.post("/tables", { tableNumber: Number(tableNumber) });
    setTableNumber("");
    loadTables();
  };

  const updateStatus = async (id, status) => {
    await api.put(`/tables/${id}/status?status=${status}`);
    loadTables();
  };

  useEffect(() => {
    loadTables();
  }, []);

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">🪑 Quản lý bàn</h2>
      <input
        type="number"
        value={tableNumber}
        onChange={(e) => setTableNumber(e.target.value)}
        placeholder="Nhập số bàn"
        className="border p-2 mr-2 rounded"
      />
      <button onClick={addTable} className="bg-green-500 text-white px-4 py-2 rounded">
        Thêm bàn
      </button>

      <table className="mt-4 border w-full">
        <thead>
          <tr className="bg-gray-100">
            <th>Số bàn</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((t) => (
            <tr key={t.id} className="text-center border-t">
              <td>{t.tableNumber}</td>
              <td>{t.status}</td>
              <td>
                <button
                  onClick={() => updateStatus(t.id, t.status === "AVAILABLE" ? "OCCUPIED" : "AVAILABLE")}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Chuyển trạng thái
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}