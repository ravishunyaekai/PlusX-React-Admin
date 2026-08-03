export const menuItems = {
    userList: [
        { id: "activeUser", label: "App Sign Up List", path: "/app-signup/app-signup-list" },
        { id: "deletedUser", label: "Deleted Account", path: "/app-signup/deleted-account" },
    ],
    driverList: [
        { id: "driverList", label: "Drivers", path: "/drivers/driver-list" },
        { id: "truckList", label: "Truck List", path: "/drivers/truck-list" },
    ],
    portableCharger: [
        // { id: "chargerList",    label: "Charger List", path: "/portable-charger/charger-list" },
        { id: "chargerBooking", label: "Charger Booking", path: "/portable-charger/charger-booking-list" },
        { id: "invoiceList",    label: "Invoice List", path: "/portable-charger/charger-booking-invoice-list" },
        { id: "timeSlot",       label: "Time Slot", path: "/portable-charger/charger-booking-time-slot-list" },

        { id: "deviceList", label: "Device List", path: "/portable-charger/device-list" },
        { id: "areaList", label: "Area List", path: "/portable-charger/area-list" },
        { id: "failedBookingList", label: "Failed Booking", path: "/portable-charger/failed-booking-list" },
    ],
    pickAndDrop: [
        { id: "bookingList", label: "Booking List", path: "/pick-and-drop/booking-list" },
        { id: "invoiceList", label: "Invoice List", path: "/pick-and-drop/invoice-list" },
        { id: "timeSlot", label: "Time Slot", path: "/pick-and-drop/time-slot-list" },
        { id: "failedBookingList", label: "Failed Booking List", path: "/pick-and-drop/failed-booking-list" },
    ],
    evRoadAssistance: [
        { id: "bookingList",       label: "Booking List", path: "/ev-road-assistance/booking-list" },
        { id: "timeSlot",          label: "Time Slot", path: "/ev-road-assistance/time-slot-list" },
        { id: "offlineLeads",      label: "RSA Offline Leads", path: "/ev-road-assistance/offline-leads" },
        { id: "invoiceList",       label: "Invoice List", path: "/ev-road-assistance/invoice-list" },
        { id: "failedBookingList", label: "Failed Booking", path: "/ev-road-assistance/failed-booking-list" },
    ],
    
    // evPreSalesTesting: [
    //     { id: "testingBooking", label: "Testing Booking", path: "/ev-pre-sales-testing/pre-sales-list" },
    //     { id: "timeSlot", label: "Time Slot", path: "/ev-pre-sales-testing/time-slot-list" },
    // ],
    // evSpecializedShops: [
    //     { id: "shopList", label: "Shop List", path: "/ev-specialized/shop-list" },
    //     { id: "shopServices", label: "Shop Services", path: "/ev-specialized/service-list" },
    //     { id: "shopBrands", label: "Shop Brands", path: "/ev-specialized/brand-list" },
    // ],
    eVSwipeStation: [
        { id: "bikeList",    label: "Bike List", path: "/ev-battery-swipe/bike-list" },
        { id: "stationList", label: "Swipe Station List", path: "/ev-battery-swipe/station-list" },
    ],
    chargerInstallation: [
        { id: "purchaseList", label: "EV Products & Installation", path: "/charger-installation/purchase-list" },
        { id: "chargerList", label: "Fixed Charger List",        path: "/charger-installation/ev-charger-list" },
        { id: "chargerBooking", label: "Fixed Charger Bookings", path: "/charger-installation/ev-charger-booking-list" },
       
        { id: "accessoriesList", label: "EV Accessories List", path: "/charger-installation/accessories-list" },
        { id: "accessoriesBooking", label: "EV Accessories Bookings", path: "/charger-installation/ev-accessories-booking-list" },

        { id: "stationList", label: "Charger Installation Bookings", path: "/charger-installation/charger-installation-list" },
        { id: "brandList",   label: "Brand List", path: "/charger-installation/ev-charger-brand-list" },
        // { id: "shareList", label: "Charge Share List", path: "/charger-installation/charger-share-list" },
    ],
    community: [
        { id: "communityList",   label: "Community List", path: "/community/community-list" },
        { id: "residentList",    label: "Resident List",  path: "/community/resident-list" },
        { id: "residentInvoice", label: "Invoice",        path: "/community/resident-invoice" },
        // { id: "sessionList",     label: "Session List",   path: "/community/session-list" },
    ],
    // evCharger : [
    //     { id: "chargerList", label: "EV Charger List", path: "/charger-installation/ev-charger-list" },
    //     { id: "brandList",   label: "Brand List", path: "/charger-installation/ev-charger-brand-list" },
    // ],
    // evAccessories: [
    //     { id: "productList", label: "EV Accessories List", path: "/charger-installation/accessories-list" },
    // ],
};
