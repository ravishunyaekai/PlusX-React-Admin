import React, { useEffect, useState } from 'react';
import styles from './shop.module.css';
import BookingDetailsHeader from '../../../SharedComponent/Details/BookingDetails/BookingDetailsHeader';
import BookingImageSection from '../../../SharedComponent/Details/BookingDetails/BookingImageSection';
import BookingMultipleImages from '../../../SharedComponent/Details/BookingDetails/BookingMultipleImages.jsx';
import { postRequestWithToken } from '../../../../api/Requests';
import BookingLeftDetails from '../../../SharedComponent/BookingDetails/BookingLeftDetails.jsx';
import AddressList from '../../../SharedComponent/Details/AddressList.jsx'
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

    const getFormattedOpeningHours = (details) => {
        if (details?.always_open === 1) {
            return "Always Open";
        }
        if (!details?.open_days || !details?.open_timing) {
            return "No opening hours available";
        }
        let days, timings;
        // Handle JSON array format or concatenated string format for open_days
        if (details.open_days.includes("_")) {
            // Parse concatenated string format
            days = details.open_days .split("_") .map(day => day.charAt(0).toUpperCase() + day.slice(1) );
        } else {
            // Parse JSON array
            days = JSON.parse(details.open_days).map(day => day.charAt(0).toUpperCase() + day.slice(1) );
        }
        // Split the open_timing string by underscores to get individual time ranges
        timings = details.open_timing.split("_").map(timeRange => {
            const [start, end] = timeRange.split("-");
            return `${formatToAmPm(start)} - ${formatToAmPm(end)}`;
        });
        // Check if all timings are the same
        const allSameTimings = timings.every(time => time === timings[0]);
        if (allSameTimings) {
            return `${days.join(', ')}: ${timings[0]}`;
        }
        // Group consecutive days with the same timings
        const formattedOpeningHours = [];
        let i = 0;
        while (i < days.length) {
            const startDay = days[i];
            const currentTiming = timings[i];
            let j = i;

            // Find consecutive days with the same timing
            while (j < days.length - 1 && timings[j + 1] === currentTiming) {
                j++;
            }
            const dayRange = startDay + (i === j ? "" : ` - ${days[j]}`);
            formattedOpeningHours.push(`${dayRange}: ${currentTiming}`);
            i = j + 1;
        }
        return formattedOpeningHours.join(', ');
    };
    const formatToAmPm = (time) => {
        const [hour, minute] = time.split(":").map(Number);
        const period = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 || 12; // Convert hour to 12-hour format
        return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
    };

const ShopDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const { shopId }                          = useParams();
    const [bookingDetails, setBookingDetails] = useState();
    const [imageGallery, setImageGallery]     = useState([]);
    const [imageGalleryId, setImageGalleryId] = useState([]);
    const [baseUrl, setBaseUrl]               = useState();

    const fetchDetails = () => {
        const obj = {
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            shop_id : shopId
        };
        postRequestWithToken('shop-view', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.shop || {});
                setImageGallery(response?.galleryData)
                setImageGalleryId(response.galleryId)
                setBaseUrl(response.base_url)

            } else {
                console.log('error in public-charger-station-details API', response);
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
        bookingIdTitle   : "Shop ID",
        shopDetailsTitle : "Shop Details",
    };
    const content = {
        bookingId : bookingDetails?.shop_id,
        createdAt : moment(bookingDetails?.created_at).format('DD MMM YYYY'),
        shopName  : bookingDetails?.shop_name,
        contact   : bookingDetails?.contact_no,
    };
    const sectionTitles1 = {
        brands         : "Brands",
        services       : "Services",
        openingDetails : "Opening Details",
        address        : "Full Address",
        status         : "Status"
    }
    const sectionContent1 = {
        brands         : bookingDetails?.brands.map( (item) => item.label ).join(", "),
        services       :  bookingDetails?.services.map( (item) => item.label ).join(", "),
        openingDetails : getFormattedOpeningHours(bookingDetails),
        address        : bookingDetails?.address,
        status         : bookingDetails?.status === 1 ? 'Active' : 'Inactive'
    }
    const sectionTitles2 = {
        offer_details : "Offer Details"
    }
    const sectionContent2 = {
        offer_details : bookingDetails?.description,
    }
    const sectionTitles4 = {
        description  : "Description",
    }
    const sectionContent4 = {
        description : bookingDetails?.description,
    }
    const imageTitles = {
        coverImage : "Cover Gallery",
    }
    const imageContent = {
        coverImage : bookingDetails?.cover_image,
        baseUrl    : baseUrl,
    }

    const imageTitles2 = {
        galleryImages : "Station Gallery",
    }
    const imageContent2 = {
        galleryImages  : imageGallery,
        galleryImagesId: imageGalleryId,
        baseUrl        : baseUrl,
    }
    const handleRemoveGalleryImage = (galleryId) => {
        const confirmDelete = window.confirm("Do you want to delete this item?");
        if (confirmDelete) {
            const obj = { 
                userId     : userDetails?.user_id,
                email      : userDetails?.email,
                gallery_id : galleryId 
            };
            postRequestWithToken('shop-gallery-delete', obj, async (response) => {
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

    return (
        <div className='main-container'>
            <ToastContainer />
            <BookingDetailsHeader content={content} titles={headerTitles} type='shop' />
            <div className={styles.ChargerDetailsSection}>
                
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
                    
                    sectionTitles4={sectionTitles4} sectionContent4={sectionContent4}
                   sectionTitles7={sectionTitles2} sectionContent7={sectionContent2}
                    type='portableChargerBooking'
                />
                {/* <AddressList className={styles.shopDetailsList} addressList={address} />  */}
                <BookingImageSection
                    titles={imageTitles} content={imageContent}
                    type='publicChargingStation'
                />
                <BookingMultipleImages
                    titles={imageTitles2} content={imageContent2}
                    type='publicChargingStation' onRemoveImage={handleRemoveGalleryImage}
                />
            </div>
        </div>
    )
}
export default ShopDetails