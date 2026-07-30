import React, { useEffect, useState } from 'react';
import List from '../SharedComponent/List/List'
import styles from './addcar.module.css'
import SubHeader from '../SharedComponent/SubHeader/SubHeader'
import Pagination from '../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Loader from "../SharedComponent/Loader/Loader";
import EmptyList from '../SharedComponent/EmptyList/EmptyList';

const dynamicFilters = [
    // { label: 'Car Name', name: 'search_text', type: 'text' },
    // { label: 'Emergency Team Name', name: 'rsa_name', type: 'text' },
    // { label: 'Emergency Team Email', name: 'rsa_email', type: 'text' },
    // { label: 'Emergency Team Mobile', name: 'rsa_mobile', type: 'text' },
]

const CarList = () => {
    const userDetails                   = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                      = useNavigate();
    const [carList, setCarList]         = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages]   = useState(1);
    const [totalCount, setTotalCount]   = useState(1);
    const [filters, setFilters]         = useState({start_date: null,end_date: null});
    const [refresh, setRefresh]         = useState(false);
    const [loading, setLoading]         = useState(false);
    const searchTerm = [
        {
            label: 'search', 
            name: 'search_text', 
            type: 'text'
        }
    ]

    const addButtonProps = {
        heading: "Add Electric Car", 
        link: "/electric-car-leasing/add-electric-car"
    };

    const fetchList = (page, appliedFilters = {}) => {
        if (page === 1 && Object.keys(appliedFilters).length === 0) {
            setLoading(false);
        } else {
            setLoading(true);
        } 

        const obj = {
            userId : userDetails?.user_id,
            email : userDetails?.email,
            page_no : page,
            ...appliedFilters,
        }

        postRequestWithToken('electric-cars-list', obj, async(response) => {
            if (response.code === 200) {
                setCarList(response?.data)
                setTotalPages(response?.total_page || 1); 
                setTotalCount(response?.total)
            } else {
                // toast(response.message, {type:'error'})
                console.log('error in electric-cars-list api', response);
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

    const handleDeleteSlot = (rentalId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this?");
        if (confirmDelete) {
            const obj = { 
                userId : userDetails?.user_id,
                email : userDetails?.email,
                rental_id: rentalId 
            };
            postRequestWithToken('electric-car-delete', obj, async (response) => {
                if (response.code === 200) {
                    toast(response.message, { type: "success" });
                    setTimeout(() => {
                        setRefresh(prev => !prev);
                    },1000)
                } else {
                    toast(response.message, { type: 'error' });
                    console.log('error in delete-rider api', response);
                }
            });
        }
    };

    return (
        <div className='main-container'>
            <ToastContainer />
            <SubHeader heading = "Electric Cars Leasing List" 
                addButtonProps={addButtonProps}
                fetchFilteredData={fetchFilteredData} 
                dynamicFilters={dynamicFilters} filterValues={filters}
                searchTerm = {searchTerm}
                count = {totalCount}
            />

            {loading ? <Loader /> :
                carList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Car ID", "Car Name", "Available On", "Car Type", "Price", "Contract", "Action"]}
                        message="No data available"
                    />
                ) : (
                <>
                    <List 
                        tableHeaders={["Car ID", "Car Name", "Available On", "Car Type", "Price", "Contract", "Action"]}
                        listData = {carList}
                        keyMapping={[
                        { key: 'rental_id', label: 'Car ID' }, 
                        { key: 'car_name', label: 'Car Name' },
                        { 
                            key: 'available_on', 
                            label: 'Available On',  
                        },
                        { key: 'car_type', label: 'Car Type' },
                        { key: 'price', label: 'Price' },
                        { key: 'contract', label: 'Contract' },
                        ]}
                        pageHeading="Electric Cars Leasing List"
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

export default CarList;
