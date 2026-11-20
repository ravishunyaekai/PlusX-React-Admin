import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import styles from './sessions.module.css';
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader'
import BookingImageSection from '../../SharedComponent/Details/BookingDetails/BookingImageSection'
import BookingMultipleImages from '../../SharedComponent/Details/BookingDetails/BookingMultipleImages.jsx';
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import moment from 'moment';
import 'react-toastify/dist/ReactToastify.css';

const formatTime = (timeStr) => {
    if (timeStr === "Closed") return "Closed";
    const [start, end] = timeStr?.split('-');
    const format12Hour = (time) => {
        const [hour, minute] = time?.split(':');
        const date = new Date();
        date.setHours(hour);
        date.setMinutes(minute);
        
        // Format the time to always show two digits for minute and ensure AM/PM
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace(':', ':'); 
    };
    return `${format12Hour(start)} - ${format12Hour(end)}`;
};

const getFormattedOpeningHours = (details) => {
    if (details?.always_open === 1) {
        return "Always Open";
    }
    if (!details?.open_days || !details?.open_timing) {
        return "No opening hours available";
    }
    const days = details?.open_days.split('_').map((day) => {
        // Capitalize the first letter of each day
        return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
    });
    const timings = details?.open_timing.split('_').map(formatTime);

    // Check if all the timings are the same
    const allSameTimings = timings.every(time => time === timings[0]);

    if (allSameTimings) {
        // If all days have the same timings, return a consolidated range for the whole week
        return `${days[0]}-${days[days.length - 1]}: ${timings[0]}`;
    }
    // Otherwise, show each day with its corresponding timings
    const formattedOpeningHours = [];
    let i = 0;
    while (i < days.length) {
        let startDay = days[i];
        let currentTiming = timings[i];
        let j = i;

        while (j < days.length - 1 && timings[j + 1] === currentTiming) {
            j++;
        }
        const dayRange = startDay + (i === j ? "" : `-${days[j]}`);
        formattedOpeningHours.push(`${dayRange}: ${currentTiming}`);
        i = j + 1;
    }
    return formattedOpeningHours.join(', ');
};


const SessionDetails = () => {
  const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
  const navigate                            = useNavigate()
  const { stationId }                       = useParams()
  const [sessionDetails, setSessionDetails] = useState()

    const fetchDetails = () => {
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            station_id : stationId
        };
        postRequestWithToken('session-details', obj, (response) => {
            if (response.code === 200) {
                setSessionDetails(response?.data || {});
                // setImageGallery(response.gallery_data)
                // setImageGalleryId(response.gallery_id)
                // setBaseUrl(response.base_url)
            } else {
                console.log('error in session-details API', response);
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
        voltage             : "Voltage",
        current             : "Current", 
        energy              : "Energy (Session)", 
        session_duration    : "Session Duration", 
    };
    const sectionTitles1 = {
        station_name : "Session ID",
        start_time   : "Charger ID",
        end_time     : "Station Name",
    }
    const sectionTitles2 = {
        duration    : "Duration",
        energy      : "Energy",
        status      : "Status",
    }
    const sectionTitles3 = {
        start_time    : "Start Time",
        end_time      : "End Time",
    }

    const content = {
        // bookingId     : sessionDetails?.station_id,
        // createdAt     : moment(sessionDetails?.created_at).format('DD MMM YYYY'),
        // chargerId     : sessionDetails?.price,
        voltage             : "233 V",
        current             : "16.2 A", 
        energy              : "8.5 kWh", 
        session_duration    : "32 min", 
    };
    const sectionContent1 = {
        station_name : sessionDetails?.station_name,
        start_time   : sessionDetails?.start_time,
        end_time     : sessionDetails?.end_time,
    }
    const sectionContent2 = {
        duration        : sessionDetails?.duration,
        energy          : sessionDetails?.energy,
        status          : sessionDetails?.status,
    }
    const sectionContent3 = {
        start_time        : sessionDetails?.start_time,
        end_time          : sessionDetails?.end_time,
    }
    
    return (
        <div className='main-container'>
            <ToastContainer />
            <BookingDetailsHeader titles={headerTitles} content={content}  type='partnersSession' />
            <div className={styles.bookingLeftContainer}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1} sectionTitles2={sectionTitles2} sectionContent2={sectionContent2} 
                    sectionTitles3={sectionTitles3} sectionContent3={sectionContent3}  type='partnersSession' />
            </div>
        </div>
    )
}

export default SessionDetails;

//   const [imageGallery, setImageGallery]     = useState();
//   const [imageGalleryId, setImageGalleryId] = useState();
//   const [baseUrl, setBaseUrl]               = useState()



    // const handleRemoveGalleryImage = (galleryId) => {
    //     const confirmDelete = window.confirm("Do you want to delete this item?");
    //     if (confirmDelete) {
    //         const obj = { 
    //             userId     : userDetails?.user_id,
    //             email      : userDetails?.email,
    //             gallery_id : galleryId 
    //         };
    //         postRequestWithToken('chargers-gallery-del', obj, async (response) => {
    //             if (response.code === 200) {
    //                 toast(response.message, { type: "success" });

    //                 setTimeout(() => {
    //                 fetchDetails();
    //                 }, 1000);
    //             } else {
    //                 toast(response.message, { type: 'error' });
    //             }
    //         });
    //     }
    // };

// const sectionTitles4 = {
    //     description : "Description"
    // }
    // const imageTitles = {
    //     coverImage    : "Cover Gallery",
    //     galleryImages : "Station Gallery",
    // }

    // const sectionContent4 = {
    //     description: sessionDetails?.description,
    // }
    // const imageContent = {
    //     coverImage      : sessionDetails?.station_image,
    //     galleryImages   : imageGallery,
    //     galleryImagesId : imageGalleryId,
    //     baseUrl         : baseUrl,
    //     slotDate        : moment(sessionDetails?.slot_date_time).format('DD MMM YYYY h:mm A'),
    // }






    {/* // sectionTitles4={sectionTitles4} sectionContent4={sectionContent4} */}

                {/* <BookingImageSection titles={imageTitles} content={imageContent} type='partnersSession' />
                <BookingMultipleImages titles={imageTitles} content={imageContent} type='partnersSession' onRemoveImage={handleRemoveGalleryImage} /> */}