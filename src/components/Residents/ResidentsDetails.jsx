import React, { useEffect, useState } from 'react';
import styles from './Residents.module.css'
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx'
// import BookingDetailsSection from '../SharedComponent/Details/BookingDetails/BookingDetailsSection'
import BookingLeftDetails from '../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import BookingDetailsAccordion from '../SharedComponent/BookingDetails/BookingDetailsAccordion.jsx'
import { postRequestWithToken } from '../../api/Requests.js';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import BookingImageSection from '../SharedComponent/Details/BookingDetails/BookingImageSection.jsx'
 

import SubHeader from '../SharedComponent/SubHeader/SubHeader';
import Pagination from '../SharedComponent/Pagination/Pagination';

import ResidentSessionList from '../SharedComponent/Details/ResidentSessionList';
import ResidentInvoiceList from '../SharedComponent/Details/ResidentInvoiceList';
// MULTI-SELECT COMMUNITY (new): shared helper to format multiple community names for display
import { formatCommunityNamesForDisplay } from '../../utils/residentCommunityHelpers';

const ResidentsDetails = () => {
    const userDetails                           = JSON.parse(sessionStorage.getItem('userDetails'));
    const { residentId }                        = useParams(); 
    const navigate                              = useNavigate();
    const [residentDetails, setResidentDetails] = useState();
    const [filters, setFilters]                 = useState({start_date: null,end_date: null});
     
    const staturArr = { 0 : 'In-active', 1: 'Active' }
    
    const fetchDetails = () => {
        const obj = {
            userId      : userDetails?.user_id,
            email       : userDetails?.email,
            resident_id : residentId,
        };
        postRequestWithToken('resident-details', obj, (response) => {
            if (response.code === 200) {
                setResidentDetails(response?.data || {});
                 
            } else {
                console.log('error in charger-installation-details API', response);
            }
        });
    };
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchDetails();
    }, []);

    const headerTitles = {
        bookingIdTitle       : "Resident ID",
        customerDetailsTitle : "Resident Details",
    };
    const content = {
        bookingId       : residentDetails?.resident_id,
        createdAt       : moment(residentDetails?.created_at).format('DD MMM YYYY h:mm A'),
        customerName    : residentDetails?.resident_name,
        customerContact : `+971 ${residentDetails?.resident_mobile}`,
    };
    const sectionTitles1 = {
        resident_email             : "Email Address",
        // SINGLE-SELECT COMMUNITY (old):
        // community_name             : "Community Name",
        // MULTI-SELECT COMMUNITY (new): label updated to reflect multiple communities
        community_name             : "Communities",
        // AREA NAME (old): area_name: "Area Name",
        address                    : "Full Address",
        monthly_session_allocation : "Monthly Session Allocation",
        alloted_time               : "Allocated Time In Minutes",
        kwh_allocated              : "kWh Allocation/Month",
        per_kwh_charge             : "Per kWh Charge (AED)",
        extra_charge               : "Extra Charge/Min Over Allocated Time (AED)",
        status                     : "Status",
    }
    const sectionContent1 = {
        resident_email             : residentDetails?.resident_email,
        // SINGLE-SELECT COMMUNITY (old):
        // community_name             :  residentDetails?.community_name,
        // MULTI-SELECT COMMUNITY (new): comma-separated names from API (supports legacy single field too)
        community_name             : formatCommunityNamesForDisplay(residentDetails),
        // AREA NAME (old): area_name: residentDetails?.area_name,
        address                    : residentDetails?.address,
        monthly_session_allocation : residentDetails?.monthly_session_allocation,
        alloted_time               : residentDetails?.alloted_time,
        kwh_allocated              : residentDetails?.kwh_allocated,
        per_kwh_charge             : residentDetails?.per_kwh_charge,
        extra_charge               : residentDetails?.extra_charge,
        status                     : staturArr[residentDetails?.status],
    }


    // Session History 
    const searchTerm = [{
        label : 'Search', 
        name  : 'search_text', 
        type  : 'text'
    }];
    const fetchFilteredData = (newFilters = {}) => {   
        setFilters(newFilters);  
        setCurrentPage(1); 
    };
    const [sessionList, setSessionList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount]   = useState(0);
    const [totalPages, setTotalPages]   = useState(1);
    const sessionHeaders = [
        "Date", "Session ID", "Resident Name", "Area", "Charger ID", "kWh Used", "Duration (In Min.)", "Status", "Action"
    ];
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const fetchSessionList = (page, appliedFilters = {}) => {
        const obj = {
            userId      : userDetails?.user_id,
            email       : userDetails?.email,
            resident_id : residentId,
            page_no     : page,
            ...appliedFilters,
        };
        postRequestWithToken('session-list', obj, (response) => {
            if (response.code === 200) {
                setSessionList(response?.data);
                setTotalPages(response?.totalPage || 1);
                setTotalCount(response?.total || 0)
            }
        });
    };
    useEffect(() => {
        fetchSessionList(currentPage, filters);
    }, [ currentPage, filters ]);


    // Invoice History
    const invoiceSearchTerm = [{
        label : 'Search', 
        name  : 'search_text', 
        type  : 'text'
    }];
    const invoiceFetchFilteredData = (newFilters = {}) => {   
        setFilters(newFilters);  
        setCurrentPage(1); 
    };
    const [invoiceList, setInvoiceList]               = useState([]);
    const [invoiceCurrentPage, setInvoiceCurrentPage] = useState(1);
    const [invoicetotalCount, setInvoiceTotalCount]   = useState(0);
    const [invoicetotalPages, setInvoiceTotalPages]   = useState(1);
    const invoiceHeaders = [
        // COMMUNITY & AREA COLUMNS (old):
        // "Invoice ID", "Resident Name", "Community", "Area", "kWh Allocated", "kWh Used", "Per kW Charge", "Price (AED)", "Over Time (AED)", "Total (AED)", "Status", "Action"
        "Invoice ID", "Resident Name", "kWh Allocated", "kWh Used", "Per kW Charge", "Price (AED)", "Over Time (AED)", "Total (AED)", "Status", "Action"
    ];
    const invoiceHandlePageChange = (pageNumber) => {
        setInvoiceCurrentPage(pageNumber);
    };
    // const fetchInvoiceList = (page, appliedFilters = {}) => {
    //     const obj = {
    //         userId          : userDetails?.user_id,
    //         email           : userDetails?.email,
    //         resident_mobile : residentDetails?.resident_mobile,
    //         page_no         : page,
    //         ...appliedFilters,
    //     };
    //     postRequestWithToken('scan-charge-invoice-list', obj, (response) => {
    //         if (response.code === 200) {
    //             setInvoiceList(response?.data);
    //             setInvoiceTotalPages(response?.totalPage || 1);
    //             setInvoiceTotalCount(response?.total || 1)
    //         }
    //     });
    // };
    // useEffect(() => {
    //     fetchInvoiceList(currentPage, filters);
    // }, [ currentPage, filters ]);

    const fetchInvoiceList = (page, appliedFilters = {}) => {
        
        if(!residentDetails?.resident_mobile) return false;
        const obj = {
            userId          : userDetails?.user_id,
            email           : userDetails?.email,
            resident_mobile : residentDetails?.resident_mobile,
            page_no         : page,
            ...appliedFilters,
        };
        postRequestWithToken('scan-charge-invoice-list', obj, (response) => {
            if (response.code === 200) {
                setInvoiceList(response?.data);
                setInvoiceTotalPages(response?.totalPage || 1);
                setInvoiceTotalCount(response?.total || 0)
            }
        });
    };
    useEffect(() => {
        fetchInvoiceList(currentPage, filters);
    }, [ residentDetails, currentPage, filters ]);

    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles} type='chargerInstallation' />
            <div className={styles.bookingLeftContainer}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1} 
                type='chargerInstallation' />
            </div>
            <div style={{margin : "0px 10px 0px 15px" }}>
                <SubHeader heading = "Session History"
                    count={totalCount}
                    filterValues={filters}
                    fetchFilteredData={fetchFilteredData}
                    searchTerm= {searchTerm}
                />
                <ResidentSessionList
                    title=""
                    headers={sessionHeaders}
                    bookingData={sessionList}
                />
                {sessionList.length > 0 && 
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                }
            </div>
            <div style={{margin : "0px 10px 0px 15px" }}>
                <SubHeader heading = "Invoice History"
                    count={invoicetotalCount}
                    filterValues={invoiceSearchTerm}
                    fetchFilteredData={invoiceFetchFilteredData}
                    searchTerm= {invoiceSearchTerm}
                />
                <ResidentInvoiceList
                    title=""
                    headers={invoiceHeaders}
                    bookingData={invoiceList}
                />
                {invoiceList.length > 0 && 
                    <Pagination
                        currentPage={invoiceCurrentPage}
                        totalPages={invoicetotalPages}
                        onPageChange={invoiceHandlePageChange}
                    />
                }
            </div>
        </div>
    )
}
export default ResidentsDetails
