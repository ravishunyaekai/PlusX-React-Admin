import React, { useEffect, useState } from 'react';
import List from '../../SharedComponent/List/List'
import Cancel from '../../../assets/images/Cancel.svg';
import View from '../../../assets/images/ViewEye.svg'
import AddDriver from '../../../assets/images/AddDriver.svg';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../SharedComponent/Pagination/Pagination'
import Custommodal from '../../SharedComponent/CustomModal/CustomModal';
import ModalAssign from '../../SharedComponent/BookingDetails/ModalAssign.jsx'
import { postRequestWithToken } from '../../../api/Requests';
import moment from 'moment';

import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList.jsx';

const statusMapping = {
    'PNR' : 'Payment Not Received',
};

const FailedBookingList = () => {
    const userDetails                                 = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                                    = useNavigate();
    const [chargerBookingList, setChargerBookingList] = useState([]);
    const [currentPage, setCurrentPage]               = useState(1);
    const [totalCount, setTotalCount]                 = useState(1);
    const [totalPages, setTotalPages]                 = useState(1);
    const [filters, setFilters]                       = useState({start_date: null,end_date: null});
    const [loading, setLoading]                       = useState(false);
    const searchTerm = [
        {
            label : 'search', 
            name  : 'search_text', 
            type  : 'text'
        }
    ]
    const handlePDBookingDetails = (id) => navigate(`/pick-and-drop/failed-valet-booking-details/${id}`)

    const fetchList = (page, appliedFilters = {}) => {
        if (page === 1 && Object.keys(appliedFilters).length === 0) {
            setLoading(false);
        } else {
            setLoading(true);
        } 
        const obj = {
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            page_no : page,
            ...appliedFilters,
        }
        postRequestWithToken('failed-pick-and-drop-booking-list', obj, async(response) => {
            if (response.code === 200) {
                setChargerBookingList(response?.data)
                setTotalPages(response?.total_page || 1); 
                setTotalCount(response?.total || 1)
            } else {
                // toast(response.message, {type:'error'})
                console.log('error in pick-and-drop-booking-list api', response);
            }
            setLoading(false);
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
    return (
        <div className='main-container'>
            <SubHeader heading = "Failed Pick & Drop Booking List"
                fetchFilteredData={fetchFilteredData} 
                filterValues={filters}
                searchTerm={searchTerm}
                count={totalCount}
            />
            {loading ? <Loader /> :
                chargerBookingList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Booking Date", "Booking ID", "Customer Name", "Price", "Status", "Driver Assign", "Action",""]}
                        message="No data available"
                    />
                ) : (
                    <>
                        <List 
                            tableHeaders={["Booking Date", "Booking ID", "Customer Name", "Price", "Status", "Action",""]}
                            listData = {chargerBookingList}
                            keyMapping={[
                                { 
                                    key: 'created_at', 
                                    label: 'Booking Date', 
                                    format: (date) => moment(date).format('DD MMM YYYY') 
                                } ,
                                { key: 'request_id', label: 'ID' }, 
                                { key: 'name', label: 'Customer Name' }, 
                                { 
                                    key: 'price', 
                                    label: 'Price', 
                                    // format: (price) => (price ? `AED ${price}` : 'AED 0') 
                                    format : (amount) => (`AED ${ ( amount ).toFixed(2) }` )
                                },
                                {   key: 'order_status',
                                    label: 'Status',
                                    format: (status) => statusMapping[status] || status 

                                },
                                
                                {
                                    key: 'action',
                                    label: 'Action',
                                    relatedKeys: ['order_status'], 
                                    format: (data, key, relatedKeys) => {

                                        return (
                                            <div className="editButtonSection">
                                                {/* View Button (Always Displayed) */}
                                                <img 
                                                    src={View} 
                                                    alt="view" 
                                                    onClick={() => handlePDBookingDetails(data.request_id)} 
                                                    className="viewButton" 
                                                />                                                
                                            </div>
                                        );
                                    }
                                }
                            ]}
                            pageHeading="Pick & Drop Booking List"
                        />
                        <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={handlePageChange} 
                        />
                    </>
                )
            }
        </div>
    );
};

export default FailedBookingList;
