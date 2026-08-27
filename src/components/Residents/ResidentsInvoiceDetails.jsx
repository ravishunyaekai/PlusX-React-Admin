import React, { useEffect, useState } from 'react';
import styles from './Residents.module.css'
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx'
// import BookingDetailsSection from '../SharedComponent/Details/BookingDetails/BookingDetailsSection'
import BookingLeftDetails from '../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import BookingDetailsAccordion from '../SharedComponent/BookingDetails/BookingDetailsAccordion.jsx'
import { postRequestWithToken } from '../../api/Requests.js';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import BookingImageSection from '../SharedComponent/Details/BookingDetails/BookingImageSection.jsx'
 
const InvoiceDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const { invoiceId }                       = useParams(); 
    const navigate                            = useNavigate();
    const [invoiceDetails, setInvoiceDetails] = useState();
     
    const fetchDetails = () => {
        const obj = {
            userId      : userDetails?.user_id,
            email       : userDetails?.email,
            invoice_id : invoiceId,
        };
        postRequestWithToken('scan-charge-invoice-detail', obj, (response) => {
            if (response.code === 200) {
                setInvoiceDetails(response?.data || {});
                 
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
        bookingIdTitle       : "Invoice ID",
        customerDetailsTitle : "Resident Details",
    };
    const content = {
        bookingId       : invoiceDetails?.invoice_id || invoiceId,
        createdAt       : moment(invoiceDetails?.created_at).format('DD MMM YYYY h:mm A'),
        customerName    : invoiceDetails?.resident_name,
        customerContact : invoiceDetails?.resident_email, //+971 ${invoiceDetails?.resident_mobile}
    };
    
    const sectionTitles1 = {
        community_name : "Community Name",
        area_name      : "Area Name",
        address        : "Full Address",
        
        no_of_session  : "No. Of Session",
        kwh_allocated  : "kWh Allocation/Month",
        billing_month  : "Billing Month",

        total_consumption  : "Total Consumption",
        per_kwh_charge     : "Per kWh Charge (AED)",
        energy_price_total : "Energy KWh Price",

        over_time_min        : "Over Time ( Min)",
        extra_charge_per_min : "Extra Charge/Min Over Allocated Time (AED)",
        extra_charge_total   : "Extra Charge (AED)",

        subtotal     : "Sub Total",
        vat_amt      : "Vat (5%)",
        total_amount : "Total Amount",
        status       : "Status",
    }
    const sectionContent1 = {
        community_name : invoiceDetails?.community_name,
        area_name      : invoiceDetails?.area_name,
        address        : invoiceDetails?.resident_address,
        
        no_of_session  : invoiceDetails?.no_of_session,
        kwh_allocated  : invoiceDetails?.kwh_allocated,
        billing_month  : invoiceDetails?.billing_month,
       
        total_consumption   : Number(invoiceDetails?.total_consumption || 0 ).toFixed(2),
        per_kwh_charge      : Number(invoiceDetails?.per_kwh_charge || 0 ).toFixed(2),
        energy_price_total  : Number(invoiceDetails?.energy_price_total || 0 ).toFixed(2),

        over_time_min        : invoiceDetails?.over_time_min,
        extra_charge_per_min : invoiceDetails?.extra_charge_per_min,
        extra_charge_total   : Number(invoiceDetails?.extra_charge_total || 0 ).toFixed(2),

        subtotal     : Number(invoiceDetails?.subtotal || 0 ).toFixed(2),
        vat_amt      : Number(invoiceDetails?.vat || 0 ).toFixed(2),
        total_amount : Number(invoiceDetails?.total_amount || 0 ).toFixed(2),
        status       : invoiceDetails?.invoice_status,
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
export default InvoiceDetails
