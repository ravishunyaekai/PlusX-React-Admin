import React, { useEffect, useState } from 'react';
import List from '../../../SharedComponent/List/List'
import styles from '../ShopList/addshoplist.module.css'
import Edit from '../../../../assets/images/Pen.svg';
import Delete from '../../../../assets/images/Delete.svg';
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../../../api/Requests';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import ModalAssign from '../../../SharedComponent/BookingDetails/ModalAssign'
import Loader from "../../../SharedComponent/Loader/Loader";
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';

const dynamicFilters = [
    // { label: 'Service Name', name: 'search', type: 'text' },
]

const addButtonProps = {
    heading: "Add Service", 
    link: "/add-service"
};

const ServiceList = () => {
    const userDetails                                = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                                   = useNavigate();
    const [serviceList, setServiceList]              = useState([]);
    const [currentPage, setCurrentPage]              = useState(1);
    const [totalPages, setTotalPages]                = useState(1);
    const [totalCount, setTotalCount]                = useState(1);
    const [filters, setFilters]                      = useState({start_date: null,end_date: null});
    const [refresh, setRefresh]                      = useState(false);
    const [selectedServiceId, setSelectedServiceId]  = useState(null);
    const [showPopup, setShowPopup]                  = useState(false);
    const [name, setName]                            = useState("");
    const [loading, setLoading]                      = useState(false);
    const searchTerm = [
        {
            label: 'search', 
            name: 'search_text', 
            type: 'text'
        }
    ]

    const handleEditClick = (serviceId, name) => {
        setSelectedServiceId(serviceId);
        setName(name)
        console.log(serviceId,name);
        setShowPopup(true); 
      };
    
      const handleClosePopup = () => {
        setShowPopup(false); 
        setSelectedServiceId(null);
        setName(null)
      };
    
      const handleNameChange = (e) => {
        setName(e.target.value); 
      };
    
      const handleConfirmEdit = () => {
        if (!name.trim()) {
            toast("Please enter a name.", {type:'error'})
            return;
          }
       
        const obj = {
            userId       : userDetails?.user_id,
            email        : userDetails?.email,
            service_id   : selectedServiceId,
            service_name : name
        };
    
        postRequestWithToken('shop-service-update', obj, async (response) => {
            if (response.code === 200) {
                toast(response.message, {type:'success'})
                    setTimeout(() => {
                        fetchList(currentPage, filters);
                        
                        // setRefresh(prev => !prev);
                    }, 1000);
                setShowPopup(false);
                setSelectedServiceId(null);
                setName(null)
            } else {
                toast(response.message, {type:'error'})
                console.log('error in shop-brand-update api', response);
            }
        });
        
      };

      const handleDeleteBrand = (serviceId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this?");
        if (confirmDelete) {
            const obj = { 
                userId     : userDetails?.user_id,
                email      : userDetails?.email,
                service_id : serviceId 
            };
            postRequestWithToken('shop-service-delete', obj, async (response) => {
                if (response.code === 200) {
                    fetchList(currentPage, filters);
                    // setRefresh(prev => !prev);
                    toast(response.message, { type: "success" });
                } else {
                    toast(response.message, { type: 'error' });
                    console.log('error in shop-service-delete api', response);
                }
            });
        }
    };

    const fetchList = (page, appliedFilters = {}) => {
        if (page === 1 && Object.keys(appliedFilters).length === 0) {
            setLoading(false);
        } else {
            setLoading(true);
        }

        const obj = {
            userId : userDetails?.user_id,
            email   : userDetails?.email,
            page_no : page,
            ...appliedFilters,
        }

        postRequestWithToken('shop-service-list', obj, async(response) => {
            if (response.code === 200) {
                setServiceList(response?.data)
                setTotalPages(response?.total_page || 1); 
                setTotalCount(response?.total || 1)
            } else {
                // toast(response.message, {type:'error'})
                console.log('error in shop-service-list api', response);
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

    return (
        <div className='main-container'>
            <ToastContainer />
            <SubHeader heading = "Ev Specialized Shop Service List"
                fetchFilteredData={fetchFilteredData} 
                dynamicFilters={dynamicFilters} filterValues={filters}
                addButtonProps={addButtonProps}
                searchTerm = {searchTerm}
                count = {totalCount}
                modalTitle = 'Shop Service'
                setRefresh = {setRefresh}
                apiEndPoint = 'shop-service-create'
                nameKey = 'service_name'
                fetchList = {fetchList}
            />

            {loading ? <Loader /> : 
                serviceList?.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Service ID", "Service Name", "Created Time", "Action",""]}
                        message="No data available"
                    />
                ) : (
                <>
                    <List 
                        tableHeaders={["Service ID", "Service Name", "Created Time", "Action",""]}
                        listData = {serviceList}
                        keyMapping={[
                            { key: 'service_id', label: 'Service ID' }, 
                            { key: 'service_name', label: 'Service Name' }, 
                            { 
                                key: 'created_at', 
                                label: 'Created Time', 
                                format: (date) => moment(date).format('DD MMM YYYY h:mm A') 
                            } ,
                            {
                                key: 'action',
                                label: 'Action',
                                relatedKeys: ['service_id'], 
                                format: (data, relatedKeys) => {
                                    return (
                                    
                                        <div className='listAction'>
                                            <img 
                                                src={Edit} 
                                                alt="edit" 
                                                onClick={() => {
                                                    handleEditClick(data.service_id, data.service_name);
                                                }} 
                                            />
                                            <img 
                                                src={Delete} 
                                                alt="delete" 
                                                onClick={() => {
                                                    handleDeleteBrand(data.service_id);
                                                }} 
                                                
                                            />
                                            </div>
                                    
                                    );
                                }
                            }
                        
                        ]}
                        pageHeading="Shop Service List"
                    />
                    
                    <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={handlePageChange} 
                    />
                </>
            )}

            {showPopup && (
                <ModalAssign
                    isOpen={showPopup}
                    onClose={handleClosePopup}
                    onAssign={handleConfirmEdit}
                    buttonName = 'Submit'
                >
                    <div className="modalHeading">Shop Service</div>
                    <input
                        id="name"
                        placeholder="Brand Name"
                        className="modal-textarea"
                        rows="4"
                        value={name} 
                        onChange={handleNameChange}
                    />
                </ModalAssign>
            )}
        </div>
    );
};

export default ServiceList;
