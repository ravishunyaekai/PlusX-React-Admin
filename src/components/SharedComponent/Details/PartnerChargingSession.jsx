import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './details.module.css';
import Eye from '../../../assets/images/ViewEye.svg';
import moment from 'moment';

const PartnerChargingSession = ({ title, headers, bookingData }) => {
    const navigate = useNavigate();
    const handleViewClick = (id) => {
         
        navigate(`/partner/session-detail/${id}`);
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
                                {/* <td>{moment(booking.created_at).format('DD MMM YYYY')}</td> */}
                                <td>{booking.session_id}</td>
                                <td>{booking.start_date}</td>
                                <td>{booking.end_date}</td>
                                <td>{booking.duration}</td>
                                <td>{booking.emergy}</td>
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

export default PartnerChargingSession;
