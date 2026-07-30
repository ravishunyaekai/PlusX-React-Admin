import React, { useEffect, useState } from 'react';
import styles from './subscription.module.css'
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader'
import { postRequestWithToken } from '../../api/Requests';
import BookingLeftDetails from '../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import OfferHistory from './OfferHistory';

const OfferDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate()
    const { offerId }                         = useParams()
    const [offerDetails, setOfferDetails] = useState()
    const [imageGallery, setImageGallery]     = useState()
    const [baseUrl, setBaseUrl]               = useState()

    const fetchDetails = () => {
        const obj = {
            userId   : userDetails?.user_id,
            email    : userDetails?.email,
            offer_id : offerId
        };
        postRequestWithToken('offer-detail', obj, (response) => {
            if (response.status == 1) {
                
                setOfferDetails(response?.data || {});
                setImageGallery(response.galleryData)
                setBaseUrl(response.base_url)
            } else {
                console.log('error in subscription-detail API', response);
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
        bookingIdTitle       : "Offer Name",
        customerDetailsTitle : "Status",
    };
    const content = {
        bookingId       : offerDetails?.offer_name, // Offer Expiry Date
        createdAt       : '', //moment(offerDetails?.created_at).format('DD MMM YYYY hh:mm A'),
        customerName    : ( offerDetails?.status === 1 ) ? 'Active' : "Inactive",
        customerContact : moment(offerDetails?.offer_exp_date).format('DD MMM YYYY'),
    };
    return (
        <div className={styles.appSignupSection}>
            <BookingDetailsHeader
                content={content} titles={headerTitles}
                type='Offer Details'
            />
            {/* <div className={styles.ChargerDetailsSection}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
                type='Offer Details' />
            </div> */}
            <OfferHistory offerId= {offerId} />
        </div>
    )
}

export default OfferDetails