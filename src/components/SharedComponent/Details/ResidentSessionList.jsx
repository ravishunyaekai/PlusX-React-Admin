import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './details.module.css';
import Eye from '../../../assets/images/ViewEye.svg';
import moment from 'moment';

const ResidentSessionList = ({ title, headers, bookingData }) => {
    const navigate = useNavigate();
    const handleViewClick = (id) => {
         
        navigate(`/community/session-detail/${id}`);
    };
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
                                <td>{moment(booking.created_at).format('DD MMM YYYY')}</td>
                                <td>{booking.booking_id}</td>
                                <td>{booking.resident_name}</td>
                                <td>{booking.area_name}</td>
                                <td>{booking.charger_id}</td>
                                <td>{booking.total_consumption}</td>
                                <td>{booking.total_duration}</td>
                                <td>{booking.status}</td>
                                <td>
                                    <div className={styles.editContent}>
                                        <img
                                            src={Eye}
                                            alt="Eye"
                                            onClick={() => handleViewClick(booking.booking_id)}
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
        </div>
    );
};

export default ResidentSessionList;
