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

const portableChargerStatusMapping = {
    ...statusMapping,
    'RL' : 'Mobile Charging Van Reached at Location',
    'RO' : 'Mobile Charging Van Reached at Office',
    'PU' : 'Mobile Charging Van Picked Up',
};

const rsaStatusMapping = {
    ...statusMapping,
    'RL' : 'Mobile Charging Van Reached at Location',
    'RO' : 'Mobile Charging Van Reached at Office',
};

const AppSignupDetails = () => {
    const userDetails  = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                                              = useNavigate();
    const {riderId}                                             = useParams();
    const [riderDetails, setRiderDetails]                       = useState();
    const [riderAddressList, setRiderAddressList]               = useState([]);
    const [vehicleList, setVehicleList]                         = useState([]);
    const [portableChargerBookings, setPortableChargerBookings] = useState([]);
    const [pickAndDropBookings, setPickAndDropBookings]         = useState([]);
    const [rsaBookings, setRsaBookings]                         = useState([]);
    const [pkgBookings, setPkgBookings]                         = useState([]);

    const portableChargerHeaders = [ 
        'Schedule Date','Booking ID', 'Price', 'Status', 'Assigned Driver', 'Action' 
    ]; 
    const rsaHeaders = [ 
        'Date','Booking ID', 'Price', 'Status', 'Assigned Driver', 'Action' 
    ]; 
    const pickAndDropHeaders = [ 'Schedule Date','Booking ID', 'Price', 'Status', 'Assigned Driver', 'Action' ];

    const pkgHeaders = [ 
        "Vendor", "Emirate", "EV Make & Model", "Purchase Date", "Service Package", "Action"
    ]; 

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
    // Total Portable Charger bookings count for section heading
    const [portableTotalCount, setPortableTotalCount]   = useState(0);

    const [valetCurrentPage, setValetCurrentPage] = useState(1);
    const [valetTotalPages, setValetTotalPages]   = useState(1);
    // Total Pick and Drop bookings count for section heading
    const [valetTotalCount, setValetTotalCount]   = useState(0);

    const [rSACurrentPage, setRSACurrentPage] = useState(1);
    const [rSATotalPages, setRSATotalPages]   = useState(1);
    // Total RSA bookings count for section heading
    const [rsaTotalCount, setRsaTotalCount]   = useState(0);

    const [pkgCurrentPage, setPkgCurrentPage] = useState(1);
    const [pkgTotalPages, setPkgTotalPages]   = useState(1);
    const [pkgTotalCount, setPkgTotalCount]   = useState(0);

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
                // Store total POD bookings for heading display
                setPortableTotalCount(response?.total || response?.data?.length || 0);
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
                // Store total Valet bookings for heading display
                setValetTotalCount(response?.total || response?.data?.length || 0);
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
                // Store total RSA bookings for heading display
                setRsaTotalCount(response?.total || response?.data?.length || 0);
            }  
        });
    };

    const pkgBooking = () => {

        if(!riderDetails?.rider_mobile) return false;

        obj.service_type  = 'PKG';
        obj.page_no       = pkgCurrentPage;
        obj.mobile_number = riderDetails.rider_mobile;

        getRequestWithToken('vendor-customer-list', obj, (response) => {
            if (response.code === 200) {

                setPkgBookings(response?.data);
                setPkgTotalPages(response?.total_page || 1); 
                setPkgTotalCount(response?.total || 0);
            }  
        });
    };
    useEffect(() => { podBooking(); }, [portableCurrentPage]);
    useEffect(() => { valetBooking(); }, [valetCurrentPage]);
    useEffect(() => { rsaBooking(); }, [rSACurrentPage]);
    useEffect(() => { pkgBooking(); }, [riderDetails, pkgCurrentPage]);

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
                {( portableChargerBookings?.length > 0 || pickAndDropBookings?.length > 0 || rsaBookings?.length > 0 || pkgBookings?.length > 0 
                ) && (
                    <>
                    {( portableChargerBookings?.length > 0 || pickAndDropBookings?.length > 0 || rsaBookings?.length > 0 ) && (
                        <div className={styles.DetailsMainHeading}>Booking History</div>
                    )}
                    { portableChargerBookings?.length > 0 && (<>
                        <DetailsBookingHistory
                            // title="Portable Charger"
                            title="Mobile & Portable EV Charging Service"
                            // Pass total bookings count to show beside heading
                            count={portableTotalCount}
                            headers={portableChargerHeaders}
                            bookingData={portableChargerBookings.map((booking) => {
                                return {
                                    id             : booking.booking_id,
                                    rsa_name       : booking.rsa_name,
                                    service_name   : booking.service_name,
                                    service_type   : booking.service_type,
                                    price          : `AED ${booking.service_price || '0'}`,
                                    datetime       : moment(booking.slot_date).format('DD MMM YYYY'),
                                    status         : portableChargerStatusMapping[booking.status] || '',
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
                    { pickAndDropBookings?.length > 0 && (<>
                        <DetailsBookingHistory
                            title="Pick and Drop"
                            // Pass total bookings count to show beside heading
                            count={valetTotalCount}
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
                    { rsaBookings?.length > 0 && (<>
                        <DetailsBookingHistory
                            title       = "Roadside Assistance"
                            // Pass total bookings count to show beside heading
                            count       = {rsaTotalCount}
                            headers     = { rsaHeaders }
                            bookingData = { rsaBookings.map((booking) => {
                                return {
                                    id             : booking.request_id,
                                    rsa_name       : booking.rsa_name,
                                    price          : `AED ${booking.price || '0'}`,
                                    datetime       : moment(booking.created_at).format('DD MMM YYYY'),
                                    status         : rsaStatusMapping[booking.order_status] || '',
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
                    { pkgBookings?.length > 0 && (<>
                        <DetailsBookingHistory
                            title       = "Customer Package List"
                            count       = {pkgTotalPages}
                            headers     = { pkgHeaders }
                            bookingData = { pkgBookings.map((booking) => {

                                const packages = []
                                if(booking?.pod_charging_session_number ?? 0) {
                                    packages.push({
                                        name: 'Mobile & Portable Charging',
                                        used: booking?.pod_used_session_number ?? 0,
                                        total: booking?.pod_charging_session_number ?? 0,
                                        validity: booking?.pod_charging_session_validity
                                    });
                                }
                                if(booking?.rsa_charging_session_number ?? 0) {
                                    packages.push({
                                        name: 'Roadside Assistance',
                                        used: booking?.rsa_used_session_number ?? 0,
                                        total: booking?.rsa_charging_session_number ?? 0,
                                        validity: booking?.rsa_charging_session_validity
                                    });
                                }
                                // "Vendor", "Emirate", "EV Make & Model", "Purchase Date", "Service Package",
                                return {
                                    id              : booking.customer_id,
                                    vendor_name     : booking.vendor_name,
                                    emirate         : booking.emirate,
                                    makeModel       : booking.makeModel,
                                    purchase_date   : moment(booking.purchase_date).format('DD MMM YYYY'),
                                    service_package : (
                                        <div className="service-packages">
                                            {packages.map((pkg) => (
                                                <div
                                                    className="service-package-row"
                                                    key={pkg.name}
                                                >
                                                    <span className="service-package-name">
                                                        {pkg.name}
                                                    </span>
                                                    <span className="service-package-count">
                                                        {pkg.used} / {pkg.total}
                                                    </span>
                                                    <span className="service-package-validity">
                                                        {pkg.validity
                                                            ? moment(pkg.validity).format('DD MMM YYYY')
                                                            : '-'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ),
                                };
                            })}
                            bookingType="Customer Package List"
                            // "Vendor", "Emirate", "EV Make & Model", "Purchase Date", "Service Package", "Action"
                        />
                        <Pagination
                            currentPage={pkgCurrentPage}
                            totalPages={pkgTotalPages}
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