import React, { useEffect, useState } from 'react';
import styles from './evguide.module.css';
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader';
import BookingImageSection from '../SharedComponent/Details/BookingDetails/BookingImageSection';
import BookingMultipleImages from '../SharedComponent/Details/BookingDetails/BookingMultipleImages.jsx';
import { postRequestWithToken } from '../../api/Requests';
import BookingLeftDetails from '../SharedComponent/BookingDetails/BookingLeftDetails.jsx';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';


const GuideDetails = () => {
  const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
  const navigate                            = useNavigate();
  const { vehicleId }                       = useParams();
  const [bookingDetails, setBookingDetails] = useState();
  const [imageGallery, setImageGallery]     = useState();
  const [imageGalleryId, setImageGalleryId] = useState();
  const [baseUrl, setBaseUrl]               = useState();


  const fetchDetails = () => {
    const obj = {
      userId     : userDetails?.user_id,
      email      : userDetails?.email,
      vehicle_id : vehicleId
    };

    postRequestWithToken('ev-guide-details', obj, (response) => {
      if (response.code === 200) {
        setBookingDetails(response?.data || {});
        setImageGallery(response.gallery_data)
        setImageGalleryId(response.gallery_id)
        setBaseUrl(response.base_url)
      } else {
        console.log('error in ev-guide-details API', response);
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
    bookingIdTitle      : "Vehicle ID",
    stationDetailsTitle : "Vehicle Name",
  };
  const content = {
    bookingId   : bookingDetails?.vehicle_id,
    stationName : bookingDetails?.vehicle_name,
  };

  const sectionTitles1 = {
    vehicleType : "Vehicle Type",
    modelName   : "Model Name",
    engine      : "Engine",
  }
  const sectionContent1 = {
    vehicleType : bookingDetails?.vehicle_type,
    modelName   : bookingDetails?.vehicle_model,
    engine      : bookingDetails?.engine,

  }

  const sectionTitles2 = {
    horsePower : "Horse Power",
    maxSpeed   : "Max Speed",
    status     : "Status"
  }
  const sectionContent2 = {
    horsePower : bookingDetails?.horse_power,
    maxSpeed   : bookingDetails?.max_speed,
    status     : bookingDetails?.status === 1 ? 'Active' : "Inactive"
  }

  const sectionTitles3 = {
   bestFeature: 'Best Feature'
  }
  const sectionContent3 = {
    bestFeature: bookingDetails?.best_feature
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
        postRequestWithToken('ev-guide-gallery-delete', obj, async (response) => {
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
        type='evGuide'
      />
      <div className={styles.ChargerDetailsSection}>
        <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
          sectionTitles2={sectionTitles2} sectionContent2={sectionContent2}
          sectionTitles3={sectionTitles3} sectionContent3={sectionContent3}
          sectionTitles4={sectionTitles4} sectionContent4={sectionContent4}
          type='evGuide' />

        <BookingImageSection
          titles={imageTitles} content={imageContent}
          type='evGuide'
        />
        <BookingMultipleImages
          titles={imageTitles} content={imageContent}
          type='evGuide' onRemoveImage={handleRemoveGalleryImage}
        />
      </div>
    </div>
  )
}

export default GuideDetails