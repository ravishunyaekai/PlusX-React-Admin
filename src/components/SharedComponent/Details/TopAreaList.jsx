import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './details.module.css';
import Eye from '../../../assets/images/ViewEye.svg';
// import Pagination from '../Pagination/Pagination';

const TopAreaList = ({ title, headers, bookingData, currentPage, totalPages, handlePageChange }) => {
    const navigate = useNavigate();
    const handlePageChangeA = (page) => {
        handlePageChange(page);
    }
    return (
        <div className={styles.addressListContainer}>
            <span className={styles.sectionsTitle}>{title}</span>
            <table className={`table ${styles.customTable}`}>
                <thead>
                    <tr>
                        { headers.map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    { bookingData.length > 0 ? (
                        bookingData.map((booking, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{booking.area_name}</td>
                                <td>{booking.booking_count}</td>
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
            
        </div>
    );
};

export default TopAreaList;
