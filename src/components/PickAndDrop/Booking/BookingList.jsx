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
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList.jsx';

const statusMapping = {
    'CNF': 'Booking Confirmed',
    'A'  : 'Assigned',
    'RL' : 'POD Reached at Location',
    'CS' : 'Charging Started',
    'CC ': 'Charging Completed',
    'PU' : 'POD Picked Up',
    'WC' : 'Work Completed',
    'C'  : 'Cancelled'
};

const dynamicFilters = [
    {
        label: 'Status', 
        name: 'order_status', 
        type: 'select', 
        options: [
            { value: '', label: 'Select Status' },
            { value: 'CNF', label: 'Booking Confirmed' },
            { value: 'A', label: 'Assigned' },
            { value: 'VP', label: 'Vehicle Pickup' },
            { value: 'RS', label: 'Reached Charging Spot' },
            { value: 'CC', label: 'Charging Completed' },
            { value: 'DO', label: 'Drop Off' },
            { value: 'WC', label: 'Work Completed' },
            { value: 'C', label: 'Cancelled' },
        ]
    },
]

const BookingList = () => {
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
    const [selectedRiderId, setSelectedRiderId]       = useState(null);
    const [loading, setLoading]                       = useState(false);
    const [rowOptions, setRowOptions]    = useState([10, 25, 50, 100]);
    const [rowSelected, setARowSelected] = useState(10);

    const searchTerm = [
        {
            label : 'search', 
            name  : 'search_text', 
            type  : 'text'
        }
    ]
    const [showPopup, setShowPopup] = useState(false);
    const [reason, setReason]       = useState("");  
    const handlePDBookingDetails    = (id) => navigate(`/pick-and-drop/booking-details/${id}`)

    const handleCancelClick = (bookingId, riderId) => {
        setSelectedBookingId(bookingId);
        setSelectedRiderId(riderId)
        setShowPopup(true); 
    };
    const handleClosePopup = () => {
        setShowPopup(false); 
        setSelectedBookingId(null);
        setSelectedRiderId(null)
        setReason("");
    };
    const handleReasonChange = (e) => {
        setReason(e.target.value); 
    };
    const handleConfirmCancel = () => {
        if (!reason.trim()) {
            toast("Please enter a reason for cancellation.", {type:'error'})
            return;
        }
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            booking_id : selectedBookingId,
            rider_id   : selectedRiderId,
            reason     : reason
        };
        postRequestWithToken('charging-service-cancel', obj, async (response) => {
            if (response.code === 200) {
                toast(response.message[0], {type:'success'})
                    setTimeout(() => {
                        fetchList(currentPage, filters);
                    }, 1500);
                setShowPopup(false);
                setSelectedBookingId(null);
                setSelectedRiderId(null)
            } else {
                toast(response.message, {type:'error'})
                console.log('error in charger-booking-list api', response);
            }
        });
    };
    const fetchList = (page, appliedFilters = {}, rowSelected=10) => {
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
            rowSelected,
        }
        postRequestWithToken('pick-and-drop-booking-list', obj, async(response) => {
            if (response.code === 200) {
                setChargerBookingList(response?.data)
                setTotalPages(response?.total_page || 1); 
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
        fetchList(currentPage, filters, rowSelected);
    }, [currentPage, filters, rowSelected]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);  
        setCurrentPage(1); 
    };
    const openModal = (bookingId) => {
        const rsaObj = {
            userId       : userDetails?.user_id,
            email        : userDetails?.email,
            service_type : 'Valet Charging',
        };
        postRequestWithToken('all-rsa-list', rsaObj, async(response) => {
            if (response.code === 200) {
                setRsaList(response?.data)
            } else {
                // toast(response.message, {type:'error'})
                console.log('error in public-charger-station-list api', response);
            }
        })
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
                toast(response.message || response.message[0], {type:'success'})
                setTimeout(() => {
                    fetchList(currentPage, filters);
                }, 1000);
            } else {
                toast(response.message, {type:'error'})
                console.log('error in /pick-and-drop-assign api', response);
            }
        })
    }
    const handleRowperPagePage = (limit) => {
        setARowSelected(limit);
    };
    return (
        <div className='main-container'>
            <ToastContainer/>
            <SubHeader 
                heading              = "Pick & Drop Booking List"
                fetchFilteredData    = {fetchFilteredData} 
                dynamicFilters       = {dynamicFilters} filterValues={filters}
                searchTerm           = {searchTerm}
                rowOptions           = {rowOptions}
                rowSelected          = {rowSelected}
                handleRowperPagePage = {handleRowperPagePage}
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
                            tableHeaders={["Booking Date", "Booking ID", "Customer Name", "Price", "Status", "Driver Name", "Driver Assign", "Action",""]}
                            listData = {chargerBookingList}
                            keyMapping={[
                                { 
                                    key: 'created_at', 
                                    label: 'Invoice Date', 
                                    format: (date) => moment(date).format('DD MMM YYYY ') 
                                } ,
                                // { key: 'request_id', label: 'ID' }, 
                                {
                                    key         : 'request_id',
                                    label       : 'ID',
                                    relatedKeys : ['rescheduled_booking'],
                                    format : (data, key, relatedKeys) => {
                                        const bookingId = data[key];
                                        const isRescheduled = data[relatedKeys[0]];
                                    
                                        return (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span>{bookingId}</span>
                                            {isRescheduled > 0 && (
                                                <span
                                                    style={{
                                                    backgroundColor: '#00ffc3',
                                                    color: '#000',
                                                    borderRadius: '4px',
                                                    padding: '2px 6px',
                                                    fontSize: '0.75rem',
                                                    marginTop: '4px',
                                                    display: 'inline-block',
                                                    width: 'fit-content'
                                                    }}
                                                >
                                                    Rescheduled
                                                </span>
                                            )}
                                        </div>
                                        );
                                    }
                                },
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
                                { key: 'rsa_name', label: 'Driver Name' }, 
                                {
                                    key: 'driver_assign',
                                    label: 'Driver Assign',
                                    relatedKeys: ['order_status'], 
                                    format: (data, key, relatedKeys) => {
                                        const isBookingConfirmed = data[relatedKeys[0]] === 'CNF'; 
                                        
                                        return userDetails.departmentId == 1 && isBookingConfirmed ? (
                                            <img 
                                                src={AddDriver} 
                                                className={"logo"} 
                                                onClick={() => openModal(data.request_id)} 
                                                alt="Assign Driver" 
                                            />
                                        ) : null;
                                    }
                                },
                                {
                                    key: 'action',
                                    label: 'Action',
                                    relatedKeys: ['order_status'], 
                                    format: (data, key, relatedKeys) => {
                                        const isCancelable = !['C', 'WC'].includes(data[relatedKeys[0]]);

                                        return (
                                            <div className="editButtonSection">
                                                {/* View Button (Always Displayed) */}
                                                <img 
                                                    src={View} 
                                                    alt="view" 
                                                    onClick={() => handlePDBookingDetails(data.request_id)} 
                                                    className="viewButton" 
                                                />
                                
                                                {/* Cancel Button (Displayed Conditionally) */}
                                                { isCancelable && userDetails.departmentId == 1 && (
                                                    <img 
                                                        src={Cancel} 
                                                        alt="cancel" 
                                                        onClick={() => handleCancelClick(data.request_id, data.rider_id)} 
                                                        className="viewButton" 
                                                    />
                                                )}
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
                )}

                <Custommodal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    driverList={rsaList}
                    bookingId = {selectedBookingId}
                    onSelectDriver={handleDriverSelect}
                    onAssignDriver={assignDriver}
                />

            {showPopup && (
                <ModalAssign
                    isOpen={showPopup}
                    onClose={handleClosePopup}
                    onAssign={handleConfirmCancel}
                    buttonName = 'Submit'
                >
                    <div className="modalHeading">Reason for Cancellation</div>
                    <textarea
                         className="modal-textarea"
                        id="reason"
                        placeholder="Enter reason"
                        rows="4"
                        value={reason} 
                        onChange={handleReasonChange}
                                
                    />
                </ModalAssign>
            )}
        </div>
    );
};

export default BookingList;
