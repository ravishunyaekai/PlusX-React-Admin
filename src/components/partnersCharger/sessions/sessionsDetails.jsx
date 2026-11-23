import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from 'react-toastify';
import styles from './sessions.module.css';
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader';
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx';
import Loader from '../../SharedComponent/Loader/Loader';
import { getBackendErrorMessage } from '../../../utils/mapBackendErrorsToFields';
import { readPartnerSessionDetails } from '../../../utils/partnerChargerFormHelpers';
import 'react-toastify/dist/ReactToastify.css';

const formatMetric = (value, unit) => {
    if (value == null || value === '') return '—';
    return `${value} ${unit}`.trim();
};

const SessionDetails = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();
    const { chargerId, sessionId } = useParams();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDetails = () => {
        setLoading(true);
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            charger_id : chargerId,
            session_id : sessionId,
        };
        postRequestWithToken('partner-session-details', obj, (response) => {
            if (response.code === 200) {
                setDetails(readPartnerSessionDetails(response.data || {}));
            } else {
                toast(getBackendErrorMessage(response), { type: 'error' });
                setDetails(null);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        if (chargerId && sessionId) {
            fetchDetails();
        }
    }, [chargerId, sessionId]);

    const headerTitles = {
        voltage          : 'Voltage',
        current          : 'Current',
        energy           : 'Energy (Session)',
        session_duration : 'Session Duration',
    };

    const headerContent = {
        voltage          : formatMetric(details?.voltage, 'V'),
        current          : formatMetric(details?.current, 'A'),
        energy           : details?.energy_kwh != null ? `${details.energy_kwh} kWh` : '—',
        session_duration : details?.duration || '—',
    };

    const sectionTitles1 = {
        station_name : 'Session ID',
        start_time   : 'Charger ID',
        end_time     : 'Station Name',
    };

    const sectionContent1 = {
        station_name : details?.display_session_id,
        start_time   : details?.charger_id,
        end_time     : details?.station_name,
    };

    const sectionTitles2 = {
        duration : 'Duration',
        energy   : 'Energy',
        status   : 'Status',
    };

    const sectionContent2 = {
        duration : details?.duration,
        energy   : details?.energy_kwh != null ? `${details.energy_kwh} kWh` : '—',
        status   : details?.status,
    };

    const sectionTitles3 = {
        start_time : 'Start Time',
        end_time   : 'End Time',
        user       : 'User',
    };

    const sectionContent3 = {
        start_time : details?.start_time,
        end_time   : details?.end_time,
        user       : details?.user,
    };

    if (loading) {
        return (
            <div className="main-container">
                <Loader />
            </div>
        );
    }

    return (
        <div className="main-container">
            <ToastContainer />
            <BookingDetailsHeader titles={headerTitles} content={headerContent} type="partnersSession" />
            <div className={styles.bookingLeftContainer}>
                <BookingLeftDetails
                    titles={sectionTitles1}
                    content={sectionContent1}
                    sectionTitles2={sectionTitles2}
                    sectionContent2={sectionContent2}
                    sectionTitles3={sectionTitles3}
                    sectionContent3={sectionContent3}
                    type="partnersSession"
                />
            </div>
        </div>
    );
};

export default SessionDetails;