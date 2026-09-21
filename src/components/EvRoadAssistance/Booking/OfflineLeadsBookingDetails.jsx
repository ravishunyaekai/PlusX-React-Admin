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
    'C'  : 'Cancelled',
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
        cancelled_by    : bookingDetails?.cancelled_by,
    };

    const hasValue = (value) => value !== null && value !== undefined && value !== '';

    const sectionTitles1 = {};
    const sectionContent1 = {};

    const addField = (key, title, value) => {
        if (!hasValue(value) && value !== 0 && typeof value !== 'object') return;
        if (value === '-') return;
        sectionTitles1[key] = title;
        sectionContent1[key] = value;
    };

    const statusCode = bookingDetails?.order_status || bookingDetails?.booking_status;
    const statusLabel = statusMapping[statusCode]
        || (statusCode === 'Cancel' ? 'Cancelled' : statusCode);
    addField('bookingStatus', 'Booking Status', statusLabel);

    if (bookingDetails?.booking_date) {
        addField('bookingDate', 'Booking Date', moment(bookingDetails.booking_date).format('DD MMM YYYY'));
    }
    if (bookingDetails?.booking_completed_date) {
        addField('bookingCompletedDate', 'Booking Completed Date', moment(bookingDetails.booking_completed_date).format('DD MMM YYYY'));
    }
    if (hasValue(bookingDetails?.price) || bookingDetails?.price === 0) {
        addField('price', 'Price', bookingDetails.price);
    }

    const vehicle = bookingDetails?.vehicle_data
        || `${bookingDetails?.vehicle_make || ''} ${bookingDetails?.vehicle_model || ''}`.trim();
    if (hasValue(vehicle)) {
        addField('vehicle', 'Vehicle', vehicle);
    }

    if (hasValue(bookingDetails?.current_percent) || hasValue(bookingDetails?.battery_level)) {
        addField(
            'battery',
            'Vehicle Battery %',
            bookingDetails?.current_percent == 1 || bookingDetails?.battery_level == 1 || bookingDetails?.battery_level === '1'
                ? 'More than 5%'
                : '0%'
        );
    }

    if (hasValue(bookingDetails?.jump_start_required)) {
        addField(
            'jumpStart',
            'Jump Start Required',
            (
                bookingDetails?.jump_start_required == 1
                || bookingDetails?.jump_start_required === '1'
                || String(bookingDetails?.jump_start_required).toLowerCase() === 'yes'
            ) ? 'Yes' : 'No'
        );
    }

    if (bookingDetails?.location_link) {
        addField('locationLink', 'Location Link', (
            <a
                href      = {bookingDetails.location_link}
                target    = "_blank"
                rel       = "noopener noreferrer"
                className = {styles.locationLink}
            >
                View Location
            </a>
        ));
    }

    const addressText = bookingDetails?.pickup_address || bookingDetails?.address;
    if (hasValue(addressText)) {
        addField('address', 'Address', (
            <a
                href      = {bookingDetails?.location_link || `https://www.google.com/maps?q=${bookingDetails?.pickup_latitude},${bookingDetails?.pickup_longitude}`}
                target    = "_blank"
                rel       = "noopener noreferrer"
                className = 'linkSection'
            >
                {addressText}
            </a>
        ));
    }

    if (hasValue(bookingDetails?.mode_of_payment)) {
        addField('modeOfPayment', 'Mode of Payment', bookingDetails.mode_of_payment);
    }
    if (statusCode !== 'C' && hasValue(bookingDetails?.payment_status)) {
        addField('paymentStatus', 'Payment Status', bookingDetails.payment_status);
    }

    const historyWithRemarks = (() => {
        const list = (history || []).map((item) => {
            if (item?.order_status === 'C') {
                return {
                    ...item,
                    remarks      : item.remarks || bookingDetails?.cancellation_remarks || '',
                    cancelled_by : item.cancelled_by || item.cancel_by || bookingDetails?.cancelled_by || '',
                };
            }
            return item;
        });

        const hasCancelledEntry = list.some((item) => item?.order_status === 'C');
        if (
            !hasCancelledEntry
            && statusCode === 'C'
            && (hasValue(bookingDetails?.cancellation_remarks) || hasValue(bookingDetails?.cancelled_by))
        ) {
            list.push({
                order_status : 'C',
                remarks      : bookingDetails?.cancellation_remarks || '',
                cancelled_by : bookingDetails?.cancelled_by || '',
                created_at   : bookingDetails?.updated_at || bookingDetails?.created_at || null,
            });
        }

        return list;
    })();

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
                <BookingDetailsAccordion history={historyWithRemarks} rsa={content} statusOverrides={{ PU : 'Booking Completed' }} />
            </div>
        </div>
    )
}

export default OfflineLeadsBookingDetails
