import React, { useEffect, useState } from 'react';
import styles from './bookinglist.module.css'
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader'
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import { postRequestWithToken } from '../../../api/Requests';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const statusMapping = {
    'PNR' : 'Payment Not Received',
};
const PickAndDropBookingDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate()
    const { requestId }                       = useParams()
    const [bookingDetails, setBookingDetails] = useState()

    const fetchDetails = () => {
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            request_id : requestId
        };

        postRequestWithToken('failed-pick-and-drop-booking-details', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data[0] || {});
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
    }, []);

    const headerTitles = {
        bookingIdTitle       : "Booking ID",
        customerDetailsTitle : "Customer Details",
    };
    const sectionTitles1 = {
        bookingStatus : "Booking Status",
        price         : "Price",
        vehicle       : "Vehicle",
    }
    const sectionTitles2 = {
        parking      : "Parking Number",
        parkingFloor : "Parking Floor",
        address      : "Address",
    }
    const sectionTitles3 = {
        slotDate: "Slot Date & Time",
    }
    const content = {
        bookingId       : bookingDetails?.request_id,
        createdAt       : moment(bookingDetails?.created_at).format('DD MMM YYYY h:mm A'),
        customerName    : bookingDetails?.name,
        customerContact : `${bookingDetails?.country_code} ${bookingDetails?.contact_no}`,
    };
    const sectionContent1 = {
        bookingStatus : statusMapping[bookingDetails?.order_status] || bookingDetails?.order_status,
        price         : bookingDetails?.price ? `${ ( bookingDetails?.price ).toFixed(2) } AED` : '0.0 AED',
        vehicle       : bookingDetails?.vehicle_data,
    }
    const sectionContent2 = {
        parking      : bookingDetails?.parking_number,
        parkingFloor : bookingDetails?.parking_floor,
        address      : (
            <a
                href={`https://www.google.com/maps?q=${bookingDetails?.pickup_latitude},${bookingDetails?.pickup_longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
            >
                {bookingDetails?.pickup_address || 'View on Map'}
            </a>
        ),
    }
    const sectionContent3 = {
        slotDate: moment(bookingDetails?.slot_date_time).format('DD MMM YYYY h:mm A'),
    }
    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles} sectionContent1={sectionContent1} type='failedPickAndDropBooking' />
            <div className={styles.pickBookingContainer}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1} sectionTitles2={sectionTitles2} 
                sectionContent2={sectionContent2} sectionTitles3={sectionTitles3} sectionContent3={sectionContent3} type='pickAndDropBooking' />
            </div>
        </div>
    )
}
export default PickAndDropBookingDetails