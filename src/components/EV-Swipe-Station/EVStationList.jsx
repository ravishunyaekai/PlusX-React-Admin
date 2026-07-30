import React, { useEffect, useState } from 'react';
import List from '../SharedComponent/List/List';
import styles from './chargerbooking.module.css'
import SubHeader from '../SharedComponent/SubHeader/SubHeader';
import Pagination from '../SharedComponent/Pagination/Pagination';
import {postRequestWithToken } from '../../api/Requests';
import moment from "moment-timezone";
import { useNavigate } from 'react-router-dom';
import EmptyList from '../SharedComponent/EmptyList/EmptyList';
import Loader from "../SharedComponent/Loader/Loader";

    const statusMapping = {
        '0' : 'In-active',
        '1' : 'Active'
    };
    const searchTerm = [
        {
            label : 'search', 
            name  : 'search_text', 
            type  : 'text'
        }
    ]

const EVStationList = () => {
    const userDetails                   = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                      = useNavigate();
    const [bikeList, setBikeList]     = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages]   = useState(1);
    const [filters, setFilters]         = useState({start_date: null,end_date: null}); 
    const [loading, setLoading]         = useState(false);

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
        };
        postRequestWithToken('swipe-station-list', obj, async (response) => {
            if (response.code === 200) {
                setBikeList(response?.data);
                setTotalPages(response?.total_page || 1);
            } else {
                console.log('error in bike-list api', response);
            }
            setLoading(false);
        });
    };
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
    const addButtonProps = {
        heading: "Add Swipe Station", 
        link: "/ev-battery-swipe/add-station"
    };
    return (
        <div className='main-container'>
            <SubHeader
                heading="Swipe Station List"
                addButtonProps={addButtonProps}
                filterValues={filters}
                searchTerm = {searchTerm}
                fetchFilteredData= {fetchFilteredData} 
            />
            {loading ? <Loader /> :
                bikeList.length === 0 ? (
                    <EmptyList
                        tableHeaders={[ "Station ID", "Station Name", "No. Of Slot", "Added Date & Time", "Action"]}
                        message="No data available"
                    />
                ) : (
                    <>
                        <List
                            tableHeaders={["Station ID", "Station Name", "No. Of Slot",  "Added Date & Time", "Action"]} 
                            listData={bikeList}
                            keyMapping={[
                                { key : 'station_id', label: 'Station ID' },
                                { key : 'station_name', label: 'Station Name' },
                                { key : 'number_of_slot', label: 'No. Of Slot' },                                
                                { key : 'created_at', label: 'Added Date & Time', format : (date) => moment(date).format('DD MMM YYYY') },
                            ]}
                            pageHeading="Swipe Station List"
                        />
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                    </>
                )
            }
        </div>
    );
};
export default EVStationList;