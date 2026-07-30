import React, { useEffect, useState } from 'react';
import styles from './subscription.module.css'
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader'
import BookingDetailsSection from '../SharedComponent/Details/BookingDetails/BookingDetailsSection'
import BookingImageSection from '../SharedComponent/Details/BookingDetails/BookingImageSection'
import { postRequestWithToken } from '../../api/Requests';
import BookingLeftDetails from '../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from 'react-router-dom';


const SubscriptionDetails = () => {
  const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
  const navigate                            = useNavigate()
  const { subId }                           = useParams()
  const [bookingDetails, setBookingDetails] = useState()
  const [imageGallery, setImageGallery]     = useState()
  const [baseUrl, setBaseUrl]               = useState()


  const fetchDetails = () => {
    const obj = {
      userId          : userDetails?.user_id,
      email           : userDetails?.email,
      subscription_id : subId
    };

    postRequestWithToken('subscription-detail', obj, (response) => {
      if (response.code === 200) {
        setBookingDetails(response?.data || {});
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
    bookingIdTitle       : "Subscription ID",
    customerDetailsTitle : "Customer Details",
  };
  const content = {
    bookingId       : bookingDetails?.subscription_id,
    createdAt       : moment(bookingDetails?.created_at).format('DD MMM YYYY h:mm A'),
    customerName    : bookingDetails?.rider_name,
    customerContact : `${bookingDetails?.country_code} ${bookingDetails?.rider_mobile}`,
  };

  const sectionTitles1 = {
    amount       : "Amount",
    bookingLimit : "Booking Limit",
    totalBooking : "Total Booking",
  }
  const sectionContent1 = {
    amount       : bookingDetails?.amount,
    bookingLimit : bookingDetails?.booking_limit,
    totalBooking : bookingDetails?.total_booking,

  }

  const sectionTitles2 = {
    paymentDate : "Payment Date",
    expiry      : "Expiry",
    // leaseUrl    : "Lease URL"
  }
  const sectionContent2 = {
    paymentDate : bookingDetails?.payment_date,
    expiry      : bookingDetails?.expiry_date,
    // leaseUrl    : bookingDetails?.lease_url
  }

  const sectionTitles3 = {
   status: 'Status'
  }
  const sectionContent3 = {
    status: bookingDetails?.status === 1 ? 'Active' : "Inactive"
  }

  const sectionTitles4 = {
    description: "Description"
  }
  const sectionContent4 = {
    description: bookingDetails?.description,
  }

  const imageTitles = {
    coverImage    : "Cover Gallery",
    galleryImages : "Vehicle Gallery",
  }

  const imageContent = {
    coverImage    : bookingDetails?.image,
    galleryImages : imageGallery,
    baseUrl       : baseUrl,
  }

  return (
    <div className={styles.appSignupSection}>
      <BookingDetailsHeader
        content={content} titles={headerTitles}
        type='subscription'
      />
      <div className={styles.ChargerDetailsSection}>
        <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
          sectionTitles2={sectionTitles2} sectionContent2={sectionContent2}
          // sectionTitles3={sectionTitles3} sectionContent3={sectionContent3}
          // sectionTitles4={sectionTitles4} sectionContent4={sectionContent4}
          type='electricBikeLeasing' />

        {/* <BookingImageSection
          titles={imageTitles} content={imageContent}
          type='electricBikeLeasing'
        /> */}
      </div>
    </div>
  )
}

export default SubscriptionDetails