import {
  ADMIN_MODULE_DEFAULT_LABELS,
  ADMIN_MODULE_KEYS,
  ADMIN_MODULE_SIDEBAR_ORDER,
  MODULE_ENTRY_PATH,
} from '../constants/adminModules';

function normalizeAdminAccess(raw) {
  if (!raw || typeof raw !== 'object') return { isSuperAdmin: false, modules: [] };
  const isSuperAdmin = Boolean(raw.isSuperAdmin);
  const modules = Array.isArray(raw.modules)
    ? raw.modules
        .filter((m) => m && typeof m.key === 'string')
        .map((m) => ({ key: m.key, label: m.label != null ? String(m.label) : '' }))
    : [];
  return { isSuperAdmin, modules };
}

/** @returns {Set<string>} */
export function getAllowedModuleKeys(userDetails) {
  if (!userDetails) return new Set();
  // Legacy session (before adminAccess): keep full access
  if (userDetails.adminAccess == null) {
    return new Set(Object.values(ADMIN_MODULE_KEYS));
  }
  const { isSuperAdmin, modules } = normalizeAdminAccess(userDetails.adminAccess);
  if (isSuperAdmin) {
    return new Set(Object.values(ADMIN_MODULE_KEYS));
  }
  return new Set(modules.map((m) => m.key));
}

export function isSuperAdminUser(userDetails) {
  if (!userDetails?.adminAccess) return true;
  return Boolean(normalizeAdminAccess(userDetails.adminAccess).isSuperAdmin);
}

export function hasModuleAccess(userDetails, moduleKey) {
  if (!moduleKey) return true;
  const allowed = getAllowedModuleKeys(userDetails);
  return allowed.has(moduleKey);
}

/**
 * Map of module key -> display label (API label preferred).
 */
export function getAdminModuleLabelMap(userDetails) {
  const map = { ...ADMIN_MODULE_DEFAULT_LABELS };
  if (userDetails?.adminAccess == null) return map;
  const { isSuperAdmin, modules } = normalizeAdminAccess(userDetails.adminAccess);
  if (isSuperAdmin) return map;
  modules.forEach(({ key, label }) => {
    if (label) map[key] = label;
  });
  return map;
}

export function getDefaultLandingPath(userDetails) {
  if (!userDetails?.adminAccess) return '/';
  if (isSuperAdminUser(userDetails)) return '/';
  const allowed = getAllowedModuleKeys(userDetails);
  if (allowed.has(ADMIN_MODULE_KEYS.DASHBOARD)) return '/';
  for (const key of ADMIN_MODULE_SIDEBAR_ORDER) {
    if (key === ADMIN_MODULE_KEYS.DASHBOARD) continue;
    if (allowed.has(key) && MODULE_ENTRY_PATH[key]) return MODULE_ENTRY_PATH[key];
  }
  return '/';
}

/**
 * Persist admin access from login payload. Super admin without explicit modules still gets full Set via isSuperAdmin.
 */
export function mergeAdminAccessIntoUserDetails(userDetails, adminAccess) {
  const next = { ...userDetails, adminAccessChecked: true };
  if (adminAccess !== undefined) {
    next.adminAccess = normalizeAdminAccess(adminAccess);
  } else {
    next.adminAccess = { isSuperAdmin: true, modules: [] };
  }
  return next;
}

/** Read session user; migrate pre-RBAC sessions to super-admin so behavior is unchanged. */
export function ensureSessionUserDetails() {
  try {
    const raw = sessionStorage.getItem('userDetails');
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (u?.access_token && u.adminAccess == null) {
      const migrated = mergeAdminAccessIntoUserDetails(u, { isSuperAdmin: true, modules: [] });
      sessionStorage.setItem('userDetails', JSON.stringify(migrated));
      return migrated;
    }
    return u;
  } catch {
    return null;
  }
}
