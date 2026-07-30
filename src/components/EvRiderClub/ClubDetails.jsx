import React, { useEffect, useState } from 'react';
import styles from './club.module.css';
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader';
// import BookingDetailsSection from '../SharedComponent/Details/BookingDetails/BookingDetailsSection'
import BookingImageSection from '../SharedComponent/Details/BookingDetails/BookingImageSection';
import BookingMultipleImages from '../SharedComponent/Details/BookingDetails/BookingMultipleImages.jsx';
import { postRequestWithToken } from '../../api/Requests';
import BookingLeftDetails from '../SharedComponent/BookingDetails/BookingLeftDetails.jsx';
import { useParams } from 'react-router-dom';
// import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';


const ClubDetails = () => {
  const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
  const navigate                            = useNavigate();
  const { clubId }                          = useParams();
  const [bookingDetails, setBookingDetails] = useState();
  const [imageGallery, setImageGallery]     = useState();
  const [imageGalleryId, setImageGalleryId] = useState();
  const [baseUrl, setBaseUrl]               = useState();


  const fetchDetails = () => {
    const obj = {
      userId  : userDetails?.user_id,
      email   : userDetails?.email,
      club_id : clubId
    };

    postRequestWithToken('club-data', obj, (response) => {
      if (response.code === 200) {
        setBookingDetails(response?.club || {});
        setImageGallery(response.galleryData)
        setImageGalleryId(response.galleryId)
        setBaseUrl(response.base_url)
      } else {
        console.log('error in club-data API', response);
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
    bookingIdTitle      : "Club ID",
    stationDetailsTitle : "Club Name",
  };
  const content = {
    bookingId   : bookingDetails?.club_id,
    stationName : bookingDetails?.club_name,
  };

  const sectionTitles1 = {
    clubLocation : "Club Location",
    noOfMembers  : "No of Members",
    preference   : "Preference",
  }
  const sectionContent1 = {
    clubLocation : bookingDetails?.location,
    noOfMembers  : bookingDetails?.no_of_members,
    preference   : bookingDetails?.preference,

  }

  const sectionTitles2 = {
    category : "Category",
    ageGroup : "Age Group",
    clubUrl  : "Club URL"
  }
  const sectionContent2 = {
    category : bookingDetails?.category,
    ageGroup : bookingDetails?.age_group,
    leaseUrl : bookingDetails?.url_link
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
    galleryImages : "Club Gallery",
  }

  const imageContent = {
    coverImage      : bookingDetails?.cover_img,
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
        postRequestWithToken('club-delete-img', obj, async (response) => {
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
        type='electricCarLeasing'
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

export default ClubDetails