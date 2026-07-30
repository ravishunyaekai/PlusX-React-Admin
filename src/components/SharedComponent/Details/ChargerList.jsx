import React, { useEffect, useState } from 'react';
import styles from './details.module.css';
import Pagination from '../Pagination/Pagination';

const DetailsList = ({ currentItems }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages]   = useState(1);
    const itemsPerPage                  = 5;

    console.log(currentItems);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    return (
        <div className={styles.addressListContainer}>
            <span className={styles.sectionTitle}>Charger List</span>
            <table className={`table ${styles.customTable}`}>
                <thead>
                    <tr>
                        <th>Sr No.</th>
                        <th>Charger ID</th>
                        <th>kW</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((address, index) => (
                            <tr key={index}>
                                <td>{(index+1)}</td>
                                <td>{address.charger_id}</td>
                                <td>{address.kw}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="12" className={styles.noData}>No Data Available</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* {currentItems.length > 0 &&  
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={handlePageChange} 
                />
            }             */}
        </div>
    );
};

export default DetailsList;
