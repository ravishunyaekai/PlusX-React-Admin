import React, { useEffect, useState, useRef  } from 'react';
import styles from './chargerbooking.module.css'
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx'
import { postRequestWithToken } from '../../api/Requests.js';
import moment from "moment-timezone";
import { useNavigate, useParams } from 'react-router-dom';

import BookingLeftDetails from '../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
    
// import TruckFuelHistory from '../Truck/TruckFuelHistory';
// import QRCode from "qrcode.react";
import { QRCodeCanvas } from "qrcode.react";

const BikeDetails = () => {
    const userDetails                     = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                        = useNavigate()
    const { bikeId }                      = useParams()
    const [bikeDetails, setTruckDetails] = useState({})

    const fetchDetails = () => {
        const obj = {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
            bike_id : bikeId
        };
        postRequestWithToken('bike-details', obj, (response) => {

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
        bookingIdTitle       : "Bike Id",
        customerDetailsTitle : "Bike Brand Name", 
        driverDetailsTitle   : "Bike Number", 
    };
    const content = {
        bookingId       : bikeDetails?.bike_id,
        createdAt       : moment(bikeDetails?.created_at).format('DD MMM YYYY hh:mm A'),   
        customerName    : bikeDetails?.bike_brand_name,
        driverName      : bikeDetails?.bike_number,
        driverContact   : '',
    };  
    
    const sectionTitles1 = {
        serviceFor : "Service For",
        regsDate   : "Registartion Date",
        status     : "Status",
        // bar_code   : `Bike QR-Code`
    }
    const sectionContent1 = {
        serviceFor : bikeDetails?.service_for,
        regsDate   : moment(bikeDetails?.regs_date).format('DD MMM YYYY'),
        status     : bikeDetails?.status ? 'Active' : 'In-active',
        // bar_code  : () =>{
        //     return (
        //         <>
        //             <QRCodeCanvas value={bikeDetails?.bike_number} size={200} style={{margin: '10px'}} />
        //             <button onClick={handleDownload}>Download QR Code</button>
        //         </>
        //     ) 
        // }
    }

    const qrRef = useRef();
    const handleDownload = () => {
        const canvas = qrRef.current.querySelector("canvas");
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

        const downloadLink = document.createElement("a");
        downloadLink.href  = pngUrl;
        downloadLink.download = "qrcode.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };
    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles}
                type='BikeDetails'
            />
            <div className={styles.bookingDetailsSection}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
                type='bikeDetails' />

                <div ref={qrRef}>
                    <button style={{display: 'flex', margin: '-30px 0px 10px 1px' }} onClick={handleDownload}>Download QR Code</button>
                    <QRCodeCanvas 
                        value={bikeDetails?.bike_number} 
                        size={220} 
                        bgColor="#FFFFFF" 
                        fgColor="#000000" 
                        level="H" // error correction level: L, M, Q, H
                        includeMargin={true}
                        // className="my-qr"
                    />
                </div>
                
            </div>
        </div>
    )
}

export default BikeDetails