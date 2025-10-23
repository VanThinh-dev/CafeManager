import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ConfirmDialog from '../components/ConfirmDialog';
import { useWebSocketSubscriptions } from '../hooks/useWebSocketSubscriptions';

export default function AdminDashboardPage() {
    const [tables, setTables] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'warning',
        onConfirm: () => { }
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [tablesRes, ordersRes] = await Promise.all([
                api.get('/tables'),
                api.get('/admin/orders/active')
            ]);
            setTables(tablesRes.data);
            setOrders(ordersRes.data);

            // Cập nhật selectedTable nếu nó đang được chọn
            if (selectedTable) {
                const updatedTable = tablesRes.data.find(table => table.id === selectedTable.id);
                if (updatedTable) {
                    setSelectedTable(updatedTable);
                }
            }
        } catch (err) {
            console.error('Không thể tải dữ liệu', err);
            // Chỉ hiển thị toast error nếu không phải 401/403 (authentication issues)
            if (err.response?.status !== 401 && err.response?.status !== 403) {
                toast.error('Không thể tải dữ liệu');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Gọi fetchData lần đầu khi component mount
    useEffect(() => {
        fetchData();
    }, []);

    // WebSocket subscriptions để nhận real-time updates
    const subscriptions = [
        {
            destination: '/topic/tables',
            callback: (message) => {
                try {
                    const evt = JSON.parse(message.body);
                    // Incoming event fields: { tableId, tableNumber, status, seats, action }
                    setTables(currentTables =>
                        currentTables.map(table =>
                            table.id === evt.tableId ? { ...table, status: evt.status, seats: evt.seats, tableNumber: evt.tableNumber } : table
                        )
                    );

                    // Update selectedTable if it's the one being updated
                    setSelectedTable(prev => {
                        if (prev && prev.id === evt.tableId) {
                            return { ...prev, status: evt.status, seats: evt.seats, tableNumber: evt.tableNumber };
                        }
                        return prev;
                    });
                } catch (error) {
                    console.error('Error parsing table update:', error);
                }
            }
        },
        {
            destination: '/topic/orders',
            callback: (message) => {
                try {
                    const orderUpdate = JSON.parse(message.body);
                    setOrders(currentOrders => {
                        if (orderUpdate.action === 'created') {
                            return [...currentOrders, orderUpdate.order];
                        } else if (orderUpdate.action === 'updated') {
                            return currentOrders.map(order =>
                                order.id === orderUpdate.order.id ? orderUpdate.order : order
                            );
                        } else if (orderUpdate.action === 'deleted') {
                            return currentOrders.filter(order => order.id !== orderUpdate.orderId);
                        }
                        return currentOrders;
                    });
                } catch (error) {
                    console.error('Error parsing order update:', error);
                }
            }
        }
    ];

    useWebSocketSubscriptions(subscriptions);

    const updateTableStatus = async (tableId, status) => {
        try {
            if (status === 'OCCUPIED') {
                // Map to check-in endpoint
                await api.put(`/admin/tables/${tableId}/checkin`);
                toast.success('Đã chuyển bàn sang trạng thái có khách');
                return;
            }

            if (status === 'AVAILABLE') {
                // Completing active order (if any) will free the table
                const activeOrder = orders.find(o => o.table.id === tableId && (o.status === 'PENDING' || o.status === 'CONFIRMED'));
                if (activeOrder) {
                    await api.put(`/admin/orders/${activeOrder.id}/complete`);
                    toast.success('Đơn hàng đã được hoàn thành, bàn trống');
                } else {
                    toast('Không có đơn cần thanh toán. Bàn sẽ trống khi không còn đơn hoạt động.', { icon: 'ℹ️' });
                }
                return;
            }

            toast('Trạng thái không được hỗ trợ từ menu này', { icon: '⚠️' });
        } catch (err) {
            console.error('Không thể cập nhật trạng thái bàn', err);
            if (err.response?.status === 403) {
                toast.error('Bạn không có quyền thực hiện hành động này');
            } else if (err.response?.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
            } else {
                toast.error('Không thể cập nhật trạng thái bàn');
            }
        }
    };

    const confirmOrder = async (orderId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Xác nhận đơn hàng',
            message: 'Bạn có chắc chắn muốn xác nhận đơn hàng này?',
            type: 'warning',
            onConfirm: async () => {
                try {
                    await api.put(`/admin/orders/${orderId}/confirm`);
                    toast.success('Đơn hàng đã được xác nhận');
                } catch (err) {
                    console.error('Không thể xác nhận đơn hàng', err);
                    if (err.response?.status === 403) {
                        toast.error('Bạn không có quyền thực hiện hành động này');
                    } else if (err.response?.status === 401) {
                        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
                    } else if (err.response?.status === 404) {
                        toast.error('Không tìm thấy đơn hàng');
                    } else {
                        toast.error('Không thể xác nhận đơn hàng. Vui lòng thử lại');
                    }
                }
            }
        });
    };

    const checkInTable = async (tableId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Check-in bàn',
            message: 'Khách hàng đã đến quán và check-in?',
            type: 'warning',
            onConfirm: async () => {
                try {
                    await api.put(`/admin/tables/${tableId}/checkin`);
                    toast.success('Check-in thành công');
                } catch (err) {
                    console.error('Không thể check-in bàn', err);
                    if (err.response?.status === 403) {
                        toast.error('Bạn không có quyền thực hiện hành động này');
                    } else if (err.response?.status === 401) {
                        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
                    } else if (err.response?.status === 404) {
                        toast.error('Không tìm thấy bàn');
                    } else {
                        toast.error('Không thể check-in bàn. Vui lòng thử lại');
                    }
                }
            }
        });
    };

    const completeOrder = async (orderId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Hoàn thành đơn hàng',
            message: 'Bạn có chắc chắn muốn hoàn thành đơn hàng này?',
            type: 'warning',
            onConfirm: async () => {
                try {
                    await api.put(`/admin/orders/${orderId}/complete`);
                    toast.success('Đơn hàng đã được hoàn thành');
                } catch (err) {
                    console.error('Không thể hoàn thành đơn hàng', err);
                    if (err.response?.status === 403) {
                        toast.error('Bạn không có quyền thực hiện hành động này');
                    } else if (err.response?.status === 401) {
                        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
                    } else if (err.response?.status === 404) {
                        toast.error('Không tìm thấy đơn hàng');
                    } else {
                        toast.error('Không thể hoàn thành đơn hàng. Vui lòng thử lại');
                    }
                }
            }
        });
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'Trống';
            case 'PENDING': return 'Chờ xác nhận';
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'OCCUPIED': return 'Đang dùng';
            case 'PAID': return 'Đã thanh toán';
            default: return status;
        }
    };

    const getOrdersForTable = (tableId) => {
        return orders.filter(order => order.table.id === tableId && (order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'OCCUPIED'));
    };

    return (
       <div className="container mx-auto p-6 max-w-7xl">
    <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Quản lý</h1>
    <p className="text-gray-600 mb-6">Quản lý bàn và đơn hàng</p>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Danh sách bàn */}
        <div className="xl:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {tables.map((table) => {
                    const isSelected = selectedTable?.id === table.id;
                    return (
                        <div
                            key={table.id}
                            onClick={() => setSelectedTable(table)}
                            className={`cursor-pointer rounded-lg p-4 text-center font-medium text-white transition-all duration-200
                                ${table.status === 'AVAILABLE' ? 'bg-green-500' :
                                  table.status === 'OCCUPIED' ? 'bg-yellow-400' :
                                  table.status === 'PENDING' || table.status === 'CONFIRMED' ? 'bg-blue-500' :
                                  'bg-gray-400'}
                                ${isSelected ? 'ring-4 ring-indigo-500' : 'hover:brightness-110'}`}
                        >
                            <div className="text-lg font-bold">Bàn {table.tableNumber}</div>
                            <div className="mt-2">{getStatusText(table.status)}</div>
                            {getOrdersForTable(table.id).length > 0 && (
                                <div className="mt-1 bg-red-600 text-white text-sm rounded-full px-2 py-1 inline-block">
                                    {getOrdersForTable(table.id).length} đơn
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Thống kê nhanh */}
            <div className="flex gap-4 mt-6">
                <div className="flex-1 p-4 rounded-lg bg-green-100 text-green-800 font-semibold text-center">
                    Bàn trống: {tables.filter(t => t.status === 'AVAILABLE').length}
                </div>
                <div className="flex-1 p-4 rounded-lg bg-yellow-100 text-yellow-800 font-semibold text-center">
                    Đang phục vụ: {tables.filter(t => t.status === 'OCCUPIED').length}
                </div>
                <div className="flex-1 p-4 rounded-lg bg-blue-100 text-blue-800 font-semibold text-center">
                    Đơn chờ: {orders.length}
                </div>
            </div>
        </div>

        {/* Chi tiết bàn */}
        <div className="xl:col-span-1">
            <div className="p-6 rounded-lg bg-white shadow-lg min-h-[300px]">
                {selectedTable ? (
                    <>
                        <h2 className="text-lg font-semibold mb-4">Bàn số {selectedTable.tableNumber}</h2>

                        <div className="mb-4">
                            <label className="block font-medium mb-1">Cập nhật trạng thái</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg p-2"
                                value={selectedTable.status}
                                onChange={(e) => updateTableStatus(selectedTable.id, e.target.value)}
                            >
                                <option value="AVAILABLE">Trống</option>
                                <option value="OCCUPIED">Có khách</option>
                            </select>
                        </div>

                        <div className="mb-2 font-semibold">Đơn hàng</div>
                        {getOrdersForTable(selectedTable.id).length === 0 ? (
                            <p className="text-gray-500">Không có đơn hàng</p>
                        ) : (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {getOrdersForTable(selectedTable.id).map((order) => (
                                    <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-medium">{order.user.fullName || order.user.username}</span>
                                            <span className="text-sm text-gray-500">{new Date(order.orderTime).toLocaleString('vi-VN')}</span>
                                        </div>
                                        <div className="space-y-1">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span>{item.menuItem.name} x{item.quantity}</span>
                                                    <span>{item.subtotal.toLocaleString()} đ</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold">
                                            <span>Tổng cộng:</span>
                                            <span className="text-red-600">{order.totalAmount.toLocaleString()} đ</span>
                                        </div>

                                        <div className="flex gap-2 mt-2">
                                            {order.status === 'PENDING' && (
                                                <button onClick={() => confirmOrder(order.id)} className="flex-1 bg-blue-500 text-white p-2 rounded-lg">Xác nhận</button>
                                            )}
                                            {order.status === 'CONFIRMED' && (
                                                <button onClick={() => checkInTable(order.table.id)} className="flex-1 bg-yellow-400 text-white p-2 rounded-lg">Check-in</button>
                                            )}
                                            {order.status === 'OCCUPIED' && (
                                                <button onClick={() => completeOrder(order.id)} className="flex-1 bg-green-500 text-white p-2 rounded-lg">Hoàn thành</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-gray-500 text-center mt-20"></p>
                )}
            </div>
        </div>
    </div>
</div>
    );
}
