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
            {/* Connection Status */}
            <div className="mb-4 flex gap-4 items-center">
                {isLoading && (
                    <span className="loading loading-spinner loading-xs"></span>
                )}
            </div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-base-content mb-2">Dashboard Quản lý</h1>
                <p className="text-base-content/70">Quản lý bàn và đơn hàng</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Bảng hiển thị bàn */}
                <div className="xl:col-span-2">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-xl mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Trạng thái bàn
                            </h2>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                                {tables.map((table) => {
                                    const tableOrders = getOrdersForTable(table.id);
                                    const isSelected = selectedTable?.id === table.id;

                                    return (
                                        <div
                                            key={table.id}
                                            onClick={() => setSelectedTable(table)}
                                            className={`card cursor-pointer transition-all duration-200 hover:scale-105 ${isSelected
                                                ? 'ring-2 ring-primary bg-primary/10'
                                                : 'hover:shadow-lg'
                                                }`}
                                        >
                                            <div className="card-body p-4 text-center">
                                                <div className="text-2xl font-bold text-base-content">
                                                    Bàn {table.tableNumber}
                                                </div>
                                                <div className={`badge badge-sm mt-2 ${table.status === 'AVAILABLE' ? 'badge-success' :
                                                    table.status === 'OCCUPIED' ? 'badge-warning' :
                                                        'badge-info'
                                                    }`}>
                                                    {getStatusText(table.status)}
                                                </div>
                                                {tableOrders.length > 0 && (
                                                    <div className="badge badge-error badge-sm mt-1">
                                                        {tableOrders.length} đơn
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Thống kê nhanh */}
                            <div className="stats stats-vertical sm:stats-horizontal shadow w-full">
                                <div className="stat">
                                    <div className="stat-figure text-success">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <div className="stat-title">Bàn trống</div>
                                    <div className="stat-value text-success">
                                        {tables.filter(t => t.status === 'AVAILABLE').length}
                                    </div>
                                </div>

                                <div className="stat">
                                    <div className="stat-figure text-warning">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                                        </svg>
                                    </div>
                                    <div className="stat-title">Đang phục vụ</div>
                                    <div className="stat-value text-warning">
                                        {tables.filter(t => t.status === 'OCCUPIED').length}
                                    </div>
                                </div>

                                <div className="stat">
                                    <div className="stat-figure text-info">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <div className="stat-title">Đơn hàng chờ</div>
                                    <div className="stat-value text-info">{orders.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chi tiết bàn được chọn */}
                <div className="xl:col-span-1">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            {selectedTable ? (
                                <>
                                    <h2 className="card-title text-lg mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Bàn số {selectedTable.tableNumber}
                                    </h2>

                                    <div className="form-control mb-4">
                                        <label className="label">
                                            <span className="label-text font-medium">Cập nhật trạng thái</span>
                                        </label>
                                        <select
                                            className="select select-bordered w-full"
                                            value={selectedTable.status}
                                            onChange={(e) => updateTableStatus(selectedTable.id, e.target.value)}
                                        >
                                            <option value="AVAILABLE">Trống</option>
                                            <option value="OCCUPIED">Có khách</option>
                                        </select>
                                    </div>

                                    <div className="divider">Đơn hàng</div>

                                    {getOrdersForTable(selectedTable.id).length === 0 ? (
                                        <div className="text-center py-8">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-base-content/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <p className="text-base-content/70">Không có đơn hàng nào</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 max-h-96 overflow-y-auto">
                                            {getOrdersForTable(selectedTable.id).map((order) => (
                                                <div key={order.id} className="card bg-base-200 shadow-sm">
                                                    <div className="card-body p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <div className="font-medium text-sm">
                                                                    {order.user.fullName || order.user.username}
                                                                </div>
                                                                <div className="text-xs text-base-content/70">
                                                                    {new Date(order.orderTime).toLocaleString('vi-VN')}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1 mb-3">
                                                            {order.items.map((item, idx) => (
                                                                <div key={idx} className="flex justify-between text-sm">
                                                                    <span>{item.menuItem.name} x{item.quantity}</span>
                                                                    <span className="font-medium">{item.subtotal.toLocaleString()} đ</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="divider my-2"></div>
                                                        <div className="flex justify-between items-center font-bold text-base">
                                                            <span>Tổng cộng:</span>
                                                            <span className="text-error">{order.totalAmount.toLocaleString()} đ</span>
                                                        </div>

                                                        <div className="flex gap-2 mt-3">
                                                            {order.status === 'PENDING' && (
                                                                <button
                                                                    onClick={() => confirmOrder(order.id)}
                                                                    className="btn btn-primary btn-sm flex-1"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    Xác nhận
                                                                </button>
                                                            )}
                                                            {order.status === 'CONFIRMED' && (
                                                                <button
                                                                    onClick={() => checkInTable(order.table.id)}
                                                                    className="btn btn-warning btn-sm flex-1"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    </svg>
                                                                    Check-in
                                                                </button>
                                                            )}
                                                            {order.status === 'OCCUPIED' && (
                                                                <button
                                                                    onClick={() => completeOrder(order.id)}
                                                                    className="btn btn-success btn-sm flex-1"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    Hoàn thành
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-base-content/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                    </svg>
                                    <p className="text-base-content/70">Chọn một bàn để xem chi tiết</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                type={confirmDialog.type}
            />
        </div>
    );
}
