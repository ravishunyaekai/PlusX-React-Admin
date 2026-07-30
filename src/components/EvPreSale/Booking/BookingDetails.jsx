import React, { useEffect, useState } from 'react';
import styles from './booking.module.css'
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader'
import { postRequestWithToken } from '../../../api/Requests';
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';


const EvPreSaleBookingDetails = () => {
  const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
  const navigate                            = useNavigate()
  const { bookingId }                       = useParams()
  const [bookingDetails, setBookingDetails] = useState()
  const [imageGallery, setImageGallery]     = useState()
  const [baseUrl, setBaseUrl]               = useState()


  const fetchDetails = () => {
    const obj = {
      userId     : userDetails?.user_id,
      email      : userDetails?.email,
      booking_id : bookingId
    };

    postRequestWithToken('ev-pre-sale-detail', obj, (response) => {
      if (response.code === 200) {
        setBookingDetails(response?.data || {});
        setImageGallery(response.galleryData)
        setBaseUrl(response.base_url)
      } else {
        console.log('error in ev-pre-sale-detail API', response);
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
    bookingIdTitle       : "Booking ID",
    customerDetailsTitle : "Customer Details",
  };
  const content = {
    bookingId       : bookingDetails?.booking_id,
    createdAt       : moment(bookingDetails?.created_at).format('DD MMM YYYY h:mm A'),
    customerName    : bookingDetails?.owner_name,
    customerContact : `+${bookingDetails?.country_code} ${bookingDetails?.mobile_no}`,
  };

  const sectionTitles1 = {
    dob     : "Date Of Birth",
    country : "Country",
    email   : "Email",
  }
  const sectionContent1 = {
    dob     : bookingDetails?.date_of_birth,
    country : bookingDetails?.country,
    email   : bookingDetails?.email,

  }

  const sectionTitles2 = {
    vehicle : "Vehicle Data",
    slot    : "Slot Time",
    reason  : "Reason"
  }
  const sectionContent2 = {
    vehicle : bookingDetails?.vehicle_data,
    slot    : bookingDetails?.slot_date,
    reason  : bookingDetails?.reason_of_testing
  }

  const sectionTitles3 = {
   address: 'Pickup Address'
  }
  const sectionContent3 = {
    // address: bookingDetails?.pickup_address
    address: (
      <a
          href={`https://www.google.com/maps?q=${bookingDetails?.pickup_latitude},${bookingDetails?.pickup_longitude}`}
          target="_blank"
          rel="noopener noreferrer"
        className='linkSection'
      >
          {bookingDetails?.pickup_address || 'View on Map'}
      </a>
  ),
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
    <div className='main-container'>
      <BookingDetailsHeader
        content={content} titles={headerTitles}
        type='subscription'
      />
      <div className={styles.ChargerDetailsSection}>
        <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
          sectionTitles2={sectionTitles2} sectionContent2={sectionContent2}
          sectionTitles3={sectionTitles3} sectionContent3={sectionContent3}
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

export default EvPreSaleBookingDetails