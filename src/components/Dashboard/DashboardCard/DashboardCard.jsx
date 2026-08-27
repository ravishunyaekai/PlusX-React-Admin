import React from "react";
import style from "./DashboardCard.module.css";
import DashboardCardItem from "../../SharedComponent/DashboardCardItem/DashboardCardItem";
import { useSelector, useDispatch } from "react-redux";
import { setActiveCardIndex } from "../../../store/dashboardSlice";

// Card Images
import AppSignUpImage from "../../../assets/images/DashboardCardIcons/Total App Sign Up.svg";
import ChargerInstallationImage from "../../../assets/images/DashboardCardIcons/Charger Installation.svg";
import EVRiderClubImage from "../../../assets/images/DashboardCardIcons/EV Rider Club.svg";
import EVSpecializedShopsImage from "../../../assets/images/DashboardCardIcons/EV Specialized Shops.svg";
import ActiveOfferImage from "../../../assets/images/DashboardCardIcons/Total Active Offer.svg";
import EVBuyAndSellImage from "../../../assets/images/DashboardCardIcons/Total EV Buy & Sell.svg";
import EVDiscussionBoardImage from "../../../assets/images/DashboardCardIcons/Total EV Discussion Board.svg";
import EVGuideImage from "../../../assets/images/DashboardCardIcons/Total EV Guide.svg";
import EVInsuranceImage from "../../../assets/images/DashboardCardIcons/Total EV Insurance.svg";
import EVPreSalesImage from "../../../assets/images/DashboardCardIcons/Total EV Pre-Sales Testing.svg";
import EVRoadAssitanceImage from "../../../assets/images/DashboardCardIcons/Total EV Road Assitance.svg";
import ElectricBikeLeasingImage from "../../../assets/images/DashboardCardIcons/Total Electric Bike Leasing.svg";
import ElectricCarLeasingImage from "../../../assets/images/DashboardCardIcons/Total Electric Car Leasing.svg";
import NoOfRegsDriverImage from "../../../assets/images/DashboardCardIcons/No of Regs Driver.svg";
import PickAndDropImage from "../../../assets/images/DashboardCardIcons/Total Pick & Drop.svg";
import PODBooking from "../../../assets/images/DashboardCardIcons/POD Booking.svg";
import PublicChargersImage from "../../../assets/images/DashboardCardIcons/Total Public Chargers.svg";
import TotalRegisterYourInterestImage from "../../../assets/images/DashboardCardIcons/Total Register Your Intrest.svg";

const DashboardCard = ({ details }) => {
  const dispatch = useDispatch();
  const activeCardIndex = useSelector((state) => state.dashboard.activeCardIndex);

  const handleCardClick = (index) => {
    dispatch(setActiveCardIndex(index));
  };

  const cardData = [
    {
        icon  : AppSignUpImage,
        count : details?.find((item) => item.module === "App Sign Up")?.count || 0,
        title : "App Sign Up",
        route : "/app-signup/app-signup-list",
    },  {
        icon  : PODBooking,
        // API module key stays "POD Bookings" — do not change
        count : details?.find((item) => item.module === "POD Bookings")?.count || 0,
        // title : "POD Bookings", // old heading
        title : "Mobile & Portable EV Charging Bookings", // new heading
        route : "/portable-charger/charger-booking-list",
    }, {
        icon  : PickAndDropImage,
        count : details?.find((item) => item.module === "Pickup & Dropoff Bookings") ?.count || 0,
        title : "Pick & Drop off Bookings",
        route : "/pick-and-drop/booking-list",
    },  {
        icon  : EVRoadAssitanceImage,
        count : details?.find((item) => item.module === "EV Road Assistance")?.count || 0,
        title : "EV Roadside Assistance Bookings",
        route : "/ev-road-assistance/booking-list",
    },{
        icon  : EVRoadAssitanceImage,
        count : details?.find((item) => item.module === "EV Insurance Leads")?.count || 0,
        title : "EV Insurance Leads",
        route : "/ev-insurance/ev-insurance-list",
    }, {
        icon  : ChargerInstallationImage,
        count : details?.find((item) => item.module === "Charger Installation Bookings") ?.count || 0,
        title : "Charger Installation Bookings",
        route : "/charger-installation/charger-installation-list",
    }, {
        icon  : PODBooking,
        count : details?.find((item) => item.module === "Today POD Failed Bookings")?.count || 0,
        title : "Incomplete POD Bookings", 
        route : "/portable-charger/failed-booking-list",
    }, {
        icon  : PickAndDropImage,
        count : details?.find((item) => item.module === "Today Pickup & Dropoff Failed Bookings") ?.count || 0,
        title : "Incomplete Pickup & Drop Off Bookings",
        route : "/pick-and-drop/failed-booking-list",
    },
    {
        icon  : PickAndDropImage,
        count : details?.find((item) => item.module === "Today Road Side Failed Bookings") ?.count || 0,
        title : "Incomplete Roadside Assistance Bookings",
        route : "/ev-road-assistance/failed-booking-list",
    }, {
        icon  : NoOfRegsDriverImage,
        count : details?.find((item) => item.module === "No. of Regs. Drivers") ?.count || 0,
        title : "Active Drivers",
        route : "/drivers/driver-list",
    }, 
    {
        icon  : ChargerInstallationImage,
        count : details?.find((item) => item.module === "EV Chargers Booking") ?.count || 0,
        title : "EV Chargers Booking",
        route : "/charger-installation/ev-charger-booking-list",
    },
    {
        icon  : ChargerInstallationImage,
        count : details?.find((item) => item.module === "EV Accessories Booking") ?.count || 0,
        title : "EV Accessories Booking",
        route : "/charger-installation/ev-accessories-booking-list",
    },
    {
        icon  : EVPreSalesImage,
        count : details?.find((item) => item.module === "Charger Share List") ?.count || 0,
        title : "Charge Share Listing Requests",
        route : "/charger-share/request-list",
    },  
    // {
    //     icon  : PODBooking,
    //     count : details?.find((item) => item.module === "EV Battery Swipe Station") ?.count || 0,
    //     title : "EV Battery Swipe Station",
    //     route : "/ev-battery-swipe/station-list",
    // }, 
    // {
    //   icon: PublicChargersImage, 
    //   count:
    //     details?.find((item) => item.module === "Total Public Chargers")
    //       ?.count || 0,
    //   title: "Total Public Chargers",
    //   route: "/public-charger-station-list",
    // },
    // {
    //   icon: ElectricBikeLeasingImage,
    //   count:
    //     details?.find((item) => item.module === "Total Electric Bikes Leasing")
    //       ?.count || 0,
    //   title: "Total Electric Bike Leasing",
    //   route: "/electric-bike-list",
    // },
    // {
    //   icon: ElectricCarLeasingImage,
    //   count:
    //     details?.find((item) => item.module === "Total Electric Cars Leasing")
    //       ?.count || 0,
    //   title: "Total Electric Car Leasing",
    //   route: "/electric-car-list",
    // },
    // {
    //   icon: EVGuideImage,
    //   count:
    //     details?.find((item) => item.module === "Total EV Guide")?.count || 0,
    //   title: "Total EV Guide",
    //   route: "/ev-guide-list",
    // },
    
    // {
    //   icon: EVRiderClubImage,
    //   count:
    //     details?.find((item) => item.module === "Total EV Rider Clubs")
    //       ?.count || 0,
    //   title: "Total EV Rider Club",
    //   route: "/club-list",
    // },
    // {
    //   icon: EVDiscussionBoardImage,
    //   count:
    //     details?.find((item) => item.module === "Total EV Discussion Board")
    //       ?.count || 0,
    //   title: "Total EV Discussion Board",
    //   route: "/discussion-board-list",
    // },
    // {
    //   icon: EVInsuranceImage,
    //   count:
    //     details?.find((item) => item.module === "Total EV Insurance")?.count ||
    //     0,
    //   title: "Total EV Insurance",
    //   route: "/ev-insurance-list",
    // },
    
    // {
    //   icon: EVSpecializedShopsImage,
    //   count:
    //     details?.find((item) => item.module === "Total EV Specialized Shop")
    //       ?.count || 0,
    //   title: "Total EV Specialized Shops",
    //   route: "/ev-specialized/shop-list",
    // },
    // {
    //   icon: EVBuyAndSellImage,
    //   count:
    //     details?.find((item) => item.module === "EV Buy & Sell")?.count || 0,
    //   title: "EV Buy & Sell",
    //   route: "/ev-buy-sell",
    // },
    // {
    //   icon: ActiveOfferImage,
    //   count:
    //     details?.find((item) => item.module === "Total Active Offer")?.count ||
    //     0,
    //   title: "Total Active Offer",
    //   route: "/offer-list",
    // },
    // {
    //   icon: TotalRegisterYourInterestImage,
    //   count:
    //     details?.find((item) => item.module === "Total Register your Interest")
    //       ?.count || 0,
    //   title: "Total Register Your Interest",
    //   route: "/interest-list",
    // },
  ];
  return (
    <div className={style.dashboardCardItem}>
      {cardData.map((data, index) => (
        <DashboardCardItem
          key={index}
          icon={data.icon}
          count={data.count}
          title={data.title}
          route={data.route}
          isActive={activeCardIndex === index}
          onClick={() => handleCardClick(index)}
        />
      ))}
    </div>
  );
};

export default DashboardCard;
