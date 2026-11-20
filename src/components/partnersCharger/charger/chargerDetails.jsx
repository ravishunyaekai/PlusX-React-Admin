import React, { useEffect, useState } from 'react';
import styles from './charger.module.css'
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx'
// import BookingDetailsSection from '../../SharedComponent/Details/BookingDetails/BookingDetailsSection'
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import BookingDetailsAccordion from '../../SharedComponent/BookingDetails/BookingDetailsAccordion.jsx'
import { postRequestWithToken } from '../../../api/Requests.js';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import BookingImageSection from '../../SharedComponent/Details/BookingDetails/BookingImageSection.jsx'
 

import SubHeader from '../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../SharedComponent/Pagination/Pagination';

import PartnerChargingSession from '../../SharedComponent/Details/PartnerChargingSession.jsx';
import ResidentInvoiceList from '../../SharedComponent/Details/ResidentInvoiceList';
import DetailsVehicleList from '../../SharedComponent/Details/DetailsVehicleList';
// MULTI-SELECT COMMUNITY (new): shared helper to format multiple community names for display
import { formatCommunityNamesForDisplay } from '../../../utils/residentCommunityHelpers';
import DashboardCardItem from "./DashboardCard/DashboardCard";


const ChargerDetails = () => {
    const userDetails                           = JSON.parse(sessionStorage.getItem('userDetails'));
    const { residentId }                        = useParams(); 
    const navigate                              = useNavigate();
    const [residentDetails, setResidentDetails] = useState();
    const [vehicleList, setVehicleList]         = useState([]);
    const [filters, setFilters]                 = useState({start_date: null,end_date: null});
     
    const [sessionDetails, setSessionDetails] = useState()
    const staturArr = { 0 : 'In-active', 1: 'Active' }
    
    const fetchDetails = () => {
        const obj = {
            userId      : userDetails?.user_id,
            email       : userDetails?.email,
            resident_id : residentId,
        };
        postRequestWithToken('resident-details', obj, (response) => {
            if (response.code === 200) {
                const data = response?.data || {};
                setResidentDetails(data);
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
        charger_id      : "Charger ID",
        charger_name    : "Charger Name", 
        station         : "Station", 
        admin_status    : "Administrative Status", 
        input_supply    : "Input Supply", 
        output_supply   : "Maximum Output Voltage (V)", 
        sim             : "SIM ICCID", 
        imei            : "IMEI", 
    };
    const sectionTitles1 = {
        manufacturer     : "Manufacturer",
        model            : "Model",
        serial_number    : "Serial Number",
    }
    const sectionTitles2 = {
        charger_type      : "Charger Type",
        rate_power        : "Rated Power (kW)",
        connector_type    : "Connector Type",
    }
    const sectionTitles3 = {
        no_of_connectors      : "Number of Connectors",
        installation_date     : "Installation Date",
    }
    const sectionTitles4 = {
        note  : "Installation Notes",
    }

    const content = {
        // bookingId     : sessionDetails?.charger_id,
        // createdAt     : moment(sessionDetails?.created_at).format('DD MMM YYYY'),
        // chargerId     : sessionDetails?.price,
        charger_id       : sessionDetails?.charger_id,
        charger_name     : sessionDetails?.charger_name,
        station          : sessionDetails?.station,
        admin_status     : sessionDetails?.admin_status ,
        input_supply     : sessionDetails?.input_supply, 
        output_supply    : sessionDetails?.output_supply, 
        sim              : sessionDetails?.output_supply, 
        imei             : sessionDetails?.output_supply, 
    };
    const sectionContent1 = {
        manufacturer : sessionDetails?.manufacturer,
        model    : sessionDetails?.model,
        serial_number : sessionDetails?.serial_number,
    }
    const sectionContent2 = {
        charger_type  : sessionDetails?.charger_type,
        rate_power      : sessionDetails?.rate_power,
        connector_type     : sessionDetails?.connector_type,
    }
    const sectionContent3 = {
        no_of_connectors      : sessionDetails?.no_of_connectors,
        installation_date      : sessionDetails?.installation_date,
    }
    const sectionContent4 = {
        note  : sessionDetails?.note,
    }


    // Session History 
    // const searchTerm = [{
    //     label : 'Search', 
    //     name  : 'search_text', 
    //     type  : 'text'
    // }];
    const fetchFilteredData = (newFilters = {}) => {   
        setFilters(newFilters);  
        setCurrentPage(1); 
    };
    const [sessionList, setSessionList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount]   = useState(0);
    const [totalPages, setTotalPages]   = useState(1);
    const sessionHeaders = [
        "Session ID", "Start Date & Time", "End Date & Time", "Duration", "Energy (kWh)", "Status"
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
                setSessionList(response?.data || []);
                setTotalPages(response?.total_page || response?.totalPage || 1);
                setTotalCount(response?.total || 0)
            }
        });
    };
    useEffect(() => {
        fetchSessionList(currentPage, filters);
    }, [ currentPage, filters ]);

    const cardData = [
        {
            "module": "Voltage",
            "count": "233 V"
        },
        {
            "module": "Current",
            "count": "16.2 A"
        },
        {
            "module": "Energy (Session)",
            "count": "8.5 kWh"
        },
        {
            "module": "Session Duration",
            "count": "32 min"
        },
    ]

    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles} type='partnerCharger' />
            <div className={styles.bookingLeftContainer}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1} sectionTitles2={sectionTitles2} sectionContent2={sectionContent2} 
                    sectionTitles3={sectionTitles3} sectionContent3={sectionContent3}  sectionTitles4={sectionTitles4} sectionContent4={sectionContent4} type='partnerCharger' />
            </div>
            <DashboardCardItem details={cardData} />
            <div style={{margin : "0px 10px 0px 15px" }}>
                <SubHeader heading = "Charging Sessions"
                    count={totalCount}
                    // filterValues={filters}
                    // fetchFilteredData={fetchFilteredData}
                    // searchTerm= {searchTerm}
                />
                <PartnerChargingSession title="" headers={sessionHeaders} bookingData={sessionList} />
                {sessionList.length > 0 && 
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                }
            </div>
        </div>
    )
}
export default ChargerDetails;
