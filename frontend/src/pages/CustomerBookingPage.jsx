import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';

export default function CustomerBookingPage() {
    const [tables, setTables] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [cart, setCart] = useState([]);
    const recentlyBookedTableRef = useRef(null);
    const availableToastShownRef = useRef(new Set());
    const { user, logout } = useAuth(); // thêm logout
    const { isConnected, subscribe, unsubscribe } = useWebSocket();
    const navigate = useNavigate(); // hook navigate

    useEffect(() => {
        fetchTables();
        fetchMenu();
    }, []);

    const fetchTables = async () => {
        try {
            const response = await api.get('/tables/available');
            setTables(response.data);
        } catch (err) {
            console.error(err);
            toast.error('Không thể tải danh sách bàn');
        }
    };

    const fetchMenu = async () => {
        try {
            const response = await api.get('/menu/available');
            setMenuItems(response.data);
        } catch (err) {
            console.error(err);
            toast.error('Không thể tải menu');
        }
    };

    const handleTableStatusUpdate = useCallback((event) => {
        setTables(currentTables => {
            let updatedTables = [...currentTables];
            switch (event.action) {
                case 'UPDATE':
                    if (event.status === 'AVAILABLE') {
                        const existingIndex = updatedTables.findIndex(table => table.id === event.tableId);
                        if (existingIndex === -1) {
                            updatedTables.push({
                                id: event.tableId,
                                tableNumber: event.tableNumber,
                                seats: event.seats,
                                status: event.status
                            });
                        } else {
                            updatedTables[existingIndex].status = event.status;
                        }
                        if (!availableToastShownRef.current.has(event.tableId)) {
                            availableToastShownRef.current.add(event.tableId);
                            toast.success(`Bàn ${event.tableNumber} trống!`);
                        }
                    } else {
                        updatedTables = updatedTables.filter(table => table.id !== event.tableId);
                        availableToastShownRef.current.delete(event.tableId);
                        if (selectedTable === event.tableId && event.tableId !== recentlyBookedTableRef.current) {
                            setSelectedTable(null);
                            toast.error(`Bàn ${event.tableNumber} đã được đặt`);
                        }
                    }
                    break;
                case 'CREATE':
                    if (event.status === 'AVAILABLE') {
                        updatedTables.push({
                            id: event.tableId,
                            tableNumber: event.tableNumber,
                            seats: event.seats,
                            status: event.status
                        });
                        toast.success(`Bàn mới: ${event.tableNumber}`);
                    }
                    break;
                case 'DELETE':
                    updatedTables = updatedTables.filter(table => table.id !== event.tableId);
                    if (selectedTable === event.tableId) setSelectedTable(null);
                    break;
                default: break;
            }
            return updatedTables;
        });
    }, [selectedTable]);

    useEffect(() => {
        if (isConnected) {
            const subscription = subscribe('/topic/tables', (message) => {
                try {
                    const event = JSON.parse(message.body);
                    handleTableStatusUpdate(event);
                } catch (error) {
                    console.error(error);
                }
            });
            return () => { if (subscription) unsubscribe('/topic/tables'); };
        }
    }, [isConnected, subscribe, unsubscribe]);

    const addToCart = (item) => {
        const existing = cart.find(c => c.menuItemId === item.id);
        if (existing) {
            setCart(cart.map(c =>
                c.menuItemId === item.id
                    ? { ...c, quantity: c.quantity + 1 }
                    : c
            ));
        } else {
            setCart([...cart, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }]);
        }
    };

    const updateQuantity = (menuItemId, delta) => {
        setCart(cart.map(item => {
            if (item.menuItemId === menuItemId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean));
    };

    const handleBooking = async () => {
        if (!user) { toast.error('Vui lòng đăng nhập'); return; }
        if (!selectedTable) { toast.error('Vui lòng chọn bàn'); return; }
        if (cart.length === 0) { toast.error('Vui lòng chọn món'); return; }

        try {
            const orderData = { tableId: selectedTable, userId: user.id, items: cart.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })) };
            await api.post('/orders/book', orderData);
            toast.success('Đặt bàn thành công!');
            recentlyBookedTableRef.current = selectedTable;
            setSelectedTable(null);
            setCart([]);
            fetchTables();
            setTimeout(() => { recentlyBookedTableRef.current = null; }, 2000);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Không thể đặt bàn');
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Đăng xuất thành công');
        navigate('/login'); // redirect về trang login
    };

    return (
        <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://i.pinimg.com/1200x/9a/55/dc/9a55dcc0af24ad05f76206bf8bb3363a.jpg')" }}>
            {/* Header */}
            <header className="bg-black/60 backdrop-blur-md sticky top-0 z-50 shadow-md">
                <div className="container mx-auto flex items-center justify-between py-4 px-6">
                    <div className="flex items-center gap-3">
                        <img src="https://i.pinimg.com/736x/c8/77/1c/c8771c9f5814bad51cfd45495fed48c2.jpg" alt="Logo" className="h-10 w-10 object-contain" />
                        <h1 className="text-white font-bold text-xl">CafeShop</h1>
                    </div>
                    <nav className="flex gap-4">
                        {user ? (
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} className="cursor-pointer">
                                    <img
                                        src={user.avatar || "https://i.pravatar.cc/40"} // avatar user
                                        alt={user.username}
                                        className="w-10 h-10 rounded-full border-2 border-white"
                                    />
                                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-44 mt-2 text-base-content">
                                    <li>
                                        <a href="/profile">Trang cá nhân</a>
                                    </li>
                                    <li>
                                        <button onClick={handleLogout} className="text-error">
                                            Đăng xuất
                                        </button>
                                    </li>
                                </ul>
                                </div>
                            </div>
                        ) : (
                            <a href="/login" className="text-white font-medium hover:underline">Đăng nhập</a>
                        )}
                    </nav>
                </div>
            </header>

            <main className="w-full px-6 py-6 max-w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 w-full">
                    {/* Tables */}
                    <div className="bg-white/90 rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-4">Chọn bàn ({tables.length} bàn trống)</h2>
                        {tables.length === 0 ? (
                            <p className="text-gray-600">Hiện tại không có bàn trống</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {tables.map((table) => (
                                    <div
                                        key={table.id}
                                        onClick={() => setSelectedTable(table.id)}
                                        className={`cursor-pointer border rounded-lg p-4 text-center transition-transform duration-200 ${selectedTable === table.id ? 'bg-green-200 scale-105 border-green-500' : 'hover:bg-gray-100 hover:scale-105'}`}
                                    >
                                        <div className="font-bold text-lg">Bàn {table.tableNumber}</div>
                                        <div className="text-sm text-gray-500">{table.seats} chỗ</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cart */}
                    <div className="bg-white/90 rounded-xl shadow-lg p-6 flex flex-col">
                        <h2 className="text-2xl font-bold mb-4">Giỏ hàng ({cart.length} món)</h2>
                        {cart.length === 0 ? (
                            <p className="text-gray-600 flex-1">Chưa có món nào được chọn</p>
                        ) : (
                            <div className="flex-1 overflow-y-auto max-h-96 space-y-2">
                                {cart.map(item => (
                                    <div key={item.menuItemId} className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-red-600 font-bold">{item.price.toLocaleString()} đ</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateQuantity(item.menuItemId, -1)} className="btn btn-sm btn-error">−</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.menuItemId, 1)} className="btn btn-sm btn-success">+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={handleBooking} disabled={!selectedTable || cart.length === 0} className="btn btn-primary mt-4">
                            Order
                        </button>
                    </div>
                </div>

                {/* Menu */}
                <div className="bg-white/90 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Menu</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {menuItems.map(item => (
                            <div key={item.id} className="bg-gray-100 rounded-lg p-4 shadow hover:shadow-lg transition-all">
                                <h3 className="font-bold mb-2">{item.name}</h3>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                                <div className="text-red-600 font-bold mb-2">{item.price.toLocaleString()} đ</div>
                                <button onClick={() => addToCart(item)} className="btn btn-success w-full btn-sm">Thêm vào giỏ</button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
