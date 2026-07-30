import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styles from "./sidenavbar.module.css";
import CompanyLogo from "../CompanyLogo";
import SideBarLinkItem from "./SideBarLinkItem";
import SidebarDropdown from "./SidebarDropdown/SidebarDropdown";
import { menuItems } from "./DropdownMenu";

const SideNavbar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openDropdown, setOpenDropdown]   = useState(null);
    const [checkedItems, setCheckedItems]   = useState({
        userList     : { activeUser : false, deletedUser : false },
        driverList   : { driverList : false, truckList : false },
        portableCharger : {
            deviceList     : false,
            areaList       : false,
            // chargerList    : false,
            chargerBooking : false,
            invoiceList    : false,
            timeSlot       : false,
        },
        pickAndDrop        : { bookingList    : false, invoiceList : false, timeSlot : false },
        evRoadAssistance   : { bookingList    : false, invoiceList : false },
        // evPreSalesTesting  : { testingBooking : false, timeSlot    : false },
        // evSpecializedShops : {
        //     shopList     : false,
        //     shopServices : false,
        //     shopBrands   : false,
        // },
        eVSwipeStation      : { bikeList : false, stationList : false },
        chargerInstallation : { stationList : false, chargerList : false, brandList: false, },
        community  : { communityList : false, residentList : false, residentInvoice: false },
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
                    // chargerList    : false,
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
                : { bookingList: false, invoiceList: false },
            // evPreSalesTesting: location.pathname.includes("/ev-pre-sales-testing")
            //     ? prevState.evPreSalesTesting
            //     : { testingBooking: false, timeSlot: false },
            // evSpecializedShops: location.pathname.includes("/ev-specialized")
            //     ? prevState.evSpecializedShops
            //     : { shopList: false, shopServices: false, shopBrands: false },

            eVSwipeStation: location.pathname.includes("/ev-battery-swipe")
                ? prevState.eVSwipeStation : { bikeList: false, stationList: false },

            chargerInstallation: location.pathname.includes("/charger-installation")
                ? prevState.chargerInstallation : { stationList : false, chargerList : false, brandList: false, shareList: false  },
            community: location.pathname.includes("/community")
                ? prevState.community : { communityList : false, residentList : false, residentInvoice: false },
        })); 
        const dropdownPaths = [
            "/portable-charger",
            "/pick-and-drop",
            "/ev-road-assistance",
            // "/ev-pre-sales-testing",
            // "/ev-specialized",
            "/app-signup",
            "/drivers",
            "/ev-battery-swipe",
            "/charger-installation",
            "/community",
            "/charger-share",
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
    // const isActive = (route) => location.pathname.startsWith(route);
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
                    <SideBarLinkItem label="Dashboard" path="/" isActive={isActive("/")} />

                    {/* <SideBarLinkItem label="App Sign Up List" path="/app-signup/app-signup-list" isActive={isActive("/app-signup")} /> activeUser*/}

                    <SidebarDropdown
                        menuName="App Sign Up List"
                        menuItems={menuItems.userList}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) =>
                            handleItemClicked("userList", id, e)
                        }
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.userList}
                    />
                    {/* <SidebarDropdown
                        menuName="Drivers"
                        menuItems={menuItems.driverList}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) =>
                            handleItemClicked("driverList", id, e)
                        }
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.driverList}
                    /> */}
                    <SideBarLinkItem label="Drivers" path="/drivers/driver-list" isActive={isActive("/drivers")} />
                    <SidebarDropdown
                        menuName="Portable Charger"
                        menuItems={menuItems.portableCharger}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) =>
                            handleItemClicked("portableCharger", id, e)
                        }
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.portableCharger}
                    />
                    <SidebarDropdown
                        menuName="Pick & Drop"
                        menuItems={menuItems.pickAndDrop}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) => handleItemClicked("pickAndDrop", id, e)}
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.pickAndDrop}
                    />
                    <SidebarDropdown
                        menuName="EV Road Assistance"
                        menuItems={menuItems.evRoadAssistance}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) =>
                            handleItemClicked("evRoadAssistance", id, e)
                        }
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.evRoadAssistance}
                    />
                    <SideBarLinkItem label="EV Insurance" path="/ev-insurance/ev-insurance-list" isActive={isActive("/ev-insurance")} />
                    <SideBarLinkItem label="Public Chargers Station" path="/public-charger-station/public-charger-station-list" isActive={isActive("/public-charger-station")} />

                    {/* <SidebarDropdown
                        menuName="EV Swipe Station"
                        menuItems={menuItems.eVSwipeStation}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) =>
                            handleItemClicked("eVSwipeStation", id, e)
                        }
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.eVSwipeStation}
                    /> */}
                    <SidebarDropdown
                        menuName="Charger Installation"
                        menuItems={menuItems.chargerInstallation}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) =>
                            handleItemClicked("chargerInstallation", id, e)
                        }
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.chargerInstallation}
                    />
                    <SidebarDropdown
                        menuName="Community Charger"
                        menuItems={menuItems.community}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) =>
                            handleItemClicked("community", id, e)
                        }
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.community}
                    />
                    <SideBarLinkItem label="Charge Share Listings"  path="/charger-share/request-list"  isActive={isActive("/charger-share")} />

                    {/* <SidebarDropdown
                        menuName="EV Specialized Shops"
                        menuItems={menuItems.evSpecializedShops}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) =>
                            handleItemClicked("evSpecializedShops", id, e)
                        }
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.evSpecializedShops}
                    />

                    <SideBarLinkItem label="Electric Car Leasing" path="/electric-car-leasing/electric-car-list" isActive={isActive("/electric-car-leasing")} />

                    <SideBarLinkItem label="Electric Bike Leasing" path="/electric-bike-leasing/electric-bike-list" isActive={isActive("/electric-bike-leasing")} />
                    <SideBarLinkItem label="EV Guide" path="/ev-guide/ev-guide-list" isActive={isActive("/ev-guide")} />
                    
                    <SideBarLinkItem label="EV Rider Clubs" path="/ev-rider-club/club-list" isActive={isActive("/ev-rider-club")} />
                    <SideBarLinkItem label="EV Discussion Board" path="/discussion-board/discussion-board-list" isActive={isActive("/discussion-board")} />
                    
                    <SidebarDropdown
                        menuName="EV Pre-Sales Testing"
                        menuItems={menuItems.evPreSalesTesting}
                        openDropdown={openDropdown}
                        handleItemClick={(id, e) =>
                            handleItemClicked("evPreSalesTesting", id, e)
                        }
                        toggleDropdown={toggleDropdown}
                        checkedItems={checkedItems.evPreSalesTesting}
                    /> */}
                    
                    {/* <SideBarLinkItem label="EV Buy & Sell" path="/ev-buy-sell/ev-buy-list" isActive={isActive("/ev-buy-sell")} /> */}
                    
                    <SideBarLinkItem label="Coupon" path="/coupon/coupon-list" isActive={isActive("/coupon")} />
                    <SideBarLinkItem label="Offer" path="/offer/offer-list" isActive={isActive("/offer")} />
                    {/* <SideBarLinkItem label="Register Interest" path="/interest-list" isActive={isActive("/interest-list")} /> */}
                    {/* <SideBarLinkItem label="Subscription Package" path="/subscription/subscription-list" isActive={isActive("/subscription")} /> */}
                    {/* <SideBarLinkItem label="Partners" path="/partners/partner-list" isActive={isActive("/partners")} /> */}
                </ul>
            </div>
        </div>
    );
};

export default SideNavbar;
