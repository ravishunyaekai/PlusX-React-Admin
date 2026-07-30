import React, { useEffect, useState } from 'react';
import styles from './electricbike.module.css';
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader';
// import BookingDetailsSection from '../SharedComponent/Details/BookingDetails/BookingDetailsSection';
import BookingImageSection from '../SharedComponent/Details/BookingDetails/BookingImageSection';
import BookingMultipleImages from '../SharedComponent/Details/BookingDetails/BookingMultipleImages.jsx';
import { postRequestWithToken } from '../../api/Requests';
import BookingLeftDetails from '../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import { useParams } from 'react-router-dom';
// import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';


const ElectricBikeDetails = () => {
  const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
  const navigate                            = useNavigate();
  const { rentalId }                        = useParams();
  const [bookingDetails, setBookingDetails] = useState();
  const [imageGallery, setImageGallery]     = useState();
  const [imageGalleryId, setImageGalleryId] = useState();
  const [baseUrl, setBaseUrl]               = useState();


  const fetchDetails = () => {
    const obj = {
      userId     : userDetails?.user_id,
      email      : userDetails?.email,
      rental_id  : rentalId
    };

    postRequestWithToken('electric-bike-detail', obj, (response) => {
      if (response.code === 200) {
        setBookingDetails(response?.bike || {});
        setImageGallery(response.galleryData)
        setImageGalleryId(response.galleryId)
        setBaseUrl(response.base_url)
      } else {
        console.log('error in electric-bike-detail API', response);
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
    bookingIdTitle      : "Rental ID",
    stationDetailsTitle : "Bike Name",
  };
  const content = {
    bookingId   : bookingDetails?.rental_id,
    stationName : bookingDetails?.bike_name,
  };

  const sectionTitles1 = {
    bikeType    : "Bike Type",
    availableOn : "Available On",
    contract    : "Contract",
  }
  const sectionContent1 = {
    bikeType    : bookingDetails?.bike_type,
    availableOn : bookingDetails?.available_on,
    contract    : bookingDetails?.contract,

  }

  const sectionTitles2 = {
    feature  : "Feature",
    price    : "Price",
    leaseUrl : "Lease URL"
  }
  const sectionContent2 = {
    feature  : bookingDetails?.feature,
    price    : bookingDetails?.price,
    leaseUrl : bookingDetails?.lease_url
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
    coverImage      : bookingDetails?.image,
    galleryImages   : imageGallery,
    galleryImagesId : imageGalleryId,
    baseUrl         : baseUrl,
  }

  const handleRemoveGalleryImage = (galleryId) => {
    const confirmDelete = window.confirm("Do you want to delete this item?");
    if (confirmDelete) {
        const obj = { 
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            gallery_id : galleryId 
        };
        postRequestWithToken('electric-bike-gallery-delete', obj, async (response) => {
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
      <BookingDetailsHeader
        content={content} titles={headerTitles}
        type='electricBikeLeasing'
      />
      <div className={styles.ChargerDetailsSection}>
        <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
          sectionTitles2={sectionTitles2} sectionContent2={sectionContent2}
          sectionTitles3={sectionTitles3} sectionContent3={sectionContent3}
          sectionTitles4={sectionTitles4} sectionContent4={sectionContent4}
          type='electricBikeLeasing' />

        <BookingImageSection
          titles={imageTitles} content={imageContent}
          type='electricBikeLeasing'
        />
         <BookingMultipleImages 
          titles={imageTitles} content={imageContent}
          type='electricBikeLeasing' onRemoveImage={handleRemoveGalleryImage}/>
      </div>
    </div>
  )
}

export default ElectricBikeDetails