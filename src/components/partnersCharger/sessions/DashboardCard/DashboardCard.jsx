import React from "react";
import style from "./DashboardCard.module.css";
import DashboardCardItem from "../../../SharedComponent/DashboardCardItem/DashboardCardItem";
import { useSelector, useDispatch } from "react-redux";
import { setActiveCardIndex } from "../../../../store/partnerdashboardSlice";
import { ADMIN_MODULE_KEYS } from "../../../../constants/adminModules";
import { ensureSessionUserDetails, hasModuleAccess } from "../../../../utils/adminAccess";

// Card Images
import AppSignUpImage from "../../../../assets/images/DashboardCardIcons/Total App Sign Up.svg";
import ChargerInstallationImage from "../../../../assets/images/DashboardCardIcons/Charger Installation.svg";
import EVRiderClubImage from "../../../../assets/images/DashboardCardIcons/EV Rider Club.svg";
import EVSpecializedShopsImage from "../../../../assets/images/DashboardCardIcons/EV Specialized Shops.svg";
import ActiveOfferImage from "../../../../assets/images/DashboardCardIcons/Total Active Offer.svg";
import EVBuyAndSellImage from "../../../../assets/images/DashboardCardIcons/Total EV Buy & Sell.svg";
import EVDiscussionBoardImage from "../../../../assets/images/DashboardCardIcons/Total EV Discussion Board.svg";
import EVGuideImage from "../../../../assets/images/DashboardCardIcons/Total EV Guide.svg";
import EVInsuranceImage from "../../../../assets/images/DashboardCardIcons/Total EV Insurance.svg";
import EVPreSalesImage from "../../../../assets/images/DashboardCardIcons/Total EV Pre-Sales Testing.svg";
import EVRoadAssitanceImage from "../../../../assets/images/DashboardCardIcons/Total EV Road Assitance.svg";
import ElectricBikeLeasingImage from "../../../../assets/images/DashboardCardIcons/Total Electric Bike Leasing.svg";
import ElectricCarLeasingImage from "../../../../assets/images/DashboardCardIcons/Total Electric Car Leasing.svg";
import NoOfRegsDriverImage from "../../../../assets/images/DashboardCardIcons/No of Regs Driver.svg";
import PickAndDropImage from "../../../../assets/images/DashboardCardIcons/Total Pick & Drop.svg";
import PublicChargersImage from "../../../../assets/images/DashboardCardIcons/Total Public Chargers.svg";
import TotalRegisterYourInterestImage from "../../../../assets/images/DashboardCardIcons/Total Register Your Intrest.svg";

const DashboardCard = ({ details }) => {
  const dispatch = useDispatch();
  const activeCardIndex = useSelector((state) => state.partnerDashboard.activeCardIndex);
  const userDetails = ensureSessionUserDetails();

  const handleCardClick = (index) => {
    dispatch(setActiveCardIndex(index));
  };

  const cardData = [
    {
        moduleKey : ADMIN_MODULE_KEYS.PARTNERS,
        icon  : PublicChargersImage,
        count : details?.find((item) => item.module === "Active Sessions")?.count ?? 0,
        title : "Active Sessions",
        // route : "/partners/charger-list",
    },
    {
        moduleKey : ADMIN_MODULE_KEYS.PARTNERS,
        icon  : ChargerInstallationImage,
        count : details?.find((item) => item.module === "Avg Duration")?.count ?? '—',
        title : "Avg Duration",
        // route : "/partners/charger-list",
    },
  ];
  const visibleCards = cardData.filter((card) => hasModuleAccess(userDetails, card.moduleKey));

  return (
    <div className={style.dashboardCardItem}>
      {visibleCards.map((data, index) => (
        <DashboardCardItem
          key={index}
          icon={data.icon}
          count={data.count}
          title={data.title}
          isActive={activeCardIndex === index}
          onClick={(e) => {
            e?.preventDefault?.();
            handleCardClick(index);
          }}
        />
      ))}
    </div>
  );
};

export default DashboardCard;
