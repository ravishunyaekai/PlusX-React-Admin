import React, { useEffect, useState } from 'react';
import styles from './roadassistance.module.css'
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader'
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import BookingImageSection from '../../SharedComponent/Details/BookingDetails/BookingImageSection'
import BookingMultipleImages from '../../SharedComponent/Details/BookingDetails/BookingMultipleImages.jsx'
import BookingDetailsAccordion from '../../SharedComponent/BookingDetails/BookingDetailsAccordion.jsx'
import { postRequestWithToken } from '../../../api/Requests';
import { useParams } from 'react-router-dom';
import moment from 'moment';

import { useNavigate } from 'react-router-dom';

const statusMapping = {
    'PNR' : 'Payment Not Received',
    'CNF': 'Booking Confirmed',
    'A'  : 'Assigned',
    'ER' : 'Enroute',
    'RL' : 'POD Reached at Location',
    'CS' : 'Charging Started',
    'CC' : 'Charging Completed',
    'PU' : 'Completed',
    'VP' : 'Vehicle Pickup',
    'RS' : 'Reached Charging Spot',
    'WC' : 'Work Completed',
    'DO' : 'Drop Off',
    'C'  : 'Cancel',
    'RO' : 'POD Reached at Office',
};

const PROOF_BASE_URL = `${process.env.REACT_APP_DIR_UPLOADS}rsa-offline-proof`;

const OfflineLeadsBookingDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate()
    const { requestId }                       = useParams()
    const [bookingDetails, setBookingDetails] = useState()
    const [history, setHistory]               = useState([])
    const [feedBack, setFeedBack]             = useState()

    const fetchDetails = () => {
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            request_id : requestId
        };
        postRequestWithToken('ev-road-assistance-offline-booking-details', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data?.booking || {});
                setHistory(response?.data?.history);
                setFeedBack(response?.data?.feedBack);
            } else {
                console.log('error in offline booking details API', response);
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
        bookingIdTitle       : "Booking ID",
        customerDetailsTitle : "Customer Details",
        driverDetailsTitle   : "Driver Details",
    };
    let rsa_data  = (bookingDetails?.rsa_data != null && bookingDetails?.rsa_data !== '')
        ? bookingDetails.rsa_data.split(",")
        : [];
    const driverName = bookingDetails?.booking_completed_by
        || bookingDetails?.rsa_name
        || bookingDetails?.driver_name
        || (rsa_data[0]?.trim() || '');
    const driverContact = `${bookingDetails?.driver_country_code || ''} ${bookingDetails?.driver_mobile_no || rsa_data[1]?.trim() || ''}`.trim();
    const content = {
        bookingId       : bookingDetails?.request_id,
        customerId      : bookingDetails?.rider_id,
        createdAt       : moment(bookingDetails?.created_at).format('DD MMM YYYY h:mm A'),
        driverName      : driverName,
        driverContact   : driverContact,
        podId           : bookingDetails?.pod_id,
        podName         : bookingDetails?.pod_name,
        customerName    : bookingDetails?.name || bookingDetails?.customer_name,
        customerContact : `${bookingDetails?.country_code || ''} ${bookingDetails?.contact_no || bookingDetails?.mobile_no || ''}`.trim(),
        imageUrl        : bookingDetails?.imageUrl,
    };
    const sectionTitles1 = {
        bookingStatus : "Booking Status",
        price         : "Price",
        vehicle       : "Vehicle",
        battery       : "Vehicle Battery %",
        jumpStart     : "Jump Start Required",
        locationLink  : "Location Link",
        address       : "Address",
        modeOfPayment : "Mode of Payment",
        paymentStatus : "Payment Status",
    };

    const proofFilename = bookingDetails?.proof_of_transaction;
    const proofFullUrl = bookingDetails?.proof_of_transaction_url
        || (proofFilename ? `${PROOF_BASE_URL}/${proofFilename}` : null);

    const isPdfProof = proofFilename && (
        proofFilename.toLowerCase().endsWith('.pdf')
        || proofFullUrl?.toLowerCase().endsWith('.pdf')
    );

    const proofImageTitles = {
        coverImage : "Payment Proof",
    };
    const proofImageContent = {
        coverImage : proofFullUrl,
        baseUrl    : '',
    };
    const proofPdfTitles = {
        evChargerFiles : "Payment Proof",
    };
    const proofPdfContent = {
        evChargerFiles : proofFullUrl,
        baseUrl        : '',
    };

    const sectionContent1 = {
        bookingStatus : statusMapping[bookingDetails?.order_status || bookingDetails?.booking_status] || bookingDetails?.order_status || bookingDetails?.booking_status,
        price         : bookingDetails?.price,
        vehicle       : bookingDetails?.vehicle_data || `${bookingDetails?.vehicle_make || ''} ${bookingDetails?.vehicle_model || ''}`.trim(),
        battery       : bookingDetails?.current_percent == 1 || bookingDetails?.battery_level == 1 || bookingDetails?.battery_level === '1'
            ? 'More than 5%'
            : '0%',
        jumpStart     : (
            bookingDetails?.jump_start_required == 1
            || bookingDetails?.jump_start_required === '1'
            || String(bookingDetails?.jump_start_required).toLowerCase() === 'yes'
        ) ? 'Yes' : 'No',
        locationLink  : bookingDetails?.location_link ? (
            <a
                href      = {bookingDetails.location_link}
                target    = "_blank"
                rel       = "noopener noreferrer"
                className = {styles.locationLink}
            >
                View Location
            </a>
        ) : '-',
        address : (
            <a
                href      = {bookingDetails?.location_link || `https://www.google.com/maps?q=${bookingDetails?.pickup_latitude},${bookingDetails?.pickup_longitude}`}
                target    = "_blank"
                rel       = "noopener noreferrer"
                className = 'linkSection'
            >
                {bookingDetails?.pickup_address || bookingDetails?.address || 'View on Map'}
            </a>
        ),
        modeOfPayment : bookingDetails?.mode_of_payment || '-',
        paymentStatus : bookingDetails?.payment_status || '-',
    }
    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles} sectionContent={sectionContent1}
                type='evRoadAssitanceBooking' feedBack={feedBack}
            />
            <div className={styles.bookingDetailsSection}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
                    type='evRoadAssitanceBooking' />
                {proofFullUrl && !isPdfProof && (
                    <BookingImageSection
                        titles={proofImageTitles}
                        content={proofImageContent}
                        type='evRoadAssitanceBooking'
                    />
                )}
                {proofFullUrl && isPdfProof && (
                    <BookingMultipleImages
                        titles={proofPdfTitles}
                        content={proofPdfContent}
                        type='evRoadAssitanceBooking'
                    />
                )}
                <BookingDetailsAccordion history={history} rsa={content} statusOverrides={{ PU : 'Booking Completed' }} />
            </div>
        </div>
    )
}

export default OfflineLeadsBookingDetails
