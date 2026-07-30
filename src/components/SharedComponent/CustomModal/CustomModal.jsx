import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './custommodal.module.css';

const Custommodal = ({ isOpen, onClose, driverList, onSelectDriver, bookingId, onAssignDriver }) => {
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  if (!isOpen) return null;

  const getStatusLabel = (status) => {
    if (status === 0) return "In-Active";
    if (status === 1) return "Un-Available";
    if (status === 2) return "Available";
    return "Unknown";
};

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          Select Driver <span>( {bookingId} )</span>
        </div>
        <div className={styles.driverSelect}>
          <select
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onBlur={() => setIsDropdownOpen(false)}
            // onChange={(e) => onSelectDriver(e.target.value)}
            onChange={(e) => {
              const driverId = e.target.value;
              onSelectDriver(driverId); 
              setSelectedDriver(driverId);
          }}
          >
            <option value="" disabled selected>Select</option>
            {driverList.map((driver, index) => (
              <option key={index} value={driver.rsa_id} disabled={driver.isUnavailable}>
                {/* {driver.rsa_name} {driver.isUnavailable ? '(Unavailable)' : ''} */}
                {driver.rsa_name} ({getStatusLabel(driver.status)})
              </option>
            ))}
          </select>
          <span className={styles.dropdownIcon}>
            {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
          <button className={styles.assignBtn} 
          onClick={onAssignDriver}
          disabled={!selectedDriver}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default Custommodal;
