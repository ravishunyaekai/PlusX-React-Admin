import React, { useEffect, useState } from 'react';
import styles from './appsign.module.css'
import DetailsHeader from '../SharedComponent/Details/DetailsHeader'
// import DetailsSection from '../SharedComponent/Details/DetailsSection'
import DetailsList from '../SharedComponent/Details/DetailsList'
import DetailsBookingHistory from '../SharedComponent/Details/DeatilsBookingHistory'
import DetailsVehicleList from '../SharedComponent/Details/DetailsVehicleList'
import { getRequestWithToken } from '../../api/Requests';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import Pagination from '../SharedComponent/Pagination/Pagination';

const statusMapping = {
    'CNF': 'Booking Confirmed',
    'A'  : 'Assigned',
    'ER' : 'Enroute',
    'RL' : 'POD Reached at Location',
    'CS' : 'Charging Started',
    'CC' : 'Charging Completed',
    'PU' : 'Completed',
    'C'  : 'Cancelled',
    'RO' : 'POD Reached at Office',
    'WC' : 'Work Completed',
};

const AppSignupDetails = () => {
    const userDetails  = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                                              = useNavigate()
    const {riderId}                                             = useParams()
    const [riderDetails, setRiderDetails]                       = useState()
    const [riderAddressList, setRiderAddressList]               = useState([])
    const [vehicleList, setVehicleList]                         = useState([])
    const [portableChargerBookings, setPortableChargerBookings] = useState([])
    const [pickAndDropBookings, setPickAndDropBookings]         = useState([])
    const [rsaBookings, setRsaBookings]                         = useState([])

    const portableChargerHeaders = [ 
        'Schedule Date','Booking ID', 'Price', 'Status', 'Assigned Driver', 'Action' 
    ]; 
    const rsaHeaders = [ 
        'Date','Booking ID', 'Price', 'Status', 'Assigned Driver', 'Action' 
    ]; 
    const pickAndDropHeaders = [ 'Schedule Date','Booking ID', 'Price', 'Status', 'Assigned Driver', 'Action' ];
    const obj = {
        userId  : userDetails?.user_id,
        email   : userDetails?.email,
        riderId : riderId
    };
    const fetchDetails = () => {
        getRequestWithToken('rider-details', obj, (response) => {
            if (response.code === 200) {
                setRiderDetails(response?.data || {});  
                setRiderAddressList(response?.data?.riderAddress)
                setVehicleList(response?.data?.riderVehicles)
            } else {
                console.log('error in rider-details API', response);
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

    const [portableCurrentPage, setportableCurrentPage] = useState(1);
    const [portableTotalPages, setPortableTotalPages]   = useState(1);

    const [valetCurrentPage, setValetCurrentPage] = useState(1);
    const [valetTotalPages, setValetTotalPages]   = useState(1);

    const [rSACurrentPage, setRSACurrentPage] = useState(1);
    const [rSATotalPages, setRSATotalPages]   = useState(1);
    
    const handlePortablePageChange = (pageNumber) => {
        setportableCurrentPage(pageNumber);
    };
    const handleValetPageChange = (pageNumber) => {
        setValetCurrentPage(pageNumber);
    };
    const handleRSAPageChange = (pageNumber) => {
        setRSACurrentPage(pageNumber);
    };

    const podBooking = () => {
        obj.service_type = 'POD';
        obj.page_no      = portableCurrentPage;

        getRequestWithToken('rider-booking-list', obj, (response) => {
            if (response.code === 200) {
                console.log(response?.data);
                setPortableChargerBookings(response?.data);
                setPortableTotalPages(response?.totalPage); //total
            }  
        });
    };
    const valetBooking = () => {
        obj.service_type = 'Valet';
        obj.page_no      = valetCurrentPage;

        getRequestWithToken('rider-booking-list', obj, (response) => {
            if (response.code === 200) {
                setPickAndDropBookings(response?.data);
                setValetTotalPages(response?.totalPage); //total
            }  
        });
    };
    const rsaBooking = () => {
        obj.service_type = 'RSA';
        obj.page_no      = rSACurrentPage;

        getRequestWithToken('rider-booking-list', obj, (response) => {
            if (response.code === 200) {
                setRsaBookings(response?.data);
                setRSATotalPages(response?.totalPage); //total
            }  
        });
    };
    useEffect(() => { podBooking(); }, [portableCurrentPage]);
    useEffect(() => { valetBooking(); }, [valetCurrentPage]);
    useEffect(() => { rsaBooking(); }, [rSACurrentPage]);

    return (
        <div className='main-container'>
            <DetailsHeader headerDetails = {riderDetails}/>
            {/* <DetailsSection sectionDetails = {riderDetails}/> */}
            <div className='Details-container-section'>
                { riderAddressList.length && 
                    <DetailsList addressList = {riderAddressList}/>
                }
                { vehicleList.length && 
                    <DetailsVehicleList vehicleList = {vehicleList} />
                }
                {( portableChargerBookings?.length > 0 || pickAndDropBookings?.length > 0 || rsaBookings?.length > 0
                ) && (
                    <>
                    <div className={styles.DetailsMainHeading}>Booking History</div>
                    {portableChargerBookings?.length > 0 && (<>
                        <DetailsBookingHistory
                            title="Portable Charger"
                            headers={portableChargerHeaders}
                            bookingData={portableChargerBookings.map((booking) => {
                                return {
                                    id             : booking.booking_id,
                                    rsa_name       : booking.rsa_name,
                                    service_name   : booking.service_name,
                                    service_type   : booking.service_type,
                                    price          : `AED ${booking.service_price || '0'}`,
                                    datetime       : moment(booking.slot_date).format('DD MMM YYYY'),
                                    status         : statusMapping[booking.status] || '',
                                    // slot_date_time : moment(booking.slot_date).format('DD MMM YYYY') +' '+ moment(booking.slot_time, 'HH:mm:ss').format('hh:mm A'),
                                };
                            })}
                            bookingType="portableCharger"
                        />
                        <Pagination
                            currentPage={portableCurrentPage}
                            totalPages={portableTotalPages}
                            onPageChange={handlePortablePageChange}
                        />
                                             
                    </>)}
                    {pickAndDropBookings?.length > 0 && (<>
                        <DetailsBookingHistory
                            title="Pick and Drop"
                            headers={pickAndDropHeaders}
                            bookingData={pickAndDropBookings.map((booking) => {
                                return {
                                    id           : booking.request_id,
                                    rsa_name     : booking.rsa_name,
                                    price        : `AED ${booking.price || '0'}`,
                                    datetime     : moment(booking.slot_date_time).format('DD MMM YYYY'),
                                    status       : statusMapping[booking.order_status] || '',
                                    // slot_date_time : moment(booking.slot_date_time).format('DD MMM YYYY hh:mm A'),
                                };
                            })}
                            bookingType="pickAndDrop"
                            // valetRsaList = {valetRsaList}
                        />
                        <Pagination
                            currentPage={valetCurrentPage}
                            totalPages={valetTotalPages}
                            onPageChange={handleValetPageChange}
                        />
                    </>)}
                    {rsaBookings?.length > 0 && (<>
                        <DetailsBookingHistory
                            title       = "Roadside Assistance"
                            headers     = { rsaHeaders }
                            bookingData = { rsaBookings.map((booking) => {
                                return {
                                    id             : booking.request_id,
                                    rsa_name       : booking.rsa_name,
                                    price          : `AED ${booking.price || '0'}`,
                                    datetime       : moment(booking.created_at).format('DD MMM YYYY'),
                                    status         : statusMapping[booking.order_status] || '',
                                    // slot_date_time : '', 
                                };
                            })}
                            bookingType="Roadside Assistance"
                        />
                        <Pagination
                            currentPage={rSACurrentPage}
                            totalPages={rSATotalPages}
                            onPageChange={handleRSAPageChange}
                        />
                    </>)}
                    </>
                )}
            </div>
        </div>
    )
}
export default AppSignupDetails