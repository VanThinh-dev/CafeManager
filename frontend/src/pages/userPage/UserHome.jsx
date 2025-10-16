import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export default function UserHome() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-6">🍽️ Xin chào! Hãy chọn thao tác</h1>
      <div className="flex flex-wrap gap-4">
        <button onClick={() => navigate("/user/menu")} className="bg-blue-500 text-white px-4 py-2 rounded">
          Xem menu
        </button>
        <button onClick={() => navigate("/user/book")} className="bg-green-500 text-white px-4 py-2 rounded">
          Đặt bàn
        </button>
        <button onClick={() => navigate("/user/status")} className="bg-yellow-500 text-white px-4 py-2 rounded">
          Trạng thái bàn
        </button>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
          Đăng xuất
        </button>
      </div>
    </div>
  );
}