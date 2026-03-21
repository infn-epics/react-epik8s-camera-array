/**
 * RoleGuard — Conditionally render children based on user role.
 *
 * Usage:
 *   <RoleGuard require="operator">
 *     <button>Edit Dashboard</button>
 *   </RoleGuard>
 *
 *   <RoleGuard require="admin" fallback={<span>Admin only</span>}>
 *     <DangerZone />
 *   </RoleGuard>
 */
import { useAuth } from '../../context/AuthContext.jsx';

export default function RoleGuard({ require, fallback = null, children }) {
  const { hasRole } = useAuth();

  if (!hasRole(require)) return fallback;
  return children;
}
