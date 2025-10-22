import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MainLayout from '../layouts/MainLayout';
import { ROUTE_CONFIG, ROUTES } from './routes';

// Route Guards
function PublicOnly({ children }) {
    const { user } = useAuth();
    return user ? <Navigate to={ROUTES.ROOT} /> : children;
}

function RequireAuth({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to={ROUTES.LOGIN} />;
}

function RoleGuard({ children, allowedRoles }) {
    const { user, isAdmin } = useAuth();

    if (!user) return <Navigate to={ROUTES.LOGIN} />;

    const userRole = isAdmin() ? 'ADMIN' : 'CUSTOMER';
    const isAllowed = allowedRoles.includes(userRole);

    if (!isAllowed) {
        return isAdmin() ? <Navigate to={ROUTES.ADMIN_DASHBOARD} /> : <Navigate to={ROUTES.BOOKING} />;
    }

    return children;
}

function RootRedirect() {
    const { user, isAdmin } = useAuth();
    if (!user) return <Navigate to={ROUTES.LOGIN} />;
    return isAdmin() ? <Navigate to={ROUTES.ADMIN_DASHBOARD} /> : <Navigate to={ROUTES.BOOKING} />;
}

// Dynamic route renderer
function renderRoute(route) {
    const { path, component: Component, isPublic, allowedRoles } = route;

    if (isPublic) {
        return (
            <Route
                key={path}
                path={path}
                element={
                    <PublicOnly>
                        <Component />
                    </PublicOnly>
                }
            />
        );
    }

    if (allowedRoles) {
        return (
            <Route
                key={path}
                path={path}
                element={
                    <RoleGuard allowedRoles={allowedRoles}>
                        <Component />
                    </RoleGuard>
                }
            />
        );
    }

    return (
        <Route
            key={path}
            path={path}
            element={
                <RequireAuth>
                    <Component />
                </RequireAuth>
            }
        />
    );
}

export default function AppRoutes() {
    const publicRoutes = ROUTE_CONFIG.filter(route => route.isPublic);
    const adminRoutes = ROUTE_CONFIG.filter(
        route => !route.isPublic && route.allowedRoles?.includes('ADMIN')
    );
    const customerRoutes = ROUTE_CONFIG.filter(
        route => !route.isPublic && route.allowedRoles?.includes('CUSTOMER')
    );

    return (
        <Suspense fallback={<div className="w-full py-10 text-center">Loading...</div>}>
            <Routes>
                {/* Public routes */}
                {publicRoutes.map(renderRoute)}

                {/* Admin routes within MainLayout */}
                <Route element={<MainLayout />}>
                    {adminRoutes.map(renderRoute)}
                </Route>

                {/* Customer routes without MainLayout */}
                {customerRoutes.map(renderRoute)}

                {/* Root redirect */}
                <Route path={ROUTES.ROOT} element={<RootRedirect />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to={ROUTES.ROOT} replace />} />
            </Routes>
        </Suspense>
    );
}

