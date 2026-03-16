// frontend/src/components/RoleGuard.jsx
// Usage: <RoleGuard allow={["admin"]}> ... </RoleGuard>
// Wraps any UI that should only render for certain roles.
// Falls back to a locked state or null if user lacks permission.

import { useAuth } from "../context/AuthContext";
import { ShieldOff } from "lucide-react";

/**
 * useRole() — returns helpers for role-based UI decisions
 *
 * Roles in system:
 *   "admin"  — full access (create/delete ponds, edit financials, view all)
 *   "farmer" — read + operate access (log tasks, water, mortality, ABW)
 *             cannot: delete ponds, change financial inputs, change alert thresholds
 */
export function useRole() {
  const { user } = useAuth();
  const role = user?.role || "farmer";

  return {
    role,
    isAdmin:  role === "admin",
    isFarmer: role === "farmer",
    // Specific permission checks
    canDeletePond:      role === "admin",
    canEditFinancials:  role === "admin",
    canEditAlerts:      role === "admin",
    canEditStocking:    role === "admin",
    canCreatePond:      role === "admin",
    canLogWater:        true,   // all roles
    canLogMortality:    true,   // all roles
    canLogABW:          true,   // all roles
    canManageTasks:     true,   // all roles
    canViewEconomics:   true,   // all roles (read-only for farmer)
    can: (action) => {
      const map = {
        delete_pond:      role === "admin",
        edit_financials:  role === "admin",
        edit_alerts:      role === "admin",
        edit_stocking:    role === "admin",
        create_pond:      role === "admin",
        log_water:        true,
        log_mortality:    true,
        log_abw:          true,
        manage_tasks:     true,
        view_economics:   true,
      };
      return map[action] ?? false;
    },
  };
}

/**
 * RoleGuard — render children only if user has required role
 * @param {string[]} allow  - array of allowed roles e.g. ["admin"]
 * @param {boolean}  silent - if true, renders nothing instead of lock UI
 */
export default function RoleGuard({ allow = [], children, silent = false }) {
  const { user } = useAuth();
  const role = user?.role || "farmer";

  if (allow.includes(role)) return children;

  if (silent) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-sm">
      <ShieldOff size={13} className="text-slate-400 shrink-0" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        Admin access required
      </p>
    </div>
  );
}