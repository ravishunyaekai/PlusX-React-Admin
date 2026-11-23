import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from 'react-toastify';
import styles from './station.module.css';
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader';
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx';
import { getBackendErrorMessage } from '../../../utils/mapBackendErrorsToFields';
import { readPartnerStationDetails } from '../../../utils/partnerChargerFormHelpers';
import 'react-toastify/dist/ReactToastify.css';

const display = (value) => (value == null || value === '' ? '—' : value);

const StationDetails = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();
    const params = useParams();
    const stationId = params.stationId ?? params.stationID;
    const [stationDetails, setStationDetails] = useState(null);

    const fetchDetails = () => {
        if (!stationId) {
            return;
        }
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            station_id : String(stationId).trim(),
        };
        postRequestWithToken('partner-station-details', obj, (response) => {
            const ok = response.code === 200 || Number(response.status) === 1;
            if (ok) {
                setStationDetails(response?.data || {});
            } else {
                toast(getBackendErrorMessage(response), { type: 'error' });
            }
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchDetails();
    }, [stationId]);

    const fields = readPartnerStationDetails(stationDetails || {});

    const headerTitles = {
        station_id     : 'Station ID',
        station_name   : 'Station Name',
        station_type   : 'Station Type',
        admin_status   : 'Administrative Status',
        operator_name  : 'Operator Name',
        no_of_chargers : 'Number of Chargers',
    };

    const content = {
        station_id     : display(fields.station_id),
        station_name   : display(fields.station_name),
        station_type   : display(fields.station_type),
        admin_status   : display(fields.admin_status),
        operator_name  : display(fields.operator_name),
        no_of_chargers : display(fields.no_of_chargers),
    };

    const sectionTitles1 = {
        address : 'Address',
        city    : 'City',
        emirate : 'Emirate',
    };

    const sectionContent1 = {
        address : display(fields.address),
        city    : display(fields.city),
        emirate : display(fields.emirate),
    };

    const sectionTitles2 = {
        country     : 'Country',
        postal_code : 'Postal Code',
        lat         : 'Latitude',
        long        : 'Longitude',
    };

    const sectionContent2 = {
        country     : display(fields.country),
        postal_code : display(fields.postal_code),
        lat         : display(fields.lat),
        long        : display(fields.long),
    };

    const sectionTitles3 = {
        contact_person : 'Contact Person',
        contact_number : 'Contact Number',
        operation_hour : 'Operating Hours',
        master_email   : 'Master Email',
    };

    const sectionContent3 = {
        contact_person : display(fields.contact_person),
        contact_number : display(fields.contact_number),
        operation_hour : display(fields.operation_hour),
        master_email   : display(fields.master_email),
    };

    const sectionTitles4 = {
        description : 'Station Description',
    };

    const sectionContent4 = {
        description : display(fields.description),
    };

    return (
        <div className="main-container">
            <ToastContainer />
            <BookingDetailsHeader titles={headerTitles} content={content} type="partnersStation" />
            <div className={styles.bookingLeftContainer}>
                <BookingLeftDetails
                    titles={sectionTitles1}
                    content={sectionContent1}
                    sectionTitles2={sectionTitles2}
                    sectionContent2={sectionContent2}
                    sectionTitles3={sectionTitles3}
                    sectionContent3={sectionContent3}
                    sectionTitles4={sectionTitles4}
                    sectionContent4={sectionContent4}
                    type="partnersStation"
                />
            </div>
        </div>
    );
};

export default StationDetails;