import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, Outlet, useLocation } from 'react-router-dom';
import ThemeSelector from '../components/ThemeSelector';
import { getNavRoutes, ROUTES } from '../config/routes';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';

export default function MainLayout() {
    const { user, logout, isAdmin } = useAuth();
    const { isConnected, subscribe, unsubscribe } = useWebSocket();
    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    const userRole = isAdmin() ? 'ADMIN' : 'CUSTOMER';
    const navRoutes = getNavRoutes(userRole);
    const currentUserId = useMemo(() => user?.id, [user]);
    const location = useLocation();

    useEffect(() => {
        if (!user || !isConnected) return;
        const destination = '/topic/orders';
        const subscription = subscribe(destination, (message) => {
            try {
                const evt = JSON.parse(message.body);
                if (evt.userId === currentUserId && evt.action === 'updated' && evt.status === 'CONFIRMED') {
                    setNotificationCount(c => c + 1);
                    setNotifications(list => [{
                        id: evt.orderId,
                        type: 'ORDER_CONFIRMED',
                        title: 'Đơn hàng đã được xác nhận',
                        message: `Đơn #${evt.orderId} đã được xác nhận. Vui lòng đến nhận bàn.`,
                        time: new Date().toISOString()
                    }, ...list].slice(0, 20));
                    toast.success('Đơn hàng của bạn đã được xác nhận');
                }
            } catch (e) {
                console.error('Lỗi', e);
                toast.error("Đã xảy ra lỗi khi xác nhận đơn hàng!");
            }
        });
        return () => { if (subscription) unsubscribe(destination); };
    }, [user, isConnected, subscribe, unsubscribe, currentUserId]);

    const displayName = user?.fullName || user?.username || '?';
    const firstLetter = displayName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen flex">
    {/* Sidebar dọc */}
    {user && (
        <div className="w-60 bg-black text-white flex flex-col justify-between shadow-lg">
            {/* Phần trên: Logo + Links */}
            <div className="flex flex-col gap-2 p-4">
                <Link to={ROUTES.ROOT} className="btn btn-ghost text-xl mb-4 flex items-center gap-2 text-white">
                    <img
                        src="https://i.pinimg.com/736x/b5/87/66/b5876617ab1ca0d46ec3a8c375626e20.jpg"
                        alt="Logo"
                        className="w-8 h-8 object-contain"
                    />
                    Admin
                </Link>

                <div className="flex flex-col">
                    {navRoutes.map(route => {
                        const isActive = location.pathname === route.path;
                        return (
                            <Link
                                key={route.path}
                                to={route.path}
                                className={`block p-3 rounded-lg shadow-lg text-white font-medium transition-all duration-200
                                    ${isActive ? 'bg-blue-600 scale-105 shadow-xl' : 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg'}
                                    mb-2`}
                            >
                                {route.navLabel}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Phần dưới: Avatar + Logout */}
            <div className="flex flex-col gap-2 p-4 border-t border-gray-700">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-primary-content text-primary flex items-center justify-center
                        ${isConnected ? 'ring ring-success ring-offset-2 ring-offset-black' : ''}`}>
                        {firstLetter}
                    </div>
                    <div className="text-white font-medium">{displayName}</div>
                </div>

                <button
                    onClick={logout}
                    className="mt-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 shadow text-white font-medium transition"
                >
                    Đăng xuất
                </button>
            </div>
        </div>
    )}

    {/* Nội dung chính */}
    <div className="flex-1 bg-blue-100 flex items-center justify-center p-4">
        {/* Card nổi bật ở giữa */}
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl">
            <Outlet />
        </div>
    </div>
</div>
    );
}
