import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { MdCoffeeMaker } from "react-icons/md";
import { FaChartBar, FaChair, FaSignOutAlt } from "react-icons/fa";

export default function AdminHome() {
  const navigate = useNavigate();
  const { Login } = useAuthStore();

  const cards = [
    {
      title: "Thống kê doanh thu",
      color: "bg-blue-500",
      hoverGlow: "hover:shadow-blue-400/80",
      icon: <FaChartBar size={60} />,
      path: "/admin/report",
    },
    {
      title: "Quản lý bàn",
      color: "bg-green-500",
      hoverGlow: "hover:shadow-green-400/80",
      icon: <FaChair size={60} />,
      path: "/admin/tables",
    },
    {
      title: "Quản lý sản phẩm",
      color: "bg-purple-500",
      hoverGlow: "hover:shadow-purple-400/80",
      icon: <MdCoffeeMaker size={60} />,
      path: "/admin/menu",
    },
    {
      title: "Đăng xuất",
      color: "bg-red-500",
      hoverGlow: "hover:shadow-red-400/80",
      icon: <FaSignOutAlt size={60} />,
      path: "/login",
    },
  ];

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="grid grid-cols-2 gap-8">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => (card.path ? navigate(card.path) : card.action())}
            className={`
              ${card.color} text-white w-64 h-64 rounded-2xl shadow-xl 
              flex flex-col justify-center items-center text-center 
              text-xl font-semibold cursor-pointer 
              transform transition-all duration-300 
              hover:scale-105 hover:shadow-2xl ${card.hoverGlow}
            `}
          >
            <div className="mb-3 transition-all duration-300 hover:scale-110">
              {card.icon}
            </div>
            <p>{card.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
