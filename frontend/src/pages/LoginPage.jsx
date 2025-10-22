import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', formData);
            login(response.data.user, response.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Đăng nhập thất bại');
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
            style={{ backgroundImage: "url('https://i.pinimg.com/1200x/9a/55/dc/9a55dcc0af24ad05f76206bf8bb3363a.jpg')" }}
        >
            <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl w-full max-w-md p-10 border border-gray-200">
                <div className="text-center mb-8">
                    <img
                        src="https://i.pinimg.com/736x/c8/77/1c/c8771c9f5814bad51cfd45495fed48c2.jpg"
                        className="mx-auto mb-4 w-20 h-20 rounded-full border-4 border-green-400 shadow-md"
                        alt="Logo"
                    />
                    <h2 className="text-3xl font-bold text-gray-800">Đăng nhập</h2>
                    <p className="text-gray-600 mt-1">Chào mừng bạn trở lại!</p>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 border border-red-300 p-3 rounded mb-4 text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-gray-700">Tên đăng nhập</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Nhập tên đăng nhập"
                            className="input w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition shadow-sm"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-gray-700">Mật khẩu</span>
                        </label>
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu"
                            className="input w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition shadow-sm"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-control mt-4">
                        <button
                            type="submit"
                            className="w-full py-3 rounded-lg bg-green-400 hover:bg-green-500 text-white font-semibold shadow-lg transition"
                        >
                            Đăng nhập
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-green-500 font-medium hover:underline">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
