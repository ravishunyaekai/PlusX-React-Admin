import React, { useEffect, useState } from 'react';
import styles from './purchaseDetails.module.css'
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader'
import BookingImageSection from '../../SharedComponent/Details/BookingDetails/BookingImageSection'
import BookingMultipleImages from '../../SharedComponent/Details/BookingDetails/BookingMultipleImages.jsx';
import { postRequestWithToken } from '../../../api/Requests';
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';

const EvChargerDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate()
    const { purchaseId }                       = useParams()
    const [bookingDetails, setBookingDetails] = useState()
    const [baseUrl, setBaseUrl]               = useState();

    const [purchaseInfo, setPurchaseInfo]         = useState(false);
    const [installationInfo, setInstallationInfo] = useState(false);

    const fetchDetails = () => {
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            purchase_id : purchaseId,
        };
        postRequestWithToken('purchase-history-details', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data || {});
                
                setBaseUrl(response.base_url);
                setDatesShowHide(response?.data.typeOfService) ;
            } else {
                console.log('error in details API', response);
            }
        });
    };
    const setDatesShowHide = (labels) => {
         
        setPurchaseInfo(labels.includes("Charger"));    
        setInstallationInfo(labels.includes("Installation"));
    }
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchDetails();
    }, []);

    const headerTitles = {
        bookingIdTitle      : "Purchase ID",
        customerDetailsTitle : "Customer Details",
    };
    const content = {
        bookingId     : bookingDetails?.purchase_id,
        createdAt     : moment(bookingDetails?.created_at).format('DD MMM YYYY hh:mm A'),

        customerName    : bookingDetails?.customer_name,
        customerContact : bookingDetails?.customer_mobile,
    };
    const sectionTitles1 = {
        customer_email    : "Customer Email",
        customer_address  : 'Customer Address',
        price             : 'Price',
        product_name      : 'Product Name',
        output_Power      : 'Output Power',
        type_of_service   : 'Type of Service',
    }
    const sectionContent1 = {
        customer_email   : bookingDetails?.customer_email,
        customer_address : bookingDetails?.customer_address,
        price            : bookingDetails?.price ? 'AED '+bookingDetails?.price : '',
        product_name     : bookingDetails?.product_name,
        output_Power     : bookingDetails?.outputPower,
        type_of_service  : bookingDetails?.typeOfService,  
    } 
    if(purchaseInfo) {
        sectionTitles1.purchase_date  = 'Date of Purchase';
        sectionTitles1.warranty_expiry_date = 'Warranty Expires on';

        sectionContent1.purchase_date  = moment( bookingDetails?.purchase_date ).format('DD MMM YYYY');
        sectionContent1.warranty_expiry_date = moment( bookingDetails?.warranty_expiry_date ).format('DD MMM YYYY');
    }
    if(installationInfo) {
        sectionTitles1.installation_date  = 'Date of Installation';
        sectionContent1.installation_date = moment( bookingDetails?.installation_date ).format('DD MMM YYYY');
    }
    const filesData = [
        { FileTitle: "Purchase Invoice",     FileName: bookingDetails?.purchase_invoice_pdf },
        { FileTitle: "Installation Invoice", FileName: bookingDetails?.installation_invoice_pdf },
        { FileTitle: "Completion Invoice",   FileName: bookingDetails?.completion_certificate_pdf }
    ]
    .filter( ( { FileName } ) => FileName && FileName.trim?.()) .map(item => ({ ...item, baseUrl }));

    const purchasePdfData = { fileContent : filesData } ;
    return (
        <div className='main-container'>
            <BookingDetailsHeader
                content={content} titles={headerTitles}
                type='evChargerDetails'
            />
            <div className={styles.ChargerDetailsSection}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
                type='evChargerDetails' />
                
                <BookingMultipleImages content={purchasePdfData} type='evChargerDetails' />

            </div>
        </div>
    )
}
// onRemoveImage={handleRemoveGalleryImage}
export default EvChargerDetails