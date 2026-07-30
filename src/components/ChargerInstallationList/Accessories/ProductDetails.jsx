import React, { useEffect, useState } from 'react';
import styles from './productDetails.module.css'
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader'
import BookingImageSection from '../../SharedComponent/Details/BookingDetails/BookingImageSection'
import BookingMultipleImages from '../../SharedComponent/Details/BookingDetails/BookingMultipleImages.jsx';
import { postRequestWithToken } from '../../../api/Requests';
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const EvChargerDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate()
    const { chargerId }                       = useParams()
    const [bookingDetails, setBookingDetails] = useState()
    const [baseUrl, setBaseUrl]               = useState()

    const [imageGallery, setImageGallery]     = useState();
    const [imageGalleryId, setImageGalleryId] = useState();

    const fetchDetails = () => {
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            charger_id : chargerId,
        };
        postRequestWithToken('ev-accessories-details', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data || {});
                setImageGallery(response.gallery_data);
                setImageGalleryId(response.gallery_id);
                setBaseUrl(response.base_url);
            } else {
                console.log('error in details API', response);
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
    const handleRemoveGalleryImage = (galleryId) => {
        const confirmDelete = window.confirm("Do you want to delete this item?");
        if (confirmDelete) {
            const obj = { 
                userId     : userDetails?.user_id,
                email      : userDetails?.email,
                gallery_id : galleryId 
            };
            postRequestWithToken('ev-charger-gallery-del', obj, async (response) => {
                if (response.code === 200) {
                    toast(response.message, { type: "success" });

                    setTimeout(() => {
                    fetchDetails();
                    }, 1000);
                } else {
                    toast(response.message, { type: 'error' });
                }
            });
        }
    };
    const headerTitles = {
        bookingIdTitle      : "Product ID",
        customerDetailsTitle : "Product Details",
    };
    const content = {
        bookingId     : bookingDetails?.charger_id,
        createdAt     : moment(bookingDetails?.created_at).format('DD MMM YYYY hh:mm A'),
        customerName   : bookingDetails?.charger_name,
    };
    const sectionTitles1 = {
        compatible : "Compatible",
        price      : 'Price',
        status     : "Status",
    }
    const sectionContent1 = {
        compatible     : bookingDetails?.compatible, 
        price          : 'AED '+bookingDetails?.price,
        status         : bookingDetails?.status === 1 ? "Active" : "Un-Active",
    }
    if(bookingDetails?.outputPower) {
        sectionTitles1.outputPower = 'Output Power' ;
        sectionContent1.outputPower = bookingDetails?.outputPower;
    }
    if(bookingDetails?.warrantyType) {
        sectionTitles1.warrantyType = 'Warranty' ;
        sectionContent1.warrantyType = bookingDetails?.warrantyType;
    }
    if(bookingDetails?.specification) {
        sectionTitles1.specification = 'Vehicle Specification' ;
        sectionContent1.specification = bookingDetails?.vehicle_specification;
    }
    if(bookingDetails?.charger_type) {
        sectionTitles1.charger_type = 'Charger Type' ;
        sectionContent1.charger_type = bookingDetails?.charger_type;
    }
    if(bookingDetails?.connector_type) {
        sectionTitles1.connector_type = 'Connector Type' ;
        sectionContent1.connector_type = bookingDetails?.connector_type;
    }
    const sectionTitles2 = {
        description : "Features"
    }
    const sectionContent2 = {
        description : (<>
            <ul className="list-disc list-inside">
                {bookingDetails?.charger_feature.map((feature, index) => (
                    <li key={index}>{feature}</li>
                ))}
            </ul>
        </>),
    }
    const sectionTitles4  = {}
    const sectionContent4 = {}
    if(bookingDetails?.description) {
        sectionTitles4.description = "Description" ;
        sectionContent4.description = bookingDetails?.description;
    }
    const imageTitles = {
        coverImage    : "Cover Image",
        galleryImages : "Gallery Images",
    }
    const imageContent = {
        coverImage      : bookingDetails?.charger_image,
        baseUrl         : baseUrl,
        galleryImages   : imageGallery,
        galleryImagesId : imageGalleryId,
    }
    const pdfTitles = {
        evChargerFiles : "Specification PDF",
    }
    const pdfContent = {
        evChargerFiles : bookingDetails?.specification_pdf,
        baseUrl        : baseUrl,
    }
    return (
        <div className='main-container'>
            <ToastContainer />
            <BookingDetailsHeader
                content={content} titles={headerTitles}
                type='evChargerDetails'
            />
            <div className={styles.ChargerDetailsSection}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
                sectionTitles4={sectionTitles4} sectionContent4={sectionContent4}
                sectionTitles7={sectionTitles2} sectionContent7={sectionContent2}
                type='evChargerDetails' />

                <BookingImageSection
                    titles={imageTitles} content={imageContent}
                    type='evChargerDetails'
                />
                { bookingDetails?.specification_pdf && 
                    <BookingMultipleImages
                        titles={pdfTitles} content={pdfContent}
                        type='evChargerDetails' 
                    /> 
                }
                <BookingMultipleImages
                    titles={imageTitles} content={imageContent}
                    type='evChargerDetails' onRemoveImage={handleRemoveGalleryImage}
                />
            </div>
        </div>
    )
}
// onRemoveImage={handleRemoveGalleryImage}
export default EvChargerDetails