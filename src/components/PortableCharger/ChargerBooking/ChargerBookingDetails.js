import React, { useEffect, useState } from 'react';
import styles from './chargerbooking.module.css'
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader'
import BookingDetailsSection from '../../SharedComponent/Details/BookingDetails/BookingDetailsSection'
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import BookingDetailsAccordion from '../../SharedComponent/BookingDetails/BookingDetailsAccordion.jsx'
import { postRequestWithToken } from '../../../api/Requests';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from 'react-router-dom';

const statusMapping = {
    'PNR' : 'Payment Not Received',
    'CNF': 'Booking Confirmed',
    'A'  : 'Assigned',
    'ER' : 'Enroute',
    'RL' : 'POD Reached at Location',
    'CS' : 'Charging Started',
    'CC' : 'Charging Completed',
    'PU' : 'POD Picked Up',
    'VP' : 'Vehicle Pickup',
    'RS' : 'Reached Charging Spot',
    'WC' : 'Work Completed',
    'DO' : 'Drop Off',
    'C'  : 'Cancel',
    'RO' : 'POD Reached at Office',
    'RSB' : 'Rescheduled Booking'
};

const ChargerBookingDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate()
    const { bookingId }                       = useParams()
    const [bookingDetails, setBookingDetails] = useState()
    const [packageData, setPackageData]         = useState()
    const [history, setHistory]               = useState([])
    const [feedBack, setFeedBack]             = useState()

    const fetchDetails = () => {
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            booking_id : bookingId
        };
        postRequestWithToken('charger-booking-details', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data?.booking || {});
                setPackageData(response?.data?.package_data || null);
                setHistory(response?.data?.history); 
                setFeedBack(response?.data?.feedBack);
            } else {
                console.log('error in rider-details API', response);
            }
        });
    };
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchDetails();
    }, [bookingId]);

    const headerTitles = {
        bookingIdTitle       : "Booking ID",
        customerDetailsTitle : "Customer Details",
        packageDetailsTitle  : "Package Details",
        driverDetailsTitle   : "Driver Details",
    };
    let rsa_data  = (bookingDetails?.rsa_data != null) ? bookingDetails?.rsa_data.split(",") : [];
    const content = {
        bookingId       : bookingDetails?.booking_id,
        customerId      : bookingDetails?.rider_id,
        createdAt       : moment(bookingDetails?.created_at).format('DD MMM YYYY h:mm A'),
        customerName    : bookingDetails?.user_name,
        customerContact : `${bookingDetails?.country_code} ${bookingDetails?.contact_no}`,
        driverName      : rsa_data ? rsa_data[0] : '',
        driverContact   : rsa_data ? rsa_data[1] : '',
        imageUrl        : bookingDetails?.imageUrl,
        podId           : bookingDetails?.pod_id,
        podName         : bookingDetails?.pod_name,
        custBookingCount : bookingDetails?.cust_booking_count || 0,
    };
    const sectionTitles1 = {
        bookingStatus : "Booking Status",
        price         : "Price",
        // serviceName   : "Service Name",
        vehicle        : "Vehicle",
    }
    const sectionContent1 = {
        bookingStatus : statusMapping[bookingDetails?.status] || bookingDetails?.status,
        // serviceName : bookingDetails?.service_name,
        price         : bookingDetails?.service_price ? `${ ( bookingDetails?.service_price / 100).toFixed(2) } AED` : '0 AED',
        vehicle        : bookingDetails?.vehicle_data,
    }
    const sectionTitles2 = {
        address       : "Address",
        slotDate      : "Slot Date",
        slotTime      : "Slot Time",
        parkingNumber : "Parking No.",
        parkingFloor  : "Parking Floor",
        are           : "Area Name",
        battery       : "Vehicle Battery %"
    }
    const sectionContent2 = {
        address: (
            <a
                href = {`https://www.google.com/maps?q=${bookingDetails?.latitude},${bookingDetails?.longitude}`}
                target    = "_blank"
                rel       = "noopener noreferrer"
                className = 'linkSection'
            >
                {bookingDetails?.address || 'View on Map'}
            </a>
        ),
        slotDate      : moment(bookingDetails?.slot_date).format('DD MMM YYYY'),
        slotTime      : moment(bookingDetails?.slot_time, 'HH:mm:ss').format('h:mm A'),
        parkingNumber : bookingDetails?.parking_number,
        parkingFloor  : bookingDetails?.parking_floor,
        are           : bookingDetails?.area,
        battery       : bookingDetails?.current_percent == 1 ? 'More than 10%' : 'Less than 10%'
    } 
    const cleanedKeys = Object.keys(sectionContent2).filter(
        key =>
            sectionContent2[key] !== null &&
            sectionContent2[key] !== undefined &&
            sectionContent2[key] !== ''
    );
    const cleanedSectionContent2 = {};
    const cleanedSectionTitles2 = {};
    cleanedKeys.forEach(key => {
        cleanedSectionContent2[key] = sectionContent2[key];
        cleanedSectionTitles2[key] = sectionTitles2[key];
    });

    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles} sectionContent={sectionContent1}
                type='portableChargerBooking' feedBack={feedBack} packageData={packageData}
            />
            <div className={styles.bookingDetailsSection}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
                    sectionTitles2={cleanedSectionTitles2} sectionContent2={cleanedSectionContent2}
                    type='portableChargerBooking' />
                <BookingDetailsAccordion history={history} rsa={content} />
            </div>
        </div>
    )
}

export default ChargerBookingDetails