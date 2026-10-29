import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './details.module.css';
import Eye from '../../../assets/images/ViewEye.svg';
// import Pagination from '../Pagination/Pagination';

const DeatilsBookingHistory = ({ title, headers, bookingData, bookingType, count }) => {
    const navigate = useNavigate();

    const detailsObject = {
        'portableCharger'       : { detail_url : '/portable-charger/charger-booking-details' },
        'pickAndDrop'           : { detail_url : '/pick-and-drop/booking-details' },
        'Roadside Assistance'   : { detail_url : '/ev-road-assistance/booking-details' },
        'Customer Package List' : { detail_url : '/vendors/customer-details' }
    }
    const handleViewClick = (id) => {

        navigate(`${ detailsObject[bookingType].detail_url }/${id}`);
    };
    return (
        <div className={styles.addressListContainer}>
            {/* Same count-card style as App Signup List SubHeader; count on left */}
            <div className={styles.bookingHeadCard}>
                {count != null && (
                    <div className={styles.bookingHeadCardNumber}>{count}</div>
                )}
                <div className={styles.bookingHeadCardText}>{title}</div>
            </div>
            <table className={`table ${styles.customTable}`}>
                <thead>
                    <tr>
                        { headers.map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {bookingData.length > 0 ? (
                        bookingData.map((booking, index) => (
                            <tr key={index}>
                                {bookingType == 'Customer Package List' ? (<>
                                    <td>{booking.vendor_name}</td>
                                    <td>{booking.emirate}</td>                            
                                    <td>{booking.makeModel}</td>
                                    <td>{booking.purchase_date}</td>
                                    <td>{booking?.service_package}</td>
                                </>) : (<>
                                    <td>{booking.datetime}</td>
                                    <td>{booking.id}</td>                            
                                    <td>{booking.price}</td>
                                    <td>{booking.status}</td>
                                    <td>{booking?.rsa_name}</td>
                                </>)}
                                <td>
                                    <div className={styles.editContent}>
                                        <img
                                            src={Eye}
                                            alt="Eye"
                                            onClick={() => handleViewClick(booking.id)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={headers.length} className={styles.noData}>
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {/* Pagination */}
            {/* {currentItems.length > 0 && 
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            } */}
        </div>
    );
};

export default DeatilsBookingHistory;
