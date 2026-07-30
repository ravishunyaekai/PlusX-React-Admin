import React, {useState, useEffect} from 'react';
import styles from './emergency.module.css'
import { Link } from 'react-router-dom';
// import Eye from '../../../assets/images/ViewEye.svg'
import moment from 'moment';
// import { getAddressFromLatLong } from '../../../api/Requests'; 
import Pagination from '../SharedComponent/Pagination/Pagination';
import AccordionFilter from '../SharedComponent/Accordion/Accordions';
import { postRequestWithToken } from '../../api/Requests'; 
import Filter from '../../assets/images/Filter.svg';

const TruckFuelHistory = ({truckId}) => { 
    const userDetails                                       = JSON.parse(sessionStorage.getItem('userDetails')); 
    const [currentPage, setCurrentPage]                     = useState(1);
    const [totalPages, setTotalPages]                       = useState(1);
    const [filters, setFilters]                             = useState({start_date: null,end_date: null});
    const [history, setHistory]                             = useState([]);
    const [isFilterAccordionOpen, setIsFilterAccordionOpen] = useState(false);
    const [imageBaseUrl, setImageBaseUrl]                   = useState('');

    const driverlocationList = (page_no = 1) => {
        const bookingObj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            truckId     : truckId,
            page_no    : page_no,
            ...filters,
        };  
        postRequestWithToken('truck-fuel-history', bookingObj, (response) => {
            if (response.code === 200) {
            
                setHistory(response?.data || []);
                setTotalPages(response?.total_page || 1);
                setImageBaseUrl(response?.image_url || '');
            } else {
                console.log('error in rider-details API', response);
            }
        });
    };
    useEffect(() => {
        driverlocationList(currentPage);

    }, [currentPage, filters]);
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };
    const toggleFilterAccordion = () => {
        setIsFilterAccordionOpen((prev)=> !prev);
    };
    return (
        <div className={styles.addressListContainer}>
            <div className={styles.headerCharger}>
                <span className={styles.sectionTitle}>Fuel History List</span>
                <div className={styles.addButtonSection} onClick={toggleFilterAccordion}>
                    <div className={styles.addButtonImg}>
                        <img src={Filter} alt='Filter' />
                    </div>
                    <div className={styles.addButtonText}>Filter</div>
                </div>
            </div>
            {isFilterAccordionOpen && (
                <div className={styles.accordian}>
                    <AccordionFilter
                        type={"TruckDetails"}
                        isOpen={isFilterAccordionOpen}
                        fetchFilteredData={fetchFilteredData}
                        filterValues={filters}
                    />
                </div>
            )}
            <table className={`table ${styles.customTable}`}>
                <thead>
                    <tr>
                        <th>Sr. No. </th>
                        <th>Date </th>
                        <th>Time </th>
                        <th>Driver Name</th>
                        <th>Amount</th>
                        <th>Fuel ( in Ltr)</th>
                        <th>Meter Reading</th>
                        <th>Invoice Image </th>
                        <th>Truck Image </th>
                    </tr>
                </thead>
                <tbody>
                    {history && history?.length > 0 ? (
                        history?.map((item, index) => (
                            <tr key={index}>
                                <td>{ index+1 }</td>
                                <td>{moment(item?.created_at).format('DD MMM YYYY') }</td>
                                <td>{moment(item?.created_at).format('HH:mm A') }</td>
                                <td>{ item?.rsa_name }</td>
                                <td>{ item?.amount }</td>
                                <td>{ item?.fuel_litter }</td>
                                <td>{ item?.meter_reading }</td>
                                <td>
                                    <img key={index} src={imageBaseUrl+item?.invoice_image } alt={`Img${index}`} style={{ maxWidth: '70px', height: '50px', width: '80px', margin: '5px' }} />
                                </td>
                                <td>
                                    <img key={index} src={imageBaseUrl+item?.truck_image } alt={`Img${index}`} style={{ maxWidth: '70px', height: '50px', width: '80px', margin: '5px' }} />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'start', padding: '10px' }}>
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>    
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
    );
};

export default TruckFuelHistory;