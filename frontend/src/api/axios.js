import axios from 'axios';

const api = axios.create({
	baseURL: '/api', // Luôn sử dụng proxy từ vite.config.js
	withCredentials: true, // Đảm bảo gửi cookies
	headers: {
		'Content-Type': 'application/json',
	},
});

api.interceptors.request.use(config => {
	const token = localStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Response interceptor để xử lý lỗi authentication
api.interceptors.response.use(
	response => response,
	error => {
		if (error.response?.status === 401) {
			// Token hết hạn hoặc không hợp lệ
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			// Redirect về login page
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);

export default api;
