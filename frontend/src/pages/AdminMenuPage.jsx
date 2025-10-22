import { useState, useEffect } from 'react'
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

export default function AdminMenuPage() {
    const [menuItems, setMenuItems] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        available: true
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
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            const response = await api.get('/menu');
            setMenuItems(response.data);
        } catch (err) {
            console.error(err);
            toast.error('Không thể tải menu');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            available: true
        });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/admin/menu/${editingId}`, formData);
            } else {
                await api.post('/admin/menu', formData);
            }
            resetForm();
            fetchMenuItems();
        } catch (err) {
            console.error(err);
            toast.error('Không thể lưu món ăn');
        }
    };{

    const handleEdit = (item) => {
        setFormData(item);
        setEditingId(item.id);
    };

    const handleDelete = async (id) => {
        const menuItem = menuItems.find(item => item.id === id);
        setConfirmDialog({
            isOpen: true,
            title: 'Xác nhận xóa',
            message: `Bạn có chắc chắn muốn xóa món "${menuItem?.name || 'này'}"?`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/menu/${id}`);
                    fetchMenuItems();
                    toast.success('Món ăn đã được xóa thành công');
                } catch (err) {
                    console.error(err);
                    toast.error('Không thể xóa món ăn');
                }
            }
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            available: true
        });
        setEditingId(null);
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-base-content mb-2">Quản lý Menu</h1>
                <p className="text-base-content/70">Thêm, sửa và quản lý các món ăn trong menu</p>
            </div>

            <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                    <h2 className="card-title text-xl mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {editingId ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Tên món</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên món ăn"
                                    className="input input-bordered w-full"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Giá (VNĐ)</span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="Nhập giá món ăn"
                                    className="input input-bordered w-full"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Danh mục</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập danh mục"
                                    className="input input-bordered w-full"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Trạng thái</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={formData.available}
                                    onChange={(e) => setFormData({ ...formData, available: e.target.value === 'true' })}
                                >
                                    <option value="true">Có sẵn</option>
                                    <option value="false">Hết hàng</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Mô tả</span>
                            </label>
                            <textarea
                                placeholder="Nhập mô tả món ăn"
                                className="textarea textarea-bordered w-full"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Danh sách món ăn
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr>
                                    <th>Tên món</th>
                                    <th>Danh mục</th>
                                    <th className="text-right">Giá</th>
                                    <th className="text-center">Trạng thái</th>
                                    <th className="text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {menuItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="font-medium">{item.name}</div>
                                            {item.description && (
                                                <div className="text-sm text-base-content/70 mt-1">
                                                    {item.description}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {item.category && (
                                                <div className="badge badge-primary badge-sm">
                                                    {item.category}
                                                </div>
                                            )}
                                        </td>
                                        <td className="text-right font-bold text-error">
                                            {item.price.toLocaleString()} đ
                                        </td>
                                        <td className="text-center">
                                            <div className={`badge badge-sm ${item.available ? 'badge-success' : 'badge-error'
                                                }`}>
                                                {item.available ? 'Có sẵn' : 'Hết hàng'}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="btn btn-warning btn-sm"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="btn btn-error btn-sm"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
    );}
}
