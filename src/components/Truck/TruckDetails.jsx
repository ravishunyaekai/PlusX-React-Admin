import React, { useEffect, useState } from 'react';
import styles from './chargerbooking.module.css'
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx'
import { postRequestWithToken } from '../../api/Requests.js';
import moment from "moment-timezone";
import { useNavigate, useParams } from 'react-router-dom';
    
import TruckFuelHistory from './TruckFuelHistory';

const TruckDetails = () => {
    const userDetails                       = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                          = useNavigate()
    const { truckId }                         = useParams()
    const [truckDetails, setTruckDetails] = useState({})

    const fetchDetails = () => {
        const obj = {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
            truck_id : truckId
        };
        postRequestWithToken('truck-details', obj, (response) => {

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
        bookingIdTitle       : "Truck Id",
        customerDetailsTitle : "Truck Name", 
        driverDetailsTitle   : "Truck Number", 
    };
    const content = {
        bookingId       : truckDetails?.truck_id,
        createdAt       : moment(truckDetails?.created_at).format('DD MMM YYYY HH:mm A'),   
        customerName    : truckDetails?.truck_name,
        driverName      : truckDetails?.truck_number,
        driverContact   : '',
    };    
    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles}
                type='TruckDetails'
            />
            <div className={styles.bookingDetailsSection}>
                <TruckFuelHistory truckId= {truckId} />
            </div>
        </div>
    )
}

export default TruckDetails