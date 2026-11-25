import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import styles from './charger.module.css';
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx';
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx';
import PartnerChargingSession from '../../SharedComponent/Details/PartnerChargingSession.jsx';
import Loader from '../../SharedComponent/Loader/Loader';
import { postRequestWithToken } from '../../../api/Requests.js';
import { getBackendErrorMessage } from '../../../utils/mapBackendErrorsToFields';
import {
    buildPartnerChargerSessionHistoryRequest,
    installationDateFromApi,
    mapPartnerChargerDetailsHeaderContent,
    mapPartnerChargerSessionHistoryRows,
    pickPartnerChargerLiveSession,
    readPartnerChargerDetails,
    readPartnerSessionDetails,
} from '../../../utils/partnerChargerFormHelpers';
import 'react-toastify/dist/ReactToastify.css';

const display = (value) => (value == null || value === '' ? '—' : value);

const formatMetric = (value, unit) => {
    if (value == null || value === '') return '—';
    return `${value} ${unit}`.trim();
};

const ChargerDetails = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const { chargerId } = useParams();
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [sessionRows, setSessionRows] = useState([]);
    const [totalSessions, setTotalSessions] = useState(0);
    const [liveMetrics, setLiveMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userDetails?.access_token) {
            navigate('/login');
            return;
        }
        if (!chargerId) {
            return;
        }

        const userId = userDetails.user_id;
        const email = userDetails.email;
        let cancelled = false;

        const fetchSessionHistory = () => {
            const payload = buildPartnerChargerSessionHistoryRequest(
                { user_id: userId, email },
                chargerId,
                1
            );
            postRequestWithToken('partner-session-list', payload, (response) => {
                if (cancelled) return;
                const ok = response.code === 200 || Number(response.status) === 1;
                if (!ok) {
                    return;
                }
                const rows = Array.isArray(response.data) ? response.data : [];
                const forCharger = mapPartnerChargerSessionHistoryRows(rows, chargerId);
                setSessionRows(forCharger);
                setTotalSessions(Number(response.total) || forCharger.length);

                const liveSession = pickPartnerChargerLiveSession(rows);
                if (!liveSession?.session_id) {
                    setLiveMetrics(null);
                    return;
                }

                postRequestWithToken(
                    'partner-session-details',
                    {
                        userId,
                        email,
                        charger_id : liveSession.charger_id ?? chargerId,
                        session_id : liveSession.session_id,
                    },
                    (detailResponse) => {
                        if (cancelled) return;
                        if (detailResponse.code === 200) {
                            setLiveMetrics(readPartnerSessionDetails(detailResponse.data || {}));
                        } else {
                            setLiveMetrics(null);
                        }
                    }
                );
            });
        };

        setLoading(true);
        setDetails(null);
        setSessionRows([]);
        setTotalSessions(0);
        setLiveMetrics(null);

        postRequestWithToken(
            'partner-charger-details',
            { userId, email, charger_id: chargerId },
            (response) => {
                if (cancelled) return;
                const ok = response.code === 200 || Number(response.status) === 1;
                if (ok) {
                    setDetails(response?.data || {});
                    fetchSessionHistory();
                } else {
                    toast(getBackendErrorMessage(response), { type: 'error' });
                    setDetails(null);
                }
                setLoading(false);
            }
        );

        return () => {
            cancelled = true;
        };
    }, [chargerId, navigate]);

    const fields = readPartnerChargerDetails(details || {});

    const topHeaderTitles = {
        charger_id         : 'Charger ID',
        charger_name       : 'Charger Name',
        station            : 'Station',
        admin_status       : 'Administrative Status',
        input_supply       : 'Input Supply',
        max_output_voltage : 'Maximum Output Voltage (V)',
        sim_iccid          : 'SIM ICCID',
        imei               : 'IMEI',
    };

    const topHeaderContent = mapPartnerChargerDetailsHeaderContent(fields, display);

    const sectionTitles1 = {
        manufacturer  : 'Manufacturer',
        model         : 'Model',
        serial_number : 'Serial Number',
    };

    const sectionContent1 = {
        manufacturer  : display(fields.manufacturer),
        model         : display(fields.model),
        serial_number : display(fields.serialNumber),
    };

    const sectionTitles2 = {
        charger_type   : 'Charger Type',
        rated_power    : 'Rated Power (kW)',
        connector_type : 'Connector Type',
    };

    const sectionContent2 = {
        charger_type   : display(fields.chargerType),
        rated_power    : display(fields.ratedPower),
        connector_type : display(fields.connectorType),
    };

    const sectionTitles3 = {
        no_of_connector   : 'Number of Connectors',
        installation_date : 'Installation Date',
    };

    const sectionContent3 = {
        no_of_connector   : display(fields.noOfConnector),
        installation_date : installationDateFromApi(fields.installationDate) || '—',
    };

    const sectionTitles4 = {
        installation_note : 'Installation Notes',
    };

    const sectionContent4 = {
        installation_note : display(fields.note),
    };

    const metricTitles = {
        voltage          : 'Voltage',
        current          : 'Current',
        energy           : 'Energy (Session)',
        session_duration : 'Session Duration',
    };

    const metricContent = {
        voltage          : formatMetric(liveMetrics?.voltage, 'V'),
        current          : formatMetric(liveMetrics?.current, 'A'),
        energy           : liveMetrics?.energy_kwh != null ? `${liveMetrics.energy_kwh} kWh` : '—',
        session_duration : liveMetrics?.duration || '—',
    };

    const sessionHeaders = [
        'Session ID',
        'Start Date & Time',
        'End Date & Time',
        'Duration',
        'Energy (kWh)',
        'Status',
        'Action',
    ];

    if (loading && !details) {
        return (
            <div className="main-container">
                <Loader />
            </div>
        );
    }

    return (
        <div className="main-container">
            <ToastContainer />
            <BookingDetailsHeader
                titles={topHeaderTitles}
                content={topHeaderContent}
                type="partnerCharger"
            />
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
                />
                <BookingDetailsHeader
                    titles={metricTitles}
                    content={metricContent}
                    type="partnersSession"
                />
                <PartnerChargingSession
                    title="Total Charging Sessions"
                    count={totalSessions}
                    headers={sessionHeaders}
                    bookingData={sessionRows}
                    chargerId={chargerId}
                />
            </div>
        </div>
    );
};

export default ChargerDetails;