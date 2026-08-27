import React from 'react';
import styles from './details.module.css';

const statusLabels = { 0: 'In-active', 1: 'Active' };

const ResidentList = ({ currentItems }) => {
    return (
        <div className={styles.addressListContainer}>
            <span className={styles.sectionTitle}>Resident List</span>
            <table className={`table ${styles.customTable}`}>
                <thead>
                    <tr>
                        <th>Sr No.</th>
                        <th>Resident ID</th>
                        <th>Resident Name</th>
                        <th>Mobile</th>
                        <th>Email</th>
                        <th>Session Allocated</th>
                        <th>Session Used</th>
                        <th>kWh Allocated</th>
                        <th>kWh Used</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((resident, index) => (
                            <tr key={resident.resident_id ?? index}>
                                <td>{index + 1}</td>
                                <td>{resident.resident_id}</td>
                                <td>{resident.resident_name}</td>
                                <td>{resident.resident_mobile}</td>
                                <td>{resident.resident_email}</td>
                                <td>{resident.monthly_session_allocation}</td>
                                <td>{resident.session_used}</td>
                                <td>{resident.kwh_allocated}</td>
                                <td>{resident.kwh_used}</td>
                                <td>{statusLabels[resident.status] ?? resident.status}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="10" className={styles.noData}>No Data Available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ResidentList;
