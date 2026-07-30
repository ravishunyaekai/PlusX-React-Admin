import React, { useEffect, useState } from 'react';
import styles from './chargerShare.module.css'
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader'
// import BookingDetailsSection from '../SharedComponent/Details/BookingDetails/BookingDetailsSection'
import BookingLeftDetails from '../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import BookingDetailsAccordion from '../SharedComponent/BookingDetails/BookingDetailsAccordion.jsx'
import { postRequestWithToken } from '../../api/Requests';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import BookingImageSection from '../SharedComponent/Details/BookingDetails/BookingImageSection'
 
const ChargeShareDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const { chargeId }                        = useParams(); 
    const navigate                            = useNavigate();
    const [bookingDetails, setBookingDetails] = useState();
    const [baseUrl, setBaseUrl]               = useState();
    const staturArr = { 0 : 'Pending', 1: 'Accepted', 2 : 'Rejected' }
    
    const fetchDetails = () => {
        const obj = {
            userId    : userDetails?.user_id,
            email     : userDetails?.email,
            charger_id : chargeId,
        };
        postRequestWithToken('charge-share-details', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data || {});
                setBaseUrl(response.base_url);
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
        bookingIdTitle       : "Charge ID",
        customerDetailsTitle : "Customer Details",
    };
    const content = {
        bookingId       : bookingDetails?.charger_id,
        createdAt       : moment(bookingDetails?.created_at).format('DD MMM YYYY h:mm A'),
        customerName    : bookingDetails?.rider_name,
        customerContact : `+971 ${bookingDetails?.mobile}`,
    };
    const sectionTitles1 = {
        customerEmail  : "Customer Email",
        charger_name   : "Charger Name",
        charger_type   : "Type of Charger",
        output         : "Output Power",
        connector_type : "Type of Connector",
        compatible     : "Compatible With",
        address        : "Address",
        open_days      : "Open Days",
        open_timing    : "Open Timing",
        status         : "Status",
    }
    const sectionContent1 = {
        customerEmail  : bookingDetails?.email,
        charger_name   :  bookingDetails?.charger_name,
        charger_type   : bookingDetails?.charger_type,
        output         : bookingDetails?.output,
        connector_type : bookingDetails?.connector_type,
        compatible     : bookingDetails?.compatible.join(" | "),
        address        : (
            <a
                href    = {`https://www.google.com/maps?q=${bookingDetails?.latitude},${bookingDetails?.longitude}`}
                target    = "_blank"
                rel       = "noopener noreferrer"
                className = 'linkSection'
            >
                {bookingDetails?.address || 'View on Map'}
            </a>
        ),
        open_days      : bookingDetails?.open_days.join(", "),
        open_timing    : bookingDetails?.open_timing.join(", "),
        status         : staturArr[bookingDetails?.charger_status],
    }
    if(bookingDetails?.park_no){
        sectionTitles1.park_no = 'Parking Number';
        sectionContent1.park_no = bookingDetails?.park_no
    }
    if(bookingDetails?.park_floor){
        sectionTitles1.park_floor = 'Parking Floor';
        sectionContent1.park_floor = bookingDetails?.park_floor
    }

    const sectionTitles4 = {
        description : "Description",
    }
    const sectionContent4 = {
        description: bookingDetails?.description,
    }
    const imageTitles = {
        coverImage    : "Charger Image",
    }
    const imageContent = {
        coverImage      : bookingDetails?.charger_image,
        baseUrl         : baseUrl,
    }
    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles} type='chargerInstallation' />
            <div className={styles.bookingLeftContainer}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1} 
                  sectionTitles4={sectionTitles4} sectionContent4={sectionContent4}
                type='chargerInstallation' />
                <BookingImageSection
                    titles={imageTitles} content={imageContent}
                    type='evChargerDetails'
                />
            </div>
        </div>
    )
}
export default ChargeShareDetails
