import { useEffect, useState } from 'react';
import styles from './Vendor.module.css'
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx'
import BookingLeftDetails from '../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import { postRequestWithToken } from '../../api/Requests.js';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

import ChargerList from '../SharedComponent/Details/ChargerList'
import ResidentList from '../SharedComponent/Details/ResidentList'
import Pagination from '../SharedComponent/Pagination/Pagination'
 
const CommunityDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const { vendorId }                     = useParams(); 
    const navigate                            = useNavigate();
    const [communityDetails, setCommunityDetails] = useState();
    const [managerDetails, setManagerDetails]     = useState();
     
    const fetchDetails = () => {
        const obj = {
            userId    : userDetails?.user_id,
            email     : userDetails?.email,
            vendor_id : vendorId,
        };
        postRequestWithToken('vendor-details', obj, (response) => {
            if (response.code === 200) {
                setCommunityDetails(response?.data || {});
                
            } else {
                console.log('error in community-details API', response);
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

    const numberFormat =  (value) => Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // '', '', '', '', '', '', '', 'rsa_session', 'pod_session'
    const headerTitles = {
        bookingIdTitle       : "Vendor ID",
        customerDetailsTitle : "Vendor Name",
    };
    const content = {
        bookingId       : communityDetails?.vendor_id,
        createdAt       : moment(communityDetails?.created_at).format('DD MMM YYYY h:mm A'),
        customerName    : communityDetails?.vendor_name,
        customerContact : ``,
    };
    const sectionTitles1 = {
        emirate       : 'Emirates',
        area_name     : "Area Name",
        showroom_name : "Showroom Name",
        address       : "Address", 
        package_price : 'Package Price', 
        pod_session   : 'Portable Charging Session',
        rsa_session   : 'Roadside Assistance Session',
    }
    const sectionContent1 = {
        emirate        : communityDetails?.emirate,
        area_name      : communityDetails?.area_name,
        showroom_name  : communityDetails?.showroom_name,
        address        : communityDetails?.address,
        package_price  : numberFormat(communityDetails?.package_price),
        pod_session    : communityDetails?.rsa_session,
        rsa_session    : communityDetails?.rsa_session,
    }
    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles} type='chargerInstallation' />
            <div className={styles.bookingLeftContainer}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1} 
                type='chargerInstallation' />
            </div>
        </div>
    )
}
export default CommunityDetails
