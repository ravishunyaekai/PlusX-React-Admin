import React, { useEffect, useState } from 'react';
import List from '../../SharedComponent/List/List'
import AddDriver from '../../../assets/images/AddDriver.svg';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../SharedComponent/Pagination/Pagination'
import Custommodal from '../../SharedComponent/CustomModal/CustomModal';
import { postRequestWithToken } from '../../../api/Requests';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList';

const statusMapping = {
    'CNF': 'Booking Confirmed',
    'A'  : 'Assigned',
    'RL' : 'POD Reached at Location',
    'CS' : 'Charging Started',
    'CC' : 'Charging Completed',
    'PU' : 'POD Picked Up',
    'WC' : 'Work Completed',
    'C'  : 'Cancel'
};

const dynamicFilters = [
    // {
    //     label: 'Status', 
    //     name: 'order_status', 
    //     type: 'select', 
    //     options: [
    //         { value: '', label: 'Select Status' },
    //         { value: 'CNF', label: 'Confirmed' },
    //         { value: 'A', label: 'Assigned' },
    //         { value: 'VP', label: 'Vehicle Pickup' },
    //         { value: 'RS', label: 'Reached Charging Spot' },
    //         { value: 'CC', label: 'Charging Completed' },
    //         { value: 'DO', label: 'Drop Off' },
    //         { value: 'WC', label: 'Work Completed' },
    //         { value: 'C', label: 'Cancel' },
    //     ]
    // },
]

const EvPreSaleBookingList = () => {
    const userDetails                                 = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                                    = useNavigate();
    const [chargerBookingList, setChargerBookingList] = useState([]);
    const [rsaList, setRsaList]                       = useState([]);                              
    const [currentPage, setCurrentPage]               = useState(1);
    const [totalPages, setTotalPages]                 = useState(1);
    const [filters, setFilters]                       = useState({start_date: null,end_date: null});
    const [isModalOpen, setIsModalOpen]               = useState(false);
    const [selectedBookingId, setSelectedBookingId]   = useState(null);
    const [selectedDriverId, setSelectedDriverId]     = useState(null);
    const [loading, setLoading]                       = useState(false);
    const searchTerm = [
        {
            label: 'search', 
            name: 'search_text', 
            type: 'text'
        }
    ]

    const fetchList = (page, appliedFilters = {}) => {
        if (page === 1 && Object.keys(appliedFilters).length === 0) {
            setLoading(false);
        } else {
            setLoading(true);
        } 

        const obj = {
            userId       : userDetails?.user_id,
            email        : userDetails?.email,
            service_type : 'Valet Charging',
            page_no      : page,
            ...appliedFilters,
        }

        postRequestWithToken('ev-pre-sale-list', obj, async(response) => {
            if (response.code === 200) {
                setChargerBookingList(response?.data)
                setTotalPages(response?.total_page || 1); 
            } else {
                // toast(response.message, {type:'error'})
                console.log('error in ev-pre-sale-list api', response);
            }
            setLoading(false);
        })

        postRequestWithToken('all-rsa-list', obj, async(response) => {
            if (response.code === 200) {
                setRsaList(response?.data)
            } else {
                // toast(response.message, {type:'error'})
                console.log('error in public-charger-station-list api', response);
            }
        })
    }

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login'); 
            return; 
        }
        fetchList(currentPage, filters);
    }, [currentPage, filters]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);  
        setCurrentPage(1); 
    };

    const openModal = (bookingId) => {
        setSelectedBookingId(bookingId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBookingId(null);
    };

    const handleDriverSelect = (driver) => {
        setSelectedDriverId(driver);
    };

    const assignDriver = () => {
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            rsa_id     : selectedDriverId, 
            booking_id : selectedBookingId
        }
        postRequestWithToken('/pick-and-drop-assign', obj, async(response) => {
            if (response.code === 200) {
                setIsModalOpen(false);
                alert(response.message || response.message[0])
                fetchList(currentPage, filters);
            } else {
                // toast(response.message, {type:'error'})
                alert(response.message || response.message[0])
                console.log('error in /pick-and-drop-assign api', response);
            }
        })

    }

    return (
        <div className='main-container'>
            <SubHeader heading = "EV Pre-Sale Testing Booking List"
                fetchFilteredData={fetchFilteredData} 
                dynamicFilters={dynamicFilters} filterValues={filters}
                searchTerm = {searchTerm}
            />

            {loading ? <Loader /> : 
                chargerBookingList.length === 0 ? (
                        <EmptyList
                            tableHeaders={["Date", "Booking ID", "Owner Name", "Vehicle", "Action"]}
                            message="No data available"
                        />
                    ) : (
                    <>
                        <List 
                            tableHeaders={["Date", "Booking ID", "Owner Name", "Vehicle", "Action"]}
                            listData = {chargerBookingList}
                            keyMapping={[
                            { 
                                key: 'created_at', 
                                label: 'Invoice Date', 
                                format: (date) => moment(date).format('DD MMM YYYY ') 
                            } ,
                            { key: 'booking_id', label: 'ID' }, 
                            
                            { key: 'owner_name', label: 'Owner Name' }, 
                            { key: 'vehicle_data', label: 'Vehicle' }, 
                            ]}
                            pageHeading="EV Pre-Sale Testing Booking List"
                        />
                        
                        <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={handlePageChange} 
                        />
                    </>
            )}

             <Custommodal
                isOpen={isModalOpen}
                onClose={closeModal}
                driverList={rsaList}
                bookingId = {selectedBookingId}
                onSelectDriver={handleDriverSelect}
                onAssignDriver={assignDriver}
            />
        </div>
    );
};

export default EvPreSaleBookingList;
