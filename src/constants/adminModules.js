/**
 * Module keys must stay aligned with the backend (e.g. API constants/adminModules.js).
 * Used for RBAC checks; labels can be overridden by login response adminAccess.modules[].label.
 */
export const ADMIN_MODULE_KEYS = {
  DASHBOARD: 'dashboard',
  APP_SIGNUP: 'app_signup',
  DRIVERS: 'drivers',
  PORTABLE_CHARGER: 'portable_charger',
  PICK_DROP: 'pick_drop',
  EV_ROAD_ASSISTANCE: 'ev_road_assistance',
  EV_INSURANCE: 'ev_insurance',
  PUBLIC_CHARGERS: 'public_chargers',
  CHARGER_INSTALLATION: 'charger_installation',
  COMMUNITY_CHARGER: 'community_charger',
  VENDOR_CHARGING: 'vendor_charging',
  CHARGE_SHARE: 'charge_share',
  COUPON: 'coupon',
  OFFER: 'offer',
};

/** Default English labels when API does not supply a label */
export const ADMIN_MODULE_DEFAULT_LABELS = {
  [ADMIN_MODULE_KEYS.DASHBOARD]: 'Dashboard',
  [ADMIN_MODULE_KEYS.APP_SIGNUP]: 'App Sign Up',
  [ADMIN_MODULE_KEYS.DRIVERS]: 'Drivers',
  [ADMIN_MODULE_KEYS.PORTABLE_CHARGER]: 'Mobile & Portable EV Charging',
  [ADMIN_MODULE_KEYS.PICK_DROP]: 'Pick & Drop',
  [ADMIN_MODULE_KEYS.EV_ROAD_ASSISTANCE]: 'EV Road Assistance',
  [ADMIN_MODULE_KEYS.EV_INSURANCE]: 'EV Insurance',
  [ADMIN_MODULE_KEYS.PUBLIC_CHARGERS]: 'Public Chargers Station',
  [ADMIN_MODULE_KEYS.CHARGER_INSTALLATION]: 'Charger Installation',
  [ADMIN_MODULE_KEYS.COMMUNITY_CHARGER]: 'Community Charger',
  [ADMIN_MODULE_KEYS.VENDOR_CHARGING]: 'Vendor Charging Package',
  [ADMIN_MODULE_KEYS.CHARGE_SHARE]: 'Charge Share Listings',
  [ADMIN_MODULE_KEYS.COUPON]: 'Coupon',
  [ADMIN_MODULE_KEYS.OFFER]: 'Offer',
};

/** Sidebar order for limited admins (first allowed = default landing when no dashboard) */
export const ADMIN_MODULE_SIDEBAR_ORDER = [
  ADMIN_MODULE_KEYS.DASHBOARD,
  ADMIN_MODULE_KEYS.APP_SIGNUP,
  ADMIN_MODULE_KEYS.DRIVERS,
  ADMIN_MODULE_KEYS.PORTABLE_CHARGER,
  ADMIN_MODULE_KEYS.PICK_DROP,
  ADMIN_MODULE_KEYS.EV_ROAD_ASSISTANCE,
  ADMIN_MODULE_KEYS.EV_INSURANCE,
  ADMIN_MODULE_KEYS.PUBLIC_CHARGERS,
  ADMIN_MODULE_KEYS.CHARGER_INSTALLATION,
  ADMIN_MODULE_KEYS.COMMUNITY_CHARGER,
  ADMIN_MODULE_KEYS.VENDOR_CHARGING,
  ADMIN_MODULE_KEYS.CHARGE_SHARE,
  ADMIN_MODULE_KEYS.COUPON,
  ADMIN_MODULE_KEYS.OFFER,
];

/** First route to open for each module (matches existing app paths) */
export const MODULE_ENTRY_PATH = {
  [ADMIN_MODULE_KEYS.DASHBOARD]: '/',
  [ADMIN_MODULE_KEYS.APP_SIGNUP]: '/app-signup/app-signup-list',
  [ADMIN_MODULE_KEYS.DRIVERS]: '/drivers/driver-list',
  [ADMIN_MODULE_KEYS.PORTABLE_CHARGER]: '/portable-charger/charger-booking-list',
  [ADMIN_MODULE_KEYS.PICK_DROP]: '/pick-and-drop/booking-list',
  [ADMIN_MODULE_KEYS.EV_ROAD_ASSISTANCE]: '/ev-road-assistance/booking-list',
  [ADMIN_MODULE_KEYS.EV_INSURANCE]: '/ev-insurance/ev-insurance-list',
  [ADMIN_MODULE_KEYS.PUBLIC_CHARGERS]: '/public-charger-station/public-charger-station-list',
  [ADMIN_MODULE_KEYS.CHARGER_INSTALLATION]:
    '/charger-installation/charger-installation-list',
  [ADMIN_MODULE_KEYS.COMMUNITY_CHARGER]: '/community/community-list',
  [ADMIN_MODULE_KEYS.VENDOR_CHARGING]: '/vendors/vendor-list',
  [ADMIN_MODULE_KEYS.CHARGE_SHARE]: '/charger-share/request-list',
  [ADMIN_MODULE_KEYS.COUPON]: '/coupon/coupon-list',
  [ADMIN_MODULE_KEYS.OFFER]: '/offer/offer-list',
};
