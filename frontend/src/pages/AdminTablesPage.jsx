import { useState, useEffect } from 'react'
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

export default function AdminTablesPage() {
    const [tables, setTables] = useState([]);
    const [formData, setFormData] = useState({
        tableNumber: '',
        seats: '',
        status: 'AVAILABLE'
    });
    const [editingId, setEditingId] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'danger',
        onConfirm: () => { }
    });

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const response = await api.get('/tables');
            setTables(response.data);
        } catch (err) {
            console.error(err);
            toast.error('Không thể tải danh sách bàn');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/admin/tables/${editingId}`, formData);
            } else {
                await api.post('/admin/tables', formData);
            }
            resetForm();
            fetchTables();
        } catch (err) {
            console.error(err);
            toast.error('Không thể lưu thông tin bàn');
        }
    };

    const handleEdit = (table) => {
        setFormData({
            tableNumber: table.tableNumber,
            seats: table.seats,
            status: table.status
        });
        setEditingId(table.id);
    };

    const handleDelete = async (id) => {
        const table = tables.find(t => t.id === id);
        setConfirmDialog({
            isOpen: true,
            title: 'Xác nhận xóa',
            message: `Bạn có chắc chắn muốn xóa bàn số ${table?.tableNumber || 'này'}?`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/tables/${id}`);
                    fetchTables();
                    toast.success('Bàn đã được xóa thành công');
                } catch (err) {
                    console.error(err);
                    toast.error('Không thể xóa bàn');
                }
            }
        });
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.put(`/admin/tables/${id}/status`, { status: newStatus });
            fetchTables();
        } catch (err) {
            console.error(err);
            toast.error('Không thể cập nhật trạng thái bàn');
        }
    };

    const resetForm = () => {
        setFormData({
            tableNumber: '',
            seats: '',
            status: 'AVAILABLE'
        });
        setEditingId(null);
    };


    const getStatusText = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'Trống';
            case 'OCCUPIED': return 'Có khách';
            case 'PAID': return 'Đã thanh toán';
            default: return status;
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-base-content mb-2">Quản lý Bàn</h1>
                <p className="text-base-content/70">Thêm, sửa và quản lý các bàn trong quán</p>
            </div>

            <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                    <h2 className="card-title text-xl mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {editingId ? 'Cập nhật bàn' : 'Thêm bàn mới'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Số bàn</span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="Nhập số bàn"
                                    className="input input-bordered w-full"
                                    value={formData.tableNumber}
                                    onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Số chỗ ngồi</span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="Nhập số chỗ ngồi"
                                    className="input input-bordered w-full"
                                    value={formData.seats}
                                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Trạng thái</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="AVAILABLE">Trống</option>
                                    <option value="OCCUPIED">Có khách</option>
                                    <option value="PAID">Đã thanh toán</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="btn btn-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                {editingId ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={resetForm} className="btn btn-ghost">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Hủy
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-xl mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Danh sách bàn
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {tables.map((table) => {
                            return (
                                <div key={table.id} className="card bg-base-200 shadow-sm">
                                    <div className="card-body p-4">
                                        <h3 className="card-title text-lg mb-2">
                                            Bàn số {table.tableNumber}
                                        </h3>
                                        <p className="text-sm text-base-content/70 mb-2">
                                            Số chỗ: {table.seats || 'Không xác định'}
                                        </p>
                                        <div className={`badge badge-sm mb-4 ${table.status === 'AVAILABLE' ? 'badge-success' :
                                            table.status === 'OCCUPIED' ? 'badge-warning' :
                                                'badge-info'
                                            }`}>
                                            {getStatusText(table.status)}
                                        </div>

                                        <div className="form-control mb-4">
                                            <label className="label">
                                                <span className="label-text text-xs">Đổi trạng thái:</span>
                                            </label>
                                            <select
                                                className="select select-bordered select-sm w-full"
                                                value={table.status}
                                                onChange={(e) => handleStatusChange(table.id, e.target.value)}
                                            >
                                                <option value="AVAILABLE">Trống</option>
                                                <option value="OCCUPIED">Có khách</option>
                                                <option value="PAID">Đã thanh toán</option>
                                            </select>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(table)}
                                                className="btn btn-warning btn-sm flex-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(table.id)}
                                                className="btn btn-error btn-sm flex-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
