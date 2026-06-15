import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/hooks';

/**
 * ProtectedRoute — RBAC gate for authenticated routes.
 *
 * Access logic:
 *   1. Wildcard permission (*) OR explicit superadmin/centraladmin role → always allowed.
 *   2. hospitaladmin → passes ONLY if explicitly listed in allowedRoles OR has requiredPermission.
 *   3. All other roles → checked against allowedRoles + requiredPermissions (OR logic when both provided).
 *
 * This intentionally prevents hospitaladmin from accessing /supremeadmin
 * (which is gated by allowedRoles=['centraladmin','superadmin']).
 */
const ProtectedRoute = ({ children, requiredPermissions = [], allowedRoles = [] }) => {
    const { user, isAuthenticated, token } = useAuth();

    // Unauthenticated: redirect to login
    if (!token && (requiredPermissions.length > 0 || allowedRoles.length > 0)) {
        return <Navigate to="/login" replace />;
    }

    if (token && user) {
        const userPermissions = user.effectivePermissions || user.permissions || [];
        const userRole = (user.role || '').toLowerCase();

        // Global superadmins with wildcard permission bypass all checks
        const isGlobalAdmin = userPermissions.includes('*') ||
            userRole === 'superadmin' ||
            userRole === 'centraladmin';

        if (isGlobalAdmin) return children;

        // All other roles (including hospitaladmin) must pass explicit checks
        const hasAllowedRole = allowedRoles.length === 0 ||
            allowedRoles.map(r => r.toLowerCase()).includes(userRole);
        const hasRequiredPermission = requiredPermissions.length === 0 ||
            requiredPermissions.some(perm => userPermissions.includes(perm));

        if (allowedRoles.length > 0 && requiredPermissions.length > 0) {
            // Both specified: either role OR permission must match (OR logic)
            if (!hasAllowedRole && !hasRequiredPermission) {
                const dashboardPath = user.dashboardPath || '/my-dashboard';
                return <Navigate to={dashboardPath} replace />;
            }
        } else if (!hasAllowedRole || !hasRequiredPermission) {
            // Only one specified: that check must pass
            const dashboardPath = user.dashboardPath || '/my-dashboard';
            return <Navigate to={dashboardPath} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;

