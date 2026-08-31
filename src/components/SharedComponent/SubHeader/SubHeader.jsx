import React, { useState, useEffect } from 'react';
import styles from './subheader.module.css';
import Plus from '../../../assets/images/Plus.svg';
import Filter from '../../../assets/images/Filter.svg';
import Search from '../../../assets/images/Search.svg';
import Download from '../../../assets/images/Download.svg'
import SearchAccordion from '../Accordion/SearchAccodion';
import AccordionFilter from '../Accordion/Accordions';
import { Link } from 'react-router-dom';
import FormModal from '../CustomModal/FormModal';
import ModalAssign from '../BookingDetails/ModalAssign'
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { postRequestWithToken } from '../../../api/Requests';
import { useNavigate } from 'react-router-dom';

const SubHeader = ({ heading, fetchFilteredData, dynamicFilters, filterValues, addButtonProps, searchTerm, count, modalTitle, setRefresh,apiEndPoint, nameKey, setDownloadClicked, handleDownloadClick, scheduleDateChange, scheduleFilters, areaOptions, areaSelected, handleArea, rowOptions, rowSelected, handleRowperPagePage }) => {

    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate    = useNavigate();
    
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
    }, []);
    const departmentId = userDetails?.departmentId || '';

    const [isSearchAccordionOpen, setIsSearchAccordionOpen] = useState(false);
    const [isFilterAccordionOpen, setIsFilterAccordionOpen] = useState(false);
    const [showPopup, setShowPopup]                         = useState(false);
    const [name, setName]                                   = useState("");

    const handleAddClick = () => {
        setShowPopup(true); 
    };
    const handleClosePopup = () => {
        setShowPopup(false); 
        setName("");
    };
    const handleReasonChange = (e) => {
        setName(e.target.value); 
    };
    const handleConfirmAdd = () => {
        if (!name.trim()) {
            toast("Please enter name.", {type:'error'})
            return;
        }
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            [nameKey]  : name
        };
        postRequestWithToken(apiEndPoint, obj, async (response) => {
            if (response.code === 200) {
                toast(response.message, {type:'success'})
                    setTimeout(() => {
                        setName("");
                        setRefresh(prev => !prev);
                    }, 1000);
                setShowPopup(false);
            } else {
                toast(response.message, {type:'error'})
                console.log(`Error in ${apiEndPoint} API`, response);
            }
        });
    };
    const toggleSearchAccordion = () => {
        setIsSearchAccordionOpen(!isSearchAccordionOpen);
        setIsFilterAccordionOpen(false);
    };

    const toggleFilterAccordion = () => {
        setIsFilterAccordionOpen(!isFilterAccordionOpen);
        setIsSearchAccordionOpen(false);
    };
    // Renamed display: "Portable Charger ..." -> "Mobile & Portable EV Charging Service ..."
    // shouldShowFilterButtonArr = "Portable Charger Slot List", "Pick & Drop Time Slot List", "Ev Insurance List",
    // "Resident List" removed — filter with community dropdown is now enabled for this page
    const shouldShowFilterButtonArr = [  "Offer List", "Time Slot List" , "Register Interest List","Ev Buy & Sell List","Mobile & Portable EV Charging Service List",'Ev Specialized Shop List', "Ev Specialized Shop Service List", "Ev Specialized Shop Brand List","Ev Discussion Board List", "Ev Rider Clubs List" ,  "Notification List", "Electric Cars Leasing List", "Electric Bikes Leasing List", "EV Guide List", 'Bike List', 'Swipe Station List', 'EV Charger Brand List',"Community List"]
    const shouldShowFilterButton = !shouldShowFilterButtonArr.includes(heading)

    // "Resident List" removed — search is now enabled for this page
    const shouldShowSearchButtonArr = [ "Ev Road Assistance Invoice List" , "Pick & Drop Invoice List", "Notification List", "Ev Buy Sell List", "Offer List", "Pick & Drop Time Slot List","Mobile & Portable EV Charging Service Slot List" ,"Time Slot List",'Top Rated Area',"Community List"]
    const shouldShowSearchButton = !shouldShowSearchButtonArr.includes(heading)

    // "Portable Charger Booking List" / "Portable Charger Invoice List"
    const shouldShowAddButtonArr = ["App Signup List", "Mobile & Portable EV Charging Service Booking List", "Pick & Drop Booking List", "Mobile & Portable EV Charging Service Invoice List", "Notification List", "Pick & Drop Invoice List", "Charger Installation Booking List", "Ev Road Assitance Booking List","Road Assistance Invoice List", "Board List", "Insurance List", "Buy Sell List", "Interest List","Subscription List", "EV Pre-Sale Testing Booking List", "Ev Road Assistance Invoice List", "Ev Discussion Board List","Ev Insurance List", "Ev Buy & Sell List", "Register Interest List", "Customer POD Booking List", "Failed POD Booking List", "Failed Pick & Drop Booking List", "Deleted Account List", "Failed RSA Booking List", "EV Accessories Bookings", "Fixed Charger Bookings", "Charger Share List",'Top Rated Area', "Session History", "Invoice History"] ; 
        
    // "Portable Charger Booking List"
    const shouldShowDownloadButtonArr = ["App Signup List", "Mobile & Portable EV Charging Service Booking List",];
    const shouldShowDownloadButton = shouldShowDownloadButtonArr.includes(heading)

    const shouldShowAddButton = !shouldShowAddButtonArr.includes(heading);
    // "Portable Charger Booking List"
    const cardArray = [ "App Signup List", "Mobile & Portable EV Charging Service Booking List", "Offer List", "Subscription List", "Coupon List", "Register Interest List", "Ev Buy & Sell List", "Ev Specialized Shop List", "Ev Insurance List", "Ev Discussion Board List", "Ev Rider Clubs List", "EV Guide List", "Electric Bikes Leasing List", "Electric Cars Leasing List", "Public Chargers List", "Failed POD Booking List", "Failed Pick & Drop Booking List", "Deleted Account List", "Failed RSA Booking List", 'EV Charger List', 'EV Accessories List', 'Ev Road Assitance Booking List', "RSA Offline Leads", "Pick & Drop Booking List", "Community List", "Resident List", "Invoice List", "Session History", "Invoice History", "Charger Installation Inquiry Tracking"]

    const showCard = cardArray.includes(heading);
    // "Portable Charger List", "Portable Charger Invoice List", "Portable Charger Slot List"
    const headingArray = [ "Drivers List",  "Mobile & Portable EV Charging Service List", "Mobile & Portable EV Charging Service Invoice List", "Mobile & Portable EV Charging Service Slot List", "Pick & Drop Invoice List", "Pick & Drop Time Slot List", "Charger Installation Booking List", "Notification List", "EV Pre-Sale Testing Booking List", "Time Slot List", "Ev Road Assistance Invoice List", "Ev Specialized Shop Service List", "Ev Specialized Shop Brand List", "Add POD List", "POD Brand List", "POD Device List","POD Area List", "Customer POD Booking List", "Partners List", "Truck List", 'Bike List', 'Swipe Station List', 'EV Charger Brand List', 'Roadside Assistance Slot List', 'EV Products & Installation', "EV Accessories Bookings", "Fixed Charger Bookings", "Charger Share List",'Top Rated Area'] //"Ev Road Assitance Booking List", "Pick & Drop Booking List", 

    const showHeading = headingArray.includes(heading);  // "Portable Charger Booking List",

    return (
        <div className={styles.subHeaderContainer}>
            <div className={styles.headerCharger}>
                { showHeading && (
                    <div className={styles.headingList}>{heading} </div>
                )}
                {showCard && (
                    <div className={styles.headCardSection}>
                        <div className={styles.headCardNumber}>{count || 0}</div>
                        <div className={styles.headCardText}>Total {heading}</div>
                    </div>
                )}
                <div className={styles.subHeaderButtonSection}>
                    {shouldShowAddButton && departmentId == 1 && (
                        (heading === "Ev Specialized Shop Brand List" || heading === "Ev Specialized Shop Service List" || heading === "EV Charger Brand List") ? (
                            <div className={styles.addButtonSection} 
                            onClick={handleAddClick}
                            >
                                <div className={styles.addButtonImg}>
                                    <img src={Plus} alt='plus' />
                                </div>
                                <div className={styles.addButtonText}>{addButtonProps?.heading}</div>
                            </div>
                        ) : (
                            <Link to={addButtonProps?.link}>
                                <div className={styles.addButtonSection}>
                                    <div className={styles.addButtonImg}>
                                        <img src={Plus} alt='plus' />
                                    </div>
                                    <div className={styles.addButtonText}>{addButtonProps?.heading}</div>
                                </div>
                            </Link>
                        )
                    )}
                    {/* Search Button */}
                    {shouldShowSearchButton && (
                        <div className={styles.addButtonSection} onClick={toggleSearchAccordion}>
                            <div className={styles.addButtonImg}>
                                <img src={Search} alt='Search' />
                            </div>
                            <div className={styles.addButtonText}>Search</div>
                        </div>
                    )}

                    {/* Filter Button */}
                    {shouldShowFilterButton && (
                        <div className={styles.addButtonSection} onClick={toggleFilterAccordion}>
                            <div className={styles.addButtonImg}>
                                <img src={Filter} alt='Filter' />
                            </div>
                            <div className={styles.addButtonText}>Filter</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Render SearchAccordion when isSearchAccordionOpen is true */}
            {isSearchAccordionOpen && (
                <SearchAccordion
                    type={heading}
                    isOpen={isSearchAccordionOpen}
                    fetchFilteredData={fetchFilteredData}
                    searchTerm={searchTerm}
                    filterValues={filterValues}
                />
            )}

            {isFilterAccordionOpen && (
                <AccordionFilter
                    type={heading}
                    isOpen={isFilterAccordionOpen}
                    fetchFilteredData={fetchFilteredData}
                    dynamicFilters={dynamicFilters}
                    filterValues={filterValues}
                    scheduleDateChange={scheduleDateChange}
                    scheduleFilters={scheduleFilters}
                    areaOptions={areaOptions}
                    areaSelected={areaSelected}
                    handleArea={handleArea}
                    rowOptions           = {rowOptions}
                    rowSelected          = {rowSelected}
                    handleRowperPagePage = {handleRowperPagePage}
                    searchTerm={searchTerm}
                />
            )}

            {showPopup && (
                <ModalAssign
                    isOpen={showPopup}
                    onClose={handleClosePopup}
                    onAssign={handleConfirmAdd}
                    buttonName = 'Submit'
                >
                    <div className="modalHeading">{modalTitle}</div>
                    <input
                        id="name"
                        placeholder={modalTitle}
                        className="modal-textarea"
                        value={name} 
                        onChange={handleReasonChange}
                                
                    />
                </ModalAssign>
                
            )}
        </div>
    );
};

export default SubHeader;

