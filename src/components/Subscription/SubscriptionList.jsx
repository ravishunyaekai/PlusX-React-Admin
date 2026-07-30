import React, { useEffect, useState } from 'react';
import List from '../SharedComponent/List/List'
import styles from './subscription.module.css'
import SubHeader from '../SharedComponent/SubHeader/SubHeader'
import Pagination from '../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../api/Requests';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Loader from "../SharedComponent/Loader/Loader";
import EmptyList from '../SharedComponent/EmptyList/EmptyList';

const dynamicFilters = [
]

const addButtonProps = {
    heading : "Add Club",
    link    : "/add-club"
};

const SubscriptionList = () => {
    const userDetails                    = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                       = useNavigate();
    const [clubList, setClubList]        = useState([]);
    const [currentPage, setCurrentPage]  = useState(1);
    const [totalPages, setTotalPages]    = useState(1);
    const [totalCount, setTotalCount]    = useState(1);
    const [filters, setFilters]          = useState({start_date: null,end_date: null});
    const [refresh, setRefresh]          = useState(false);
    const [loading, setLoading]          = useState(false);
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
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            page_no : page,
            ...appliedFilters,
        }

        postRequestWithToken('subscription-list', obj, async (response) => {
            if (response.code === 200) {
                const updatedData = response.data.map((item) => ({
                    ...item,
                    remaining_booking: (item.booking_limit || 0) - (item.total_booking || 0),
                }));
                // setClubList(response?.data)
                setClubList(updatedData)
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 1)
            } else {
                // toast(response.message, {type:'error'})
                console.log('error in subscription-list api', response);
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
    }, [currentPage, filters, refresh]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleDeleteSlot = (clubId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this?");
        if (confirmDelete) {
            const obj = {
                userId: userDetails?.user_id,
                email: userDetails?.email,
                board_id: clubId
            };
            postRequestWithToken('discussion-board-delete', obj, async (response) => {
                if (response.code === 200) {
                    toast(response.message, { type: "success" });
                    setTimeout(() => {
                        setRefresh(prev => !prev);
                    }, 1000)

                } else {
                    toast(response.message, { type: 'error' });
                    console.log('error in discussion-board-delete api', response);
                }
            });
        }
    };

    return (
        <div className='main-container'>
            <ToastContainer />
            <SubHeader heading = "Subscription List"
                fetchFilteredData={fetchFilteredData} 
                dynamicFilters={dynamicFilters} filterValues={filters}
                addButtonProps={addButtonProps}
                searchTerm = {searchTerm}
                count = {totalCount}
            /> 

            {loading ? <Loader /> : 
                    clubList?.length === 0 ? (
                        <EmptyList
                            tableHeaders={["Subscription ID", "Customer Name", "Amount", "Booking Limit", "Booking Remaining", "Expiry Date", "Action"]}
                            message="No data available"
                        />
                    ) : (
                    <>
                        <List
                            tableHeaders={["Subscription ID", "Customer Name", "Amount", "Booking Limit", "Booking Remaining", "Expiry Date", "Action"]}
                            listData={clubList}
                            keyMapping={[
                                // { 
                                //     key: 'created_at', 
                                //     label: 'Date', 
                                //     format: (date) => moment(date).format('DD MMM YYYY') 
                                // },
                                { key: 'subscription_id', label: 'Subscription ID' }, 
                                { key: 'rider_name', label: 'Customer Name' }, 
                                // { key: 'amount', label: 'Amount' }, 
                                { 
                                    key: 'amount', 
                                    label: 'Amount', 
                                    format: (amount) => (amount ? `AED ${amount}` : '') 
                                },
                                { key: 'booking_limit', label: 'Booking Limit' }, 
                                { key: 'remaining_booking', label: 'Booking Remaining' }, 
                                { key: 'expiry_date', label: 'Expiry Date' }, 
                            ]}
                            pageHeading="Subscription List"
                            onDeleteSlot={handleDeleteSlot}
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

export default SubscriptionList;
