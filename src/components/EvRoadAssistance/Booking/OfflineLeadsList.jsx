import React, { useEffect, useState } from 'react';
import List from '../../SharedComponent/List/List';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken } from '../../../api/Requests';
import moment from 'moment';
import View from '../../../assets/images/ViewEye.svg'
import Edit from '../../../assets/images/Pen.svg';
import { useNavigate } from 'react-router-dom';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from "../../SharedComponent/EmptyList/EmptyList";

    const statusMapping = {
        'CNF' : 'Booking Confirmed',
        'A'   : 'Assigned',
        'ER'  : 'Enroute',
        'RL'  : 'POD Reached at Location',
        'CS'  : 'Charging Started',
        'CC'  : 'Charging Completed',
        'PU'  : 'Completed',
        'C'   : 'Cancelled',
        'RO'  : 'POD Reached at Office',
        'PNR' : 'Payment Not Received',
    };
    const dynamicFilters = [
        {
            label : 'Status', 
            name  : 'status', 
            type  : 'select', 
            options : [
                { value : '',    label : 'Select Status' },
                { value : 'CNF', label : 'Booking Confirmed' },
                { value : 'PU',  label : 'Booking Completed' },
            ]
        },
    ];
    const searchTerm = [
        {
            label: 'search', 
            name: 'search_text', 
            type: 'text'
        }
    ]

const OfflineLeadsList = () => {
    const userDetails                               = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                                  = useNavigate();
    const [offlineLeadsList, setOfflineLeadsList]   = useState([]);
    const [currentPage, setCurrentPage]             = useState(1);
    const [totalCount, setTotalCount]               = useState(1);
    const [totalPages, setTotalPages]               = useState(1);
    const [filters, setFilters]                     = useState({start_date: null,end_date: null});
    const [loading, setLoading]                     = useState(false);
    const [rowOptions, setRowOptions]    = useState([10, 25, 50, 100]);
    const [rowSelected, setARowSelected] = useState(10);

    const handleOfflineLeadDetails = (id) => navigate(`/ev-road-assistance/offline-leads-details/${id}`)
    const handleEditOfflineLead = (id) => navigate(`/ev-road-assistance/edit-offline-lead/${id}`)

    const fetchList = (page, appliedFilters = {}, rowSelected) => {
        if (page === 1 && Object.keys(appliedFilters).length === 0) {
            setLoading(false);
        } else {
            setLoading(true);
        } 
        const obj = {
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            page_no : page,
            rowSelected,
            ...appliedFilters,
        };
        postRequestWithToken('ev-road-assistance-offline-booking-list', obj, async (response) => {
            if (response.code === 200) {
                setOfflineLeadsList(response?.data);
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 1)
            } else {
                console.log('error in ev-road-assistance-offline-booking-list', response);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchList(currentPage, filters, rowSelected);
    }, [currentPage, filters, rowSelected ]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };
    const handleRowperPagePage = (limit) => {
        setARowSelected(limit);
    };
    const addButtonProps = {
        heading : "Add New Booking",
        link    : "/ev-road-assistance/add-offline-lead"
    };
    return (
        <div className='main-container'>
            <SubHeader
                heading="RSA Offline Leads"
                addButtonProps       = {addButtonProps}
                fetchFilteredData    = {fetchFilteredData}
                dynamicFilters       = {dynamicFilters}
                filterValues         = {filters}
                searchTerm           = {searchTerm}
                rowOptions           = {rowOptions}
                rowSelected          = {rowSelected}
                handleRowperPagePage = {handleRowperPagePage}
                count                = {totalCount}
            />

            {loading ? <Loader /> :          
                offlineLeadsList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Booking Date", "Booking ID", "Customer Name", "Price", "Status", "Driver Name", "Action",""]}
                        message="No data available"
                    />
                ) : (
                <>
                    <List
                        tableHeaders={["Booking Date", "Booking ID", "Customer Name", "Price", "Status", "Driver Name", "Action",""]}
                        listData={offlineLeadsList}
                        keyMapping={[
                            { key: 'created_at', label: 'Date & Time', format: (date) => moment(date).format('DD MMM YYYY hh:mm A') },
                            { key: 'request_id', label: 'Order ID' },
                            { key: 'name', label: 'Customer Name' },
                            { key: 'price', label: 'Price', format: (price) => (price != null && price !== '' ? `AED ${Number(price).toFixed(2)}` : '0') },
                            { key: 'order_status', label: 'Status', format: (status) => statusMapping[status] || status },
                            { key: 'driver_name', label: 'Driver Name' }, 
                            {
                                key: 'action',
                                label: 'Action',
                                relatedKeys: ['request_id'], 
                                format: (data) => (
                                    <div className="editButtonSection">
                                        <img 
                                            src={View} 
                                            alt="view" 
                                            onClick={() => handleOfflineLeadDetails(data.request_id)}
                                            className="viewButton"
                                        />
                                        <img
                                            src={Edit}
                                            alt="edit"
                                            onClick={() => handleEditOfflineLead(data.request_id)}
                                            className="viewButton"
                                        />
                                    </div>
                                )
                            }                            
                        ]}
                        pageHeading="RSA Offline Leads"
                    />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
};


export default OfflineLeadsList;
