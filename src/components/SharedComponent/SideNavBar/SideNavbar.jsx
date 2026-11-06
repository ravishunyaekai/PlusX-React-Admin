import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styles from "./sidenavbar.module.css";
import CompanyLogo from "../CompanyLogo";
import SideBarLinkItem from "./SideBarLinkItem";
import SidebarDropdown from "./SidebarDropdown/SidebarDropdown";
import { menuItems } from "./DropdownMenu";
import { ADMIN_MODULE_KEYS } from "../../../constants/adminModules";
import { ensureSessionUserDetails, getAdminModuleLabelMap, hasModuleAccess } from "../../../utils/adminAccess";

const SideNavbar = () => {
    const userDetails = ensureSessionUserDetails();
    const labels = getAdminModuleLabelMap(userDetails);
    const can = (key) => hasModuleAccess(userDetails, key);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openDropdown, setOpenDropdown]   = useState(null);
    const [checkedItems, setCheckedItems]   = useState({
        userList     : { activeUser : false, deletedUser : false },
        driverList   : { driverList : false, truckList : false },
        portableCharger : {
            deviceList     : false,
            areaList       : false,
            chargerBooking : false,
            invoiceList    : false,
            timeSlot       : false,
        },
        pickAndDrop         : { bookingList    : false, invoiceList : false, timeSlot : false },
        evRoadAssistance    : { bookingList    : false, invoiceList : false, offlineLeads : false },
        eVSwipeStation      : { bikeList : false, stationList : false },
        chargerInstallation : { stationList : false, chargerList : false, brandList: false, inquiryTracking: false },
        community  : { communityList : false, residentList : false, residentInvoice: false },
        vendorChargingPackage  : { vendorList : false, customerList : false },
    });
    const location = useLocation();
    const handleItemClicked = (menu, id, e) => {
        e.stopPropagation();
        setCheckedItems((prevState) => ({
            ...prevState,
            [menu]: {
                ...prevState[menu],
                [id]: true,
                ...Object.fromEntries(
                    Object.keys(prevState[menu]).map((key) =>
                        key !== id ? [key, false] : [key, true]
                    )
                ),
            },
        }));
    };

    useEffect(() => {
        const storedCheckedItems = sessionStorage.getItem("checkedItems");
        if (storedCheckedItems) {
            const parsedData = JSON.parse(storedCheckedItems);
            setCheckedItems(parsedData.checkedItems);
            setOpenDropdown(parsedData.dropdown);
        }
    }, []);

    useEffect(() => {
        const obj = {
            dropdown: openDropdown,
            checkedItems: checkedItems,
        };
        if (obj.dropdown) {
            sessionStorage.setItem("checkedItems", JSON.stringify(obj));
        }
    }, [checkedItems, openDropdown]);

    useEffect(() => {
        setCheckedItems((prevState) => ({
            userList: location.pathname.includes("/app-signup")
                ? prevState.userList : { activeUser: false, deletedUser: false },

            driverList: location.pathname.includes("/drivers")
                ? prevState.driverList : { driverList: false, truckList: false },

            portableCharger: location.pathname.includes("/portable-charger") ? prevState.portableCharger
                : {
                    chargerBooking : false,
                    invoiceList    : false,
                    timeSlot       : false,
                    deviceList     : false, 
                    areaList       : false
                },
            pickAndDrop: location.pathname.includes("/pick-and-drop") ? prevState.pickAndDrop
                : { bookingList: false, invoiceList: false, timeSlot: false },
            evRoadAssistance: location.pathname.includes("/ev-road-assistance")
                ? prevState.evRoadAssistance
                : { bookingList: false, invoiceList: false, offlineLeads: false },
            
            eVSwipeStation: location.pathname.includes("/ev-battery-swipe")
                ? prevState.eVSwipeStation : { bikeList: false, stationList: false },

            chargerInstallation: location.pathname.includes("/charger-installation")
                ? prevState.chargerInstallation : { stationList : false, chargerList : false, brandList: false, shareList: false, inquiryTracking: false  },
            community: location.pathname.includes("/community")
                ? prevState.community : { communityList : false, residentList : false, residentInvoice: false },
            
            vendorChargingPackage : location.pathname.includes("/vendors")
                ? prevState.vendorChargingPackage : { vendorList : false, customerList : false },

        })); 
        const dropdownPaths = [
            "/portable-charger",
            "/pick-and-drop",
            "/ev-road-assistance",
            "/app-signup",
            "/drivers",
            "/ev-battery-swipe",
            "/charger-installation",
            "/community",
            "/charger-share",
            "/vendors",
        ];
        if (!dropdownPaths.some((path) => location.pathname.includes(path))) {
            sessionStorage.removeItem("checkedItems");
            setOpenDropdown(null);
        }
    }, [location]);

    const toggleDropdown = (menu) => {
        setOpenDropdown(openDropdown === menu ? null : menu);
    };
    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };
    const isActive = (route) => {
        if (route === "/") {
            return location.pathname === "/";
        }
        return location.pathname.startsWith(route);
    };

    return (
        <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`} >
            <div className={styles.hamburger} onClick={toggleSidebar}>
                {isSidebarOpen ? "✖" : "☰"}
            </div>
            <div className={`${styles.sidebarContainer} ${isSidebarOpen ? styles.show : ""}`} >

                <div className={styles.logo}>
                    <NavLink to="/">
                        <CompanyLogo />
                    </NavLink>
                </div>
                <ul className={styles.menuList}>
                    {can(ADMIN_MODULE_KEYS.DASHBOARD) && (
                    <SideBarLinkItem label={labels[ADMIN_MODULE_KEYS.DASHBOARD]} path="/" isActive={isActive("/")} />
                    )}

                    {can(ADMIN_MODULE_KEYS.APP_SIGNUP) && (
                    <SidebarDropdown
                        menuName={labels[ADMIN_MODULE_KEYS.APP_SIGNUP]}
                        menuItems={menuItems.userList}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) =>
                            handleItemClicked("userList", id, e)
                        }
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.userList}
                    />
                    )}
                     
                    {can(ADMIN_MODULE_KEYS.DRIVERS) && (
                    <SideBarLinkItem label={labels[ADMIN_MODULE_KEYS.DRIVERS]} path="/drivers/driver-list" isActive={isActive("/drivers")} />
                    )}
                    {can(ADMIN_MODULE_KEYS.PORTABLE_CHARGER) && (
                    <SidebarDropdown
                         
                        menuName={labels[ADMIN_MODULE_KEYS.PORTABLE_CHARGER]}
                        menuItems={menuItems.portableCharger}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) =>
                            handleItemClicked("portableCharger", id, e)
                        }
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.portableCharger}
                    />
                    )}
                    {can(ADMIN_MODULE_KEYS.PICK_DROP) && (
                    <SidebarDropdown
                        menuName={labels[ADMIN_MODULE_KEYS.PICK_DROP]}
                        menuItems={menuItems.pickAndDrop}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) => handleItemClicked("pickAndDrop", id, e)}
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.pickAndDrop}
                    />
                    )}
                    {can(ADMIN_MODULE_KEYS.EV_ROAD_ASSISTANCE) && (
                    <SidebarDropdown
                        menuName={labels[ADMIN_MODULE_KEYS.EV_ROAD_ASSISTANCE]}
                        menuItems={menuItems.evRoadAssistance}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) =>
                            handleItemClicked("evRoadAssistance", id, e)
                        }
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.evRoadAssistance}
                    />
                    )}
                    {can(ADMIN_MODULE_KEYS.EV_INSURANCE) && (
                    <SideBarLinkItem label={labels[ADMIN_MODULE_KEYS.EV_INSURANCE]} path="/ev-insurance/ev-insurance-list" isActive={isActive("/ev-insurance")} />
                    )}
                    {can(ADMIN_MODULE_KEYS.PUBLIC_CHARGERS) && (
                    <SideBarLinkItem label={labels[ADMIN_MODULE_KEYS.PUBLIC_CHARGERS]} path="/public-charger-station/public-charger-station-list" isActive={isActive("/public-charger-station")} />
                    )}

                    
                    {can(ADMIN_MODULE_KEYS.CHARGER_INSTALLATION) && (
                    <SidebarDropdown
                        menuName={labels[ADMIN_MODULE_KEYS.CHARGER_INSTALLATION]}
                        menuItems={menuItems.chargerInstallation}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) =>
                            handleItemClicked("chargerInstallation", id, e)
                        }
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.chargerInstallation}
                    />
                    )}
                    {can(ADMIN_MODULE_KEYS.COMMUNITY_CHARGER) && (
                    <SidebarDropdown
                        menuName={labels[ADMIN_MODULE_KEYS.COMMUNITY_CHARGER]}
                        menuItems={menuItems.community}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) =>
                            handleItemClicked("community", id, e)
                        }
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.community}
                    />
                    )}
                    {can(ADMIN_MODULE_KEYS.VENDOR_CHARGING) && (
                    <SidebarDropdown
                        menuName={labels[ADMIN_MODULE_KEYS.VENDOR_CHARGING]}
                        menuItems={menuItems.vendorChargingPackage}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) =>
                            handleItemClicked("vendorChargingPackage", id, e)
                        }
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.vendorChargingPackage}
                    />
                    )}
                    {can(ADMIN_MODULE_KEYS.CHARGE_SHARE) && (
                    <SideBarLinkItem label={labels[ADMIN_MODULE_KEYS.CHARGE_SHARE]}  path="/charger-share/request-list"  isActive={isActive("/charger-share")} />
                    )}

                    {can(ADMIN_MODULE_KEYS.COUPON) && (
                    <SideBarLinkItem label={labels[ADMIN_MODULE_KEYS.COUPON]} path="/coupon/coupon-list" isActive={isActive("/coupon")} />
                    )}
                    {can(ADMIN_MODULE_KEYS.OFFER) && (
                    <SideBarLinkItem label={labels[ADMIN_MODULE_KEYS.OFFER]} path="/offer/offer-list" isActive={isActive("/offer")} />
                    )}
                     
                </ul>
            </div>
        </div>
    );
};

export default SideNavbar;
