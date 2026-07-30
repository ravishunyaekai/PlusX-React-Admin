import React, { useEffect, useState } from 'react';
import styles from '../chargerinstallation.module.css'
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader'
import BookingDetailsSection from '../../SharedComponent/Details/BookingDetails/BookingDetailsSection'
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import BookingDetailsAccordion from '../../SharedComponent/BookingDetails/BookingDetailsAccordion.jsx'
import { postRequestWithToken } from '../../../api/Requests';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const statusMapping = {
    'P'   : 'Placed',
    'CNF' : 'Booking Confirmed',
    'A'   : 'Assigned',
    'RL'  : 'POD Reached at Location',
    'CS'  : 'Charging Started',
    'CC'  : 'Charging Completed',
    'PU'  : 'POD Picked Up',
    'WC'  : 'Work Completed',
    'C'   : 'Cancel'
};

const EvChargerBookingDetail = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const { requestId }                       = useParams()
    const navigate                            = useNavigate()
    const [bookingDetails, setBookingDetails] = useState()
    const [history, setHistory]               = useState([])
    
    const fetchDetails = () => {
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            request_id : requestId,
            booking_type : "FCB"
        };
        postRequestWithToken('charger-installation-details', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.service_data || {});
                setHistory(response?.order_history)
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
        bookingIdTitle       : "Service ID",
        customerDetailsTitle : "Customer Details",
    };
    const content = {
        bookingId       : bookingDetails?.request_id,
        createdAt       : moment(bookingDetails?.created_at).format('DD MMM YYYY h:mm A'),
        customerName    : bookingDetails?.name,
        customerContact : `${bookingDetails?.country_code} ${bookingDetails?.contact_no}`,
    };
    const sectionTitles1 = {
        customerEmail : "Customer Email",
        bookingStatus : "Satus",
        residentType  : "Resident Type",
        looking_for   : "Looking For",
        address       : "Address",
        charger_name  : 'Product Name'
    }
    const sectionContent1 = {
        customerEmail : bookingDetails?.email,
        bookingStatus : statusMapping[bookingDetails?.order_status] || bookingDetails?.order_status,
        residentType  : bookingDetails?.resident_type,
        looking_for   : bookingDetails?.looking_for,
        address       : (
            <a
                href    = {`https://www.google.com/maps?q=${bookingDetails?.latitude},${bookingDetails?.longitude}`}
                target    = "_blank"
                rel       = "noopener noreferrer"
                className = 'linkSection'
            >
                {bookingDetails?.address || 'View on Map'}
            </a>
        ),
        charger_name : bookingDetails?.charger_name
    }    
    const sectionTitles4 = {
        description : "Description",
    }    
    const sectionContent4 = {
        description: bookingDetails?.description,
    }
    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles} type='chargerInstallation' />
            <div className={styles.bookingLeftContainer}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1} 
                  sectionTitles4={sectionTitles4} sectionContent4={sectionContent4}
                type='chargerInstallation' />
                <BookingDetailsAccordion history={history} />
            </div>
        </div>
    )
}
export default EvChargerBookingDetail
