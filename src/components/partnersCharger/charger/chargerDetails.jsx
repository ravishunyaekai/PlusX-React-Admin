import React, { useEffect, useState } from 'react';
import styles from './charger.module.css';
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx';
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx';
import { postRequestWithToken } from '../../../api/Requests.js';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { installationDateFromApi, readPartnerChargerDetails } from '../../../utils/partnerChargerFormHelpers';

const ChargerDetails = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const { chargerId } = useParams();
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);

    const fetchDetails = () => {
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            charger_id : chargerId,
        };
        postRequestWithToken('partner-charger-details', obj, (response) => {
            const ok = response.code === 200 || Number(response.status) === 1;
            if (ok) {
                setDetails(response?.data || {});
            } else {
                console.log('error in partner-charger-details API', response);
            }
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchDetails();
    }, [chargerId]);

    const headerTitles = {
        bookingIdTitle       : 'Charger ID',
        customerDetailsTitle : 'Charger Details',
    };

    const content = {
        bookingId    : details?.charger_id,
        createdAt    : details?.created_at
            ? moment(details.created_at).format('DD MMM YYYY h:mm A')
            : '—',
        customerName : details?.charger_name,
    };

    const sectionTitles1 = {
        station_name       : 'Station',
        manufacturer       : 'Manufacturer',
        model              : 'Model',
        serial_number      : 'Serial Number',
        charger_type       : 'Charger Type',
        rated_power        : 'Rated Power (kW)',
        connector_type     : 'Connector Type',
        no_of_connector    : 'Number of Connectors',
        input_supply       : 'Input Supply',
        output_voltage     : 'Max Output Voltage (V)',
        installation_date  : 'Installation Date',
        admin_status       : 'Administrative Status',
        sim_iccid          : 'SIM ICCID',
        imei_number        : 'IMEI',
        installation_note  : 'Installation Notes',
    };

    const fields = readPartnerChargerDetails(details || {});
    const display = (v) => (v == null || v === '' ? '—' : v);

    const sectionContent1 = {
        station_name       : display(fields.stationName || fields.stationId),
        manufacturer       : display(fields.manufacturer),
        model              : display(fields.model),
        serial_number      : display(fields.serialNumber),
        charger_type       : display(fields.chargerType),
        rated_power        : display(fields.ratedPower),
        connector_type     : display(fields.connectorType),
        no_of_connector    : display(fields.noOfConnector),
        input_supply       : display(fields.inputSupply),
        output_voltage     : display(fields.outputVoltage),
        installation_date  : installationDateFromApi(fields.installationDate) || '—',
        admin_status       : display(fields.adminStatus),
        sim_iccid          : display(fields.sim),
        imei_number        : display(fields.imei),
        installation_note  : display(fields.note),
    };

    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles} type='chargerInstallation' />
            <div className={styles.bookingLeftContainer}>
                <BookingLeftDetails
                    titles={sectionTitles1}
                    content={sectionContent1}
                    type='chargerInstallation'
                />
            </div>
        </div>
    );
};

export default ChargerDetails;