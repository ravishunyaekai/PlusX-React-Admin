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
 
const InvoiceDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const { sessionId }                       = useParams(); 
    const navigate                            = useNavigate();
    const [sessionDetails, setSessionDetails] = useState();
     
    const fetchDetails = () => {
        const obj = {
            userId      : userDetails?.user_id,
            email       : userDetails?.email,
            session_id : sessionId,
        };
        postRequestWithToken('session-detail', obj, (response) => {
            if (response.code === 200) {
                setSessionDetails(response?.data || {});
                 
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
        bookingIdTitle       : "Session ID",
        customerDetailsTitle : "Resident Details",
    };
    const content = {
        bookingId       : sessionDetails?.booking_id,
        createdAt       : moment(sessionDetails?.created_at).format('DD MMM YYYY h:mm A'),
        customerName    : sessionDetails?.resident_name,
        customerContact : `+971 ${sessionDetails?.resident_mobile}`
    };
    
    const sectionTitles1 = {
        community_name : "Community Name",
        area_name      : "Area Name",
        charger_id     : "Charger ID",

        total_consumption : "Total Consumption",
        total_duration    : "Total Duration ",
        extra_minutes     : "Over Time ( Min)",

        start_time : "Start Time",
        end_time   : "End Time",
        start_kwh  : "Start kWh",
        end_kwh    : "End kWh",
        status     : "Status",
    }
    const sectionContent1 = {
        community_name : sessionDetails?.community_name,
        area_name      : sessionDetails?.area_name,
        charger_id     : sessionDetails?.charger_id,
       
        total_consumption : Number(sessionDetails?.total_consumption || 0 ).toFixed(2),
        total_duration    : Number(sessionDetails?.total_duration || 0 ).toFixed(2),
        extra_minutes     : Number(sessionDetails?.extra_minutes || 0 ).toFixed(2),
 
        start_time : moment(sessionDetails?.start_time).format('h:mm A'),
        end_time   : moment(sessionDetails?.end_time).format('h:mm A'),
        start_kwh  : Number(sessionDetails?.start_kwh || 0 ).toFixed(2),
        end_kwh    : Number(sessionDetails?.end_kwh || 0 ).toFixed(2),

        status       : sessionDetails?.session_status,
    }
    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles} type='chargerInstallation' />
            <div className={styles.bookingLeftContainer}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1} 
                type='chargerInstallation' />
            </div>
        </div>
    )
}
export default InvoiceDetails
