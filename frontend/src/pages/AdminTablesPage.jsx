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
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-primary mb-2">Quản lý Bàn</h1>
                <p className="text-base-content/70 text-lg">Thêm, sửa và quản lý các bàn trong quán</p>
            </div>

            {/* Form Thêm/Sửa bàn */}
            <div className="card bg-gradient-to-r from-base-100 to-base-200 shadow-xl mb-8 border border-base-300">
                <div className="card-body">
                    <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                        {editingId ? 'Cập nhật bàn' : 'Thêm bàn mới'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Số bàn */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Số bàn</span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="Nhập số bàn"
                                    className="input input-bordered w-full focus:border-primary focus:ring focus:ring-primary/30"
                                    value={formData.tableNumber}
                                    onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                                    required
                                />
                            </div>
                            {/* Số chỗ */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Số chỗ ngồi</span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="Nhập số chỗ ngồi"
                                    className="input input-bordered w-full focus:border-primary focus:ring focus:ring-primary/30"
                                    value={formData.seats}
                                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                                />
                            </div>
                            {/* Trạng thái */}
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

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <button type="submit" className="btn btn-primary flex items-center gap-2">
                                {editingId ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={resetForm} className="btn btn-ghost flex items-center gap-2">
                                    Hủy
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Danh sách bàn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tables.map((table) => (
                    <div
                        key={table.id}
                        className={`card shadow-lg border rounded-lg overflow-hidden transition-transform hover:scale-105`}
                    >
                        <div className="card-body p-5 bg-gradient-to-tr from-base-100 to-base-200">
                            <h3 className="card-title text-xl mb-1 font-semibold">
                                Bàn số {table.tableNumber}
                            </h3>
                            <p className="text-sm text-base-content/70 mb-3">
                                Số chỗ: {table.seats || 'Không xác định'}
                            </p>

                            <span
                                className={`badge badge-lg mb-4 ${table.status === 'AVAILABLE'
                                    ? 'badge-success'
                                    : table.status === 'OCCUPIED'
                                        ? 'badge-warning'
                                        : 'badge-info'
                                    }`}
                            >
                                {getStatusText(table.status)}
                            </span>

                            {/* Chọn trạng thái */}
                            <select
                                className="select select-bordered select-sm w-full mb-4"
                                value={table.status}
                                onChange={(e) => handleStatusChange(table.id, e.target.value)}
                            >
                                <option value="AVAILABLE">Trống</option>
                                <option value="OCCUPIED">Có khách</option>
                                <option value="PAID">Đã thanh toán</option>
                            </select>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(table)}
                                    className="btn btn-warning btn-sm flex-1 hover:scale-105 transition-transform"
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={() => handleDelete(table.id)}
                                    className="btn btn-error btn-sm flex-1 hover:scale-105 transition-transform"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
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
