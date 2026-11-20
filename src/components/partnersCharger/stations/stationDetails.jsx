import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import styles from './station.module.css';
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


const StationDetails = () => {
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
        postRequestWithToken('partner-station-details', obj, (response) => {
            if (response.code === 200) {
                setSessionDetails(response?.data || {});
            } else {
                console.log('error in partner-station-details API', response);
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
        station_id      : "Station ID",
        station_name    : "Station Name", 
        station_type    : "Station Type", 
        admin_status    : "Administrative Status",
        operator_name   : "Operator Name",
        no_of_chargers  : "Number of Chargers",
    };
    const sectionTitles1 = {
        address     : "Address",
        city        : "City",
        emirate     : "Emirate",
    }
    const sectionTitles2 = {
        country    : "Country",
        lat        : "Latitude",
        long       : "Longitude",
    }
    const sectionTitles3 = {
        contact_person      : "Contact Person",
        contact_number      : "Contact Number",
        operation_hour      : "Operating Hours",
    }
    const sectionTitles4 = {
        description         : "Station Description",
    }

    const content = {
        // bookingId     : sessionDetails?.station_id,
        // createdAt     : moment(sessionDetails?.created_at).format('DD MMM YYYY'),
        // chargerId     : sessionDetails?.price,
        station_id       : sessionDetails?.station_id,
        station_name     : sessionDetails?.station_name,
        station_type     : sessionDetails?.station_type,
        admin_status     : sessionDetails?.admin_status,
        operator_name    :sessionDetails?.operator_name,
        no_of_chargers   : sessionDetails?.no_of_chargers,
    };
    const sectionContent1 = {
        address : sessionDetails?.address,
        city    : sessionDetails?.city,
        emirate : sessionDetails?.emirate,
    }
    const sectionContent2 = {
        country  : sessionDetails?.country,
        lat      : sessionDetails?.lat,
        long     : sessionDetails?.long,
    }
    const sectionContent3 = {
        contact_person      : sessionDetails?.contact_person,
        contact_number      : sessionDetails?.contact_number,
        operation_hour      : sessionDetails?.operation_hour,
    }
    const sectionContent4 = {
        description         : sessionDetails?.no_of_chargers,
    }
    
    return (
        <div className='main-container'>
            <ToastContainer />
            <BookingDetailsHeader titles={headerTitles} content={content}  type='partnersStation' />
            <div className={styles.bookingLeftContainer}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1} sectionTitles2={sectionTitles2} sectionContent2={sectionContent2} 
                    sectionTitles3={sectionTitles3} sectionContent3={sectionContent3}  sectionTitles4={sectionTitles4} sectionContent4={sectionContent4} type='partnersStation' />
            </div>
        </div>
    )
}

export default StationDetails;
