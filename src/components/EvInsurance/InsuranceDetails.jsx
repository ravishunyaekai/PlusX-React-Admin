import React, { useEffect, useState } from 'react';
import styles from './insurance.module.css';
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader';
// import BookingDetailsSection from '../SharedComponent/Details/BookingDetails/BookingDetailsSection';
// import BookingImageSection from '../SharedComponent/Details/BookingDetails/BookingImageSection';
import BookingMultipleImages from '../SharedComponent/Details/BookingDetails/BookingMultipleImages.jsx';
import { postRequestWithToken } from '../../api/Requests';
import BookingLeftDetails from '../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import { useParams } from 'react-router-dom';
import moment from 'moment';
// import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from 'react-router-dom';

const InsuranceDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const { insuranceId }                     = useParams();
    const [bookingDetails, setBookingDetails] = useState();
    const [imageGallery, setImageGallery]     = useState();
    const [baseUrl, setBaseUrl]               = useState();

    const fetchDetails = () => {
        const obj = {
            userId       : userDetails?.user_id,
            email        : userDetails?.email,
            insurance_id : insuranceId
        };
        postRequestWithToken('ev-insurance-detail', obj, (response) => {
        if (response.code === 200) {
            setBookingDetails(response?.data || {});
            // setImageGallery(response.galleryData) 'driving_licence', 'car_images', 'emirates_id', 
            
            const carImages      = response?.data?.car_images ? response.data?.car_images?.split('*') : [];
            const licenseImages  = response?.data?.driving_licence ? response.data?.driving_licence?.split('*') : [];
            const emiratesImages = response?.data?.emirates_id ? response.data?.emirates_id?.split('*') : [];

            setImageGallery({ carImages, licenseImages, emiratesImages, });
            setBaseUrl(response.base_url)
        } else {
            console.log('error in ev-insurance-detail API', response);
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
        bookingIdTitle       : "Insurance ID",
        customerDetailsTitle : "Customer Details",
    };
    const content = {
        bookingId       : bookingDetails?.insurance_id,
        createdAt       : moment(bookingDetails?.created_at).format('DD MMM YYYY h:mm A'),
        customerName    : bookingDetails?.owner_name,
        customerContact : `${bookingDetails?.country_code} ${bookingDetails?.mobile_no}`,
        // driverName      : bookingDetails?.vehicle,
        // driverContact   : '',
    };
    const sectionTitles2 = {
        driverDetailsTitle : "Vehicle Details",
        insuranceExpiry    : "Insurance Expires On",
    }
    const sectionContent2 = {
        driverDetailsTitle : bookingDetails?.vehicle_data,
        insuranceExpiry    : moment(bookingDetails?.insurance_expiry).format('DD MMM YYYY'),
    }
    const imageTitles2 = {
        carImages: "Previous Insurance",
    };
    const imageContent2 = {
        carImages: imageGallery?.carImages,
        baseUrl,
    };
    const imageTitles4 = {
        licenseImages: "Driving Licence",
    };
    const imageContent4 = {
        licenseImages: imageGallery?.licenseImages,
        baseUrl,
    };
    const imageTitles5 = {
        emiratesImages: "Emirates ID",
    };
    const imageContent5 = {
        emiratesImages: imageGallery?.emiratesImages,
        baseUrl,
    };
    return (
        <div className='main-container'>
            <BookingDetailsHeader
                content={content} titles={headerTitles}
                type='evinsuranceBooking'
            />
            <div className={styles.ChargerDetailsSection}>
                <BookingLeftDetails sectionTitles2={sectionTitles2} sectionContent2={sectionContent2} type='evGuide' />
                <BookingMultipleImages titles={imageTitles2} content={imageContent2} type='evGuide' />
                <BookingMultipleImages titles={imageTitles4} content={imageContent4} type='evGuide' />
                <BookingMultipleImages titles={imageTitles5} content={imageContent5} type='evGuide' />
            </div>
        </div>
    )
}

export default InsuranceDetails