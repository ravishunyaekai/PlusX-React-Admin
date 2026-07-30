import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader';
import BookingMultipleImages from '../SharedComponent/Details/BookingDetails/BookingMultipleImages.jsx';
import BookingLeftDetails from '../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import { postRequestWithToken } from '../../api/Requests';
import styles from './evbuysell.module.css';
import 'react-toastify/dist/ReactToastify.css';

const BuySellDetails = () => {
  const userDetails                          = JSON.parse(sessionStorage.getItem('userDetails'));
  const navigate                             = useNavigate();
  const { sellId }                           = useParams();
  const [bookingDetails, setBookingDetails]  = useState();
  const [imageGallery, setImageGallery]      = useState();
  const [baseUrl, setBaseUrl]                = useState();


  const fetchDetails = () => {
    const obj = {
      userId  : userDetails?.user_id,
      email   : userDetails?.email,
      sell_id : sellId
    };

    postRequestWithToken('buy-sell-detail', obj, (response) => {
      if (response.code === 200) {
        setBookingDetails(response?.data || {});
        // setImageGallery(response.galleryData)

        const carImages     = response?.data?.car_images ? response.data.car_images.split('*') : [];
        const carTyreImages = response?.data?.car_tyre_image ? response.data.car_tyre_image.split('*') : [];
        const otherImages   = response?.data?.other_images ? response.data.other_images.split('*') : [];
      
        setImageGallery({
          coverImages   : carImages,               
          galleryImages : carImages,            
          tyreImages    : carTyreImages,            
          otherImages   : otherImages              
        });

        setBaseUrl(response.base_url)
      } else {
        console.log('error in buy-sell-detail API', response);
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
    bookingIdTitle       : "Sell ID",
    customerDetailsTitle : "Owner Details",
    vehicleDetailsTitle  : "Vehicle Details"
  };
  const content = {
    bookingId       : bookingDetails?.sell_id,
    customerName    : bookingDetails?.rider_name,
    customerContact : `${bookingDetails?.country_code} ${bookingDetails?.rider_mobile}`,
    vehicleId       : bookingDetails?.vehicle_id,
    vehicleModel    : bookingDetails?.vehicle_data
  };

  const sectionTitles1 = {
    price          : "Price",
    region         : "Regiion",
    engineCapacity : "Engine Capacity",
  }
  const sectionContent1 = {
    price          : bookingDetails?.price,
    region         : bookingDetails?.region,
    engineCapacity : bookingDetails?.engine_capacity,

  }

  const sectionTitles2 = {
    horsePower : "Horse Power",
    bodyType   : "Body Type",
    milage     : "Milage"
  }
  const sectionContent2 = {
    horsePower : bookingDetails?.horse_power,
    bodyType   : bookingDetails?.body_type,
    milage     : bookingDetails?.milage
  }

  const sectionTitles3 = {
   year     : 'Year',
   interior : "Interior Colour",
   exterior : "Exterior Colour"
  }
  const sectionContent3 = {
    year     : bookingDetails?.year,
    interior : bookingDetails?.interior_color,
    exterior : bookingDetails?.exterior_color
  }

  const sectionTitles5 = {
    doors        : 'Doors',
    ownerType    : "Owner Type",
    seatCapacity : "Seat Capacity"
   }
   const sectionContent5 = {
    doors        : bookingDetails?.doors,
    ownerType    : bookingDetails?.owner_type,
    seatCapacity : bookingDetails?.seat_capacity
   }

   const sectionTitles6 = {
    fuelType : "Feul Type",
    warranty : "Warranty",
    features : "Technical Features"
  }
  const sectionContent6 = {
    fuelType : bookingDetails?.fuel_type,
    warranty : bookingDetails?.warrenty,
    features : bookingDetails?.technical_features
  }

  const sectionTitles4 = {
    description: "Description"
  }
  const sectionContent4 = {
    description: bookingDetails?.description,
  }

  const imageTitles1 = {
    galleryImages: "Car Images",
  };
  const imageContent1 = {
    galleryImages: imageGallery?.galleryImages,
    baseUrl,
  };

  const imageTitles2 = {
    tyreImages: "Car Tyre Images",
  };
  const imageContent2 = {
    tyreImages: imageGallery?.tyreImages,
    baseUrl,
  };

  const imageTitles3 = {
    otherImages: "Other Images",
  };
  const imageContent3 = {
    otherImages: imageGallery?.otherImages,
    baseUrl,
  };

  return (
    <div className='main-container'>
      <BookingDetailsHeader
        content={content} titles={headerTitles}
        type='buySell'
      />
      <div className={styles.ChargerDetailsSection}>
        <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
          sectionTitles2={sectionTitles2} sectionContent2={sectionContent2}
          sectionTitles3={sectionTitles3} sectionContent3={sectionContent3}
          sectionTitles5={sectionTitles5} sectionContent5={sectionContent5}
          sectionTitles6={sectionTitles6} sectionContent6={sectionContent6}
          sectionTitles4={sectionTitles4} sectionContent4={sectionContent4}
          type='buySell' 
        />
        <BookingMultipleImages
          titles={imageTitles1} content={imageContent1}
          type='buySell'
        />
        <BookingMultipleImages
          titles={imageTitles2} content={imageContent2}
          type='buySell'
        />
        <BookingMultipleImages
          titles={imageTitles3} content={imageContent3}
          type='buySell'
        />
      </div>
    </div>
  )
}

export default BuySellDetails;