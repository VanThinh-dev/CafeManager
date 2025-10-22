import { lazy } from 'react';

// Lazy-loaded components
const MainLayout = lazy(() => import('../layouts/MainLayout'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage'));
const AdminMenuPage = lazy(() => import('../pages/AdminMenuPage'));
const AdminReportPage = lazy(() => import('../pages/AdminReportPage'));
const AdminTablesPage = lazy(() => import('../pages/AdminTablesPage'));
const CustomerBookingPage = lazy(() => import('../pages/CustomerBookingPage'));

// Route configuration
export const ROUTES = {
	// Public routes
	LOGIN: '/login',
	REGISTER: '/register',

	// Customer routes
	BOOKING: '/booking',

	// Admin routes
	ADMIN_DASHBOARD: '/admin/dashboard',
	ADMIN_MENU: '/admin/menu',
	ADMIN_TABLES: '/admin/tables',
	ADMIN_REPORT: '/admin/report',

	// Root
	ROOT: '/',
};

// Route definitions with metadata
export const ROUTE_CONFIG = [
	// Public routes
	{
		path: ROUTES.LOGIN,
		component: LoginPage,
		isPublic: true,
		title: 'Đăng nhập',
		description: 'Đăng nhập vào hệ thống',
		showInNav: false,
	},
	{
		path: ROUTES.REGISTER,
		component: RegisterPage,
		isPublic: true,
		title: 'Đăng ký',
		description: 'Tạo tài khoản mới',
		showInNav: false,
	},

	// Customer routes
	{
		path: ROUTES.BOOKING,
		component: CustomerBookingPage,
		isPublic: false,
		requiresAuth: true,
		allowedRoles: ['CUSTOMER'],
		title: 'Đặt bàn',
		description: 'Đặt bàn và chọn món ăn',
		showInNav: true,
		navLabel: 'Đặt bàn',
		icon: 'table',
	},

	// Admin routes
	{
		path: ROUTES.ADMIN_DASHBOARD,
		component: AdminDashboardPage,
		isPublic: false,
		requiresAuth: true,
		allowedRoles: ['ADMIN'],
		title: 'Dashboard',
		description: 'Tổng quan hệ thống',
		showInNav: true,
		navLabel: 'Dashboard',
		icon: 'dashboard',
	},
	{
		path: ROUTES.ADMIN_MENU,
		component: AdminMenuPage,
		isPublic: false,
		requiresAuth: true,
		allowedRoles: ['ADMIN'],
		title: 'Quản lý Menu',
		description: 'Thêm, sửa và quản lý menu',
		showInNav: true,
		navLabel: 'Quản lý Menu',
		icon: 'menu',
	},
	{
		path: ROUTES.ADMIN_TABLES,
		component: AdminTablesPage,
		isPublic: false,
		requiresAuth: true,
		allowedRoles: ['ADMIN'],
		title: 'Quản lý Bàn',
		description: 'Thêm, sửa và quản lý bàn',
		showInNav: true,
		navLabel: 'Quản lý Bàn',
		icon: 'tables',
	},
	{
		path: ROUTES.ADMIN_REPORT,
		component: AdminReportPage,
		isPublic: false,
		requiresAuth: true,
		allowedRoles: ['ADMIN'],
		title: 'Báo cáo',
		description: 'Xem báo cáo thống kê',
		showInNav: true,
		navLabel: 'Báo cáo',
		icon: 'report',
	},
];

// Helper functions
export const getRoutesByRole = userRole => {
	return ROUTE_CONFIG.filter(
		route =>
			route.isPublic ||
			(route.allowedRoles && route.allowedRoles.includes(userRole)),
	);
};

export const getNavRoutes = userRole => {
	return ROUTE_CONFIG.filter(
		route =>
			route.showInNav &&
			(route.isPublic ||
				(route.allowedRoles && route.allowedRoles.includes(userRole))),
	);
};

export const findRouteByPath = path => {
	return ROUTE_CONFIG.find(route => route.path === path);
};

export const isRouteAllowed = (path, userRole, isAuthenticated) => {
	const route = findRouteByPath(path);
	if (!route) return false;

	if (route.isPublic) return true;
	if (!isAuthenticated) return false;
	if (!route.allowedRoles) return true;

	return route.allowedRoles.includes(userRole);
};
