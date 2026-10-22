import { useEffect, useState } from 'react';
import styles from './Customer.module.css'
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx'
import BookingLeftDetails from '../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import { postRequestWithToken } from '../../api/Requests.js';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
 
const ResidentsDetails = () => {
    const userDetails                           = JSON.parse(sessionStorage.getItem('userDetails'));
    const { customerId }                        = useParams(); 
    const navigate                              = useNavigate();
    const [customerDetails, setCustomerDetails] = useState();
    const [filters, setFilters]                 = useState({start_date: null,end_date: null});
     
    // const staturArr = { 0 : 'In-active', 1: 'Active' }
    
    const fetchDetails = () => {
        const obj = {
            userId      : userDetails?.user_id,
            email       : userDetails?.email,
            customer_id : customerId,
        };
        postRequestWithToken('vendor-customer-details', obj, (response) => {
            if (response.code === 200) {
                setCustomerDetails(response?.data || {});
                 
            } else {
                console.log('error in charger-installation-details API', response);
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
        bookingIdTitle       : "Customer ID",
        customerDetailsTitle : "Customer Details",
        packageDetailsTitle  : "Package Details",
    };
    const content = {
        bookingId       : customerDetails?.customer_id,
        createdAt       : moment(customerDetails?.created_at).format('DD MMM YYYY h:mm A'),
        customerName    : customerDetails?.customer_name,
        customerContact : `${customerDetails?.country_code} ${customerDetails?.mobile_number}`,
    };
    const sectionTitles1 = {
        vendor_name    : 'Vendor Name',
        showroom_name  : 'Showroom Name',
        customer_email : "Email Address",
        emirate        : "Emirate",
        area_name      : "Area Name",
        ev_make        : "EV Make",
        ev_model       : "EV Model",
        purchase_date  : "Package Purchase Date",
    }
    const sectionContent1 = {
        vendor_name    : customerDetails?.vendor_name,
        showroom_name  : customerDetails?.showroom_name,
        customer_email : customerDetails?.customer_email,
        emirate        : customerDetails?.emirate,
        area_name      : customerDetails?.area_name,
        ev_make        : customerDetails?.ev_make,
        ev_model       : customerDetails?.ev_model,
        purchase_date  : moment(customerDetails?.purchase_date).format('DD MMM YYYY '),
    }
    if( customerDetails?.pod_charging_session_number ) {

        const pensing_session  = parseInt(customerDetails?.pod_charging_session_number) - parseInt(customerDetails?.pod_used_session_number);

        sectionTitles1.pod_charging_session_number   = "Mobile & Portable Charging Session";
        sectionTitles1.pod_used_session_number       = "Pending Mobile Charging Session";
        sectionTitles1.pod_charging_session_validity = "Mobile & Portable Charging Validity";

        sectionContent1.pod_charging_session_number   = customerDetails?.pod_charging_session_number;
        sectionContent1.pod_used_session_number       = pensing_session;
        sectionContent1.pod_charging_session_validity = moment(customerDetails?.pod_charging_session_validity).format('DD MMM YYYY ');
    }
    if( customerDetails?.rsa_charging_session_number ) {
        sectionTitles1.rsa_charging_session_number   = "Roadside Service Session";
        sectionTitles1.rsa_pending_session_number       = "Pending Roadside Service Session";
        sectionTitles1.rsa_charging_session_validity = "Roadside Service Validity";

        sectionContent1.rsa_charging_session_number   = customerDetails?.rsa_charging_session_number;
        sectionContent1.rsa_pending_session_number       = customerDetails?.rsa_used_session_number;
        sectionContent1.rsa_charging_session_validity = moment(customerDetails?.rsa_charging_session_validity).format('DD MMM YYYY ');
    }
    const packageData =  {
        "price"             : parseFloat(customerDetails?.package_price || 0),
        "package_name"      : customerDetails?.package_name,
        "charging_capacity" : parseInt(customerDetails?.charging_capacity || 0)    }
    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles} type='chargerInstallation' packageData={packageData} />
            <div className={styles.bookingLeftContainer}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1} 
                type='chargerInstallation' />
            </div>
        </div>
    )
}
export default ResidentsDetails
