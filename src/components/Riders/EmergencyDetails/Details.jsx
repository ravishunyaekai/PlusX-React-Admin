import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import EmergencyCards from './EmergencyCards';
import EmergencyList from './EmergencyList';
import DriverLocationList from './DriverLocationList';
import NewMapComponent from '../../Dashboard/Map/NewMap';
import { postRequestWithToken } from '../../../api/Requests'; 
import styles from './emergency.module.css';

const Details = () => {
    const userDetails                           = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                              = useNavigate();
    const {rsaId}                               = useParams();
    const [details, setDetails]                 = useState();
    // const [history, setHistory]                 = useState([]);
    const [baseUrl, setBaseUrl]                 = useState();
    const [coordinates, setCoordinates]         = useState({ lat: 25.2048, lng: 55.2708 });
    // const [locationHistory, setLocationHistory] = useState([]);
    
    const fetchDetails = () => {
        const obj = {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
            rsa_id : rsaId
        };
        postRequestWithToken('rsa-data', obj, (response) => {
            if (response.code === 200) {
                setDetails(response?.rsaData || {});  
                // setHistory(response?.bookingHistory || {});
                setBaseUrl(response?.base_url);
                // setLocationHistory(response?.locationHistory)
                const lat = parseFloat(response?.rsaData?.latitude)
                const lng = parseFloat(response?.rsaData?.longitude) 
                if (!isNaN(lat) && !isNaN(lng)) {
                    setCoordinates({ lat, lng });
                }
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

    return (
        <div className='main-container'>
            <EmergencyCards details = {details} baseUrl={baseUrl}/>
            <div className={`col-12`} style={{padding:'20px',}}>
                <NewMapComponent className={styles.mapContainer} coordinates={coordinates}/>
            </div>
            { details?.booking_type && 
                <EmergencyList rsaId= {rsaId} bookingType= {details?.booking_type}/>
            }
            <DriverLocationList rsaId= {rsaId} />
        </div>
    );
}
export default Details;