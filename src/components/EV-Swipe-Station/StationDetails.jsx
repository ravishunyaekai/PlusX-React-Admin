import React, { useEffect, useState, useRef  } from 'react';
import styles from './chargerbooking.module.css'
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx'
import { postRequestWithToken } from '../../api/Requests.js';
import moment from "moment-timezone";
import { useNavigate, useParams } from 'react-router-dom';

// import BookingLeftDetails from '../SharedComponent/BookingDetails/BookingLeftDetails.jsx'

const StationDetails = () => {
    const userDetails                     = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                        = useNavigate()
    const { stationId }                      = useParams()
    const [bikeDetails, setTruckDetails] = useState({})

    const fetchDetails = () => {
        const obj = {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
            station_id : stationId
        };
        postRequestWithToken('swipe-station-details', obj, (response) => {

            if (response.status === 1) {
                const data = response?.data || {};

                setTruckDetails(data);                
            } else {
                // console.error('Error in electric-bike-detail API', response);
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
        bookingIdTitle       : "Station Id",
        customerDetailsTitle : "Station Name", 
        driverDetailsTitle   : "Number Of Slot", 
    };
    const content = {
        bookingId       : bikeDetails?.station_id,
        createdAt       : moment(bikeDetails?.created_at).format('DD MMM YYYY hh:mm A'),   
        customerName    : bikeDetails?.station_name,
        driverName      : bikeDetails?.number_of_slot,
        driverContact   : '',
    };  
    // const sectionTitles1 = {
    //     serviceFor : "Service For",
    //     regsDate   : "Registartion Date",
    //     status     : "Charger Type",
    // }
    // const sectionContent1 = {
    //     serviceFor : bikeDetails?.service_for,
    //     regsDate   : moment(bikeDetails?.regs_date).format('DD MMM YYYY'),
    //     status     : bikeDetails?.status ? 'Active' : 'In-active',
    // }
    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles}
                type='BikeDetails'
            />
            {/* <div className={styles.bookingDetailsSection}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
                type='bikeDetails' />
            </div> */}
        </div>
    )
}

export default StationDetails