import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, Outlet } from 'react-router-dom';
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
        <div className="min-h-screen bg-base-200 flex">
            {/* Sidebar dọc */}
            {user && (
                <div className="w-60 bg-primary text-primary-content flex flex-col justify-between shadow-lg">
                    <div className="flex flex-col gap-2 p-4">
                        <Link to={ROUTES.ROOT} className="btn btn-ghost text-xl mb-4 flex items-center gap-2">
                            <img
                                src="https://i.pinimg.com/736x/b5/87/66/b5876617ab1ca0d46ec3a8c375626e20.jpg"  // URL ảnh trên mạng
                                alt="Logo"
                                className="w-8 h-8 object-contain"
                            />
                            Admin
                        </Link>

                        <ul className="menu menu-vertical flex-1 gap-2">
                            <li><Link to={ROUTES.ROOT} className="hover:bg-primary-focus">Trang chủ</Link></li>
                            {navRoutes.map(route => (
                                <li key={route.path}>
                                    <Link to={route.path} className="hover:bg-primary-focus">{route.navLabel}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Bottom: chỉ còn Theme + Avatar */}
                    <div className="flex items-center justify-between p-4 border-t border-primary-focus">

                        {/* Avatar */}
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
                                <div className={`w-10 rounded-full bg-primary-content text-primary ${isConnected ? 'ring ring-success ring-offset-5 ring-offset-base-500' : ''}`}>
                                    <span className="text-lg font-bold">{firstLetter}</span>
                                </div>
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-base-content">
                                <li>
                                    <div className="text-sm font-medium text-base-content/70">
                                        Xin chào, {displayName}
                                    </div>
                                </li>
                                <li><button onClick={logout} className="text-error">Đăng xuất</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Nội dung chính */}
            <div className="flex-1 p-4">
                <Outlet />
            </div>
        </div>
    );
}
