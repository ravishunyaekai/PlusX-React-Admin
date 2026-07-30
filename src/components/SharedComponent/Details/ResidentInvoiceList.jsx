import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './details.module.css';
import Eye from '../../../assets/images/ViewEye.svg';
import moment from 'moment';

const ResidentInvoiceList = ({ title, headers, bookingData }) => {
    const navigate = useNavigate();
    const handleViewClick = (id) => {
         
        navigate(`/community/invoice-details/${id}`);
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
                                <td>{booking.invoice_id}</td>
                                <td>{booking.resident_name}</td>
                                <td>{booking.community_name}</td>
                                <td>{booking.area_name}</td>
                                <td>{booking.kwh_allocated}</td>
                                <td>{ Number(booking.total_consumption || 0).toFixed(2) }</td>
                                <td>{ Number(booking.per_kwh_charge || 0).toFixed(2) }</td>
                                <td>{ Number(booking.energy_price_total || 0).toFixed(2) }</td>
                                <td>{ Number(booking.extra_charge_total || 0).toFixed(2) }</td>
                                <td>{ Number(booking.total_amount || 0).toFixed(2) }</td>
                                <td>{booking.invoice_status}</td>
                                <td>
                                    <div className={styles.editContent}>
                                        <img
                                            src={Eye}
                                            alt="Eye"
                                            onClick={() => handleViewClick(booking.invoice_id)}
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

export default ResidentInvoiceList;
