import { ADMIN_MODULE_KEYS } from '../constants/adminModules';
import { hasModuleAccess, isSuperAdminUser } from './adminAccess';

/**
 * Longest-prefix wins. Only routes that map to a known module key are gated;
 * other paths stay reachable (legacy / API-enforced).
 */
const ROUTE_PREFIX_TO_MODULE = [
  { prefix: '/app-signup', module: ADMIN_MODULE_KEYS.APP_SIGNUP },
  { prefix: '/drivers', module: ADMIN_MODULE_KEYS.DRIVERS },
  { prefix: '/portable-charger', module: ADMIN_MODULE_KEYS.PORTABLE_CHARGER },
  { prefix: '/pick-and-drop', module: ADMIN_MODULE_KEYS.PICK_DROP },
  { prefix: '/public-charger-station', module: ADMIN_MODULE_KEYS.PUBLIC_CHARGERS },
  { prefix: '/ev-road-assistance', module: ADMIN_MODULE_KEYS.EV_ROAD_ASSISTANCE },
  { prefix: '/charger-installation', module: ADMIN_MODULE_KEYS.CHARGER_INSTALLATION },
  { prefix: '/charger-share', module: ADMIN_MODULE_KEYS.CHARGE_SHARE },
  { prefix: '/community', module: ADMIN_MODULE_KEYS.COMMUNITY_CHARGER },
  { prefix: '/vendors', module: ADMIN_MODULE_KEYS.VENDOR_CHARGING },
  { prefix: '/coupon', module: ADMIN_MODULE_KEYS.COUPON },
  { prefix: '/offer', module: ADMIN_MODULE_KEYS.OFFER },
  { prefix: '/ev-insurance', module: ADMIN_MODULE_KEYS.EV_INSURANCE },
];

const GLOBAL_PATH_PREFIXES = [
  '/profile',
  '/notification-list',
  '/login',
];

/**
 * @returns {string | null} module key that guards this path, or null if not RBAC-gated on client
 */
export function getRequiredModuleForPath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return ADMIN_MODULE_KEYS.DASHBOARD;
  for (const g of GLOBAL_PATH_PREFIXES) {
    if (path === g || path.startsWith(`${g}/`)) return null;
  }
  const sorted = [...ROUTE_PREFIX_TO_MODULE].sort((a, b) => b.prefix.length - a.prefix.length);
  for (const { prefix, module } of sorted) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return module;
  }
  return null;
}

export function isPathAllowedForUser(pathname, userDetails) {
  if (!userDetails?.access_token) return false;
  if (isSuperAdminUser(userDetails)) return true;
  const moduleKey = getRequiredModuleForPath(pathname);
  if (moduleKey === null) return true;
  return hasModuleAccess(userDetails, moduleKey);
}
